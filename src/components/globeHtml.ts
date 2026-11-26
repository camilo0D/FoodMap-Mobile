// Página con MapLibre GL JS 5 (proyección de globo). La usan el navegador (iframe)
// y Android (WebView). Habla con la app con mensajes JSON.
export const HTML_GLOBO = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>
<style>
  html, body, #mapa { margin: 0; height: 100%; width: 100%; background: #0b1226; overflow: hidden; font-family: system-ui, sans-serif; }
  .pin { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.45); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .yo { width: 18px; height: 18px; border-radius: 50%; background: #2F7CF6; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(47,124,246,.25); }
  #aviso { position: absolute; left: 0; right: 0; top: 46%; text-align: center; color: #cbd5ff; font-size: 14px; padding: 0 24px; pointer-events: none; }
</style>
</head>
<body>
<div id="mapa"></div>
<div id="aviso">Cargando el globo…</div>
<script>
  var mapa = null, listo = false, marcadores = [], yoMarker = null;

  function enviar(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage(s, "*");
  }

  function vacio() { return { type: "FeatureCollection", features: [] }; }

  function circulo(lat, lng, radio) {
    var R = 6378137, pasos = 64, coords = [], latR = lat * Math.PI / 180;
    for (var i = 0; i <= pasos; i++) {
      var ang = i / pasos * 2 * Math.PI;
      var dLat = radio * Math.cos(ang) / R;
      var dLng = radio * Math.sin(ang) / (R * Math.cos(latR));
      coords.push([lng + dLng * 180 / Math.PI, lat + dLat * 180 / Math.PI]);
    }
    return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
  }

  function iniciar() {
    if (!window.maplibregl) {
      document.getElementById("aviso").textContent = "No pudimos cargar el globo. Revisa tu conexión.";
      return;
    }
    mapa = new maplibregl.Map({
      container: "mapa",
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors" } },
        layers: [{ id: "osm", type: "raster", source: "osm" }]
      },
      center: [-60, 8],
      zoom: 1.4,
      attributionControl: { compact: true }
    });
    mapa.on("style.load", function () {
      try { mapa.setProjection({ type: "globe" }); } catch (e) {}
    });
    mapa.on("load", function () {
      document.getElementById("aviso").style.display = "none";
      mapa.addSource("radio", { type: "geojson", data: vacio() });
      mapa.addLayer({ id: "radio-relleno", type: "fill", source: "radio", paint: { "fill-color": "#F26A21", "fill-opacity": 0.2 } });
      mapa.addLayer({ id: "radio-borde", type: "line", source: "radio", paint: { "line-color": "#F26A21", "line-width": 2, "line-dasharray": [2, 2] } });
      listo = true;
      enviar({ tipo: "listo" });
    });
  }

  // La app envía el estado completo: restaurantes, selección, radio, ubicación y color.
  window.recibir = function (d) {
    if (!mapa || !listo) return;
    marcadores.forEach(function (m) { m.remove(); });
    marcadores = [];
    (d.restaurantes || []).forEach(function (r) {
      var el = document.createElement("div");
      el.className = "pin";
      el.style.background = r.id === d.seleccionadoId ? "#D83A1B" : d.color;
      el.textContent = "🍽";
      el.addEventListener("click", function (ev) { ev.stopPropagation(); enviar({ tipo: "seleccion", id: r.id }); });
      marcadores.push(new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).addTo(mapa));
    });

    if (yoMarker) { yoMarker.remove(); yoMarker = null; }
    if (d.ubicacion) {
      var e2 = document.createElement("div");
      e2.className = "yo";
      yoMarker = new maplibregl.Marker({ element: e2 }).setLngLat([d.ubicacion.lng, d.ubicacion.lat]).addTo(mapa);
    }

    mapa.setPaintProperty("radio-relleno", "fill-color", d.color);
    mapa.setPaintProperty("radio-borde", "line-color", d.color);
    var fuente = mapa.getSource("radio");
    if (fuente) fuente.setData(d.seleccion && d.radioM ? circulo(d.seleccion.lat, d.seleccion.lng, d.radioM) : vacio());

    if (d.accion === "seleccion" && d.seleccion) mapa.flyTo({ center: [d.seleccion.lng, d.seleccion.lat], zoom: 12.5, duration: 1600 });
    if (d.accion === "yo" && d.ubicacion) mapa.flyTo({ center: [d.ubicacion.lng, d.ubicacion.lat], zoom: 12.5, duration: 1600 });
    if (d.accion === "inicio") mapa.flyTo({ center: [-60, 8], zoom: 1.4, duration: 1600 });
  };

  iniciar();
</script>
</body>
</html>`;