#!/usr/bin/env node
/*
 * Migra las pantallas .tsx al sistema de temas (modo oscuro + color de acento).
 *   node scripts/migrar-tema.js            -> aplica los cambios
 *   node scripts/migrar-tema.js --simular  -> solo muestra qué cambiaría
 */
const fs = require("fs");
const path = require("path");

const RAIZ = process.cwd();
const SIMULAR = process.argv.includes("--simular");

function* archivos(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === "node_modules" || e.name === "theme") continue;
            yield* archivos(p);
        } else if (p.endsWith(".tsx")) {
            yield p;
        }
    }
}

function cierreParentesis(texto, abre) {
    let prof = 0;
    for (let i = abre; i < texto.length; i++) {
        if (texto[i] === "(") prof++;
        else if (texto[i] === ")") {
            prof--;
            if (prof === 0) return i;
        }
    }
    return -1;
}

// Devuelve [{ pos, fin }] con el cuerpo de cada componente de nivel superior.
function cuerpos(texto) {
    const res = [];
    const re = /^(?:export default )?function\s+([A-Z]\w*)\s*\(/gm;
    let m;
    while ((m = re.exec(texto))) {
        const abre = m.index + m[0].length - 1;
        const cierra = cierreParentesis(texto, abre);
        if (cierra === -1) continue;
        const llave = texto.indexOf("{", cierra);
        if (llave === -1) continue;
        const rel = texto.slice(llave).search(/\n\}(\n|$)/);
        const fin = rel === -1 ? texto.length : llave + rel;
        res.push({ pos: llave + 1, fin });
    }
    return res;
}

function migrar(original) {
    if (/\bthemed\(/.test(original) || /\buseColors\b/.test(original)) return { nota: "ya migrado" };
    const imp = original.match(/import\s*\{([^}]*)\}\s*from\s*"((?:\.\.?\/)+theme)";?/);
    if (!imp) return { nota: "no importa el tema" };
    const nombres = imp[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (!nombres.includes("colors")) return { nota: "no usa colors" };

    let t = original;

    // 1) colores fijos -> colores del tema
    t = t.replace(/"#FBE3D3"|"#F3E4D6"/g, "colors.primarySoft");
    t = t.replace(/backgroundColor:\s*"#fff"/g, "backgroundColor: colors.surface");

    // 2) StyleSheet.create({...}) -> themed((colors) => ({...}))
    const marca = "const styles = StyleSheet.create({";
    const ini = t.indexOf(marca);
    let hayEstilos = false;
    if (ini !== -1) {
        const fin = t.indexOf("\n});", ini);
        if (fin !== -1) {
            t =
                t.slice(0, ini) +
                "const useStyles = themed((colors) => ({" +
                t.slice(ini + marca.length, fin) +
                "\n}));" +
                t.slice(fin + 4);
            hayEstilos = true;
        }
    }

    // 3) en cada componente: const styles = useStyles(); const colors = useColors();
    const lista = cuerpos(t);
    const inserciones = [];
    for (const c of lista) {
        const cuerpo = t.slice(c.pos, c.fin);
        const usaStyles = hayEstilos && /\bstyles\b/.test(cuerpo);
        const usaColors = /\bcolors\b/.test(cuerpo);
        if (usaStyles || usaColors) inserciones.push({ pos: c.pos, usaStyles, usaColors });
    }
    inserciones.sort((a, b) => b.pos - a.pos);
    for (const i of inserciones) {
        let add = "";
        if (i.usaStyles) add += "\n  const styles = useStyles();";
        if (i.usaColors) add += "\n  const colors = useColors();";
        t = t.slice(0, i.pos) + add + t.slice(i.pos);
    }

    // 4) import del tema
    const nuevos = nombres.filter((n) => n !== "colors");
    if (hayEstilos) nuevos.push("themed");
    if (inserciones.some((i) => i.usaColors)) nuevos.push("useColors");
    t = t.replace(imp[0], () => `import { ${nuevos.join(", ")} } from "${imp[2]}";`);

    // 5) aviso: "colors" usado fuera de un componente
    let resto = t;
    const iE = resto.indexOf("const useStyles = themed(");
    if (iE !== -1) {
        const fE = resto.indexOf("\n}));", iE);
        resto = resto.slice(0, iE) + resto.slice(fE + 5);
    }
    resto = resto.replace(/import[^;]*;/g, "");
    const bloques = cuerpos(resto).sort((a, b) => b.pos - a.pos);
    for (const b of bloques) resto = resto.slice(0, b.pos) + resto.slice(b.fin);
    const aviso = /\bcolors\b/.test(resto) ? "usa «colors» fuera de un componente: revísalo a mano" : null;

    return { src: t, aviso };
}

const archivosTsx = [...archivos(path.join(RAIZ, "src"))];
let cambiados = 0;
const avisos = [];
for (const f of archivosTsx) {
    const original = fs.readFileSync(f, "utf8");
    const r = migrar(original);
    const rel = path.relative(RAIZ, f);
    if (!r.src) {
        console.log(`  = ${rel}  (${r.nota})`);
        continue;
    }
    cambiados++;
    console.log(`  ✓ ${rel}`);
    if (r.aviso) avisos.push(`${rel}: ${r.aviso}`);
    if (!SIMULAR) fs.writeFileSync(f, r.src, "utf8");
}
console.log(`\n${SIMULAR ? "Se cambiarían" : "Se migraron"} ${cambiados} archivo(s).`);
if (avisos.length) {
    console.log("\nRevisar a mano:");
    avisos.forEach((a) => console.log("  ! " + a));
}