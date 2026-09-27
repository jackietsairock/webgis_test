import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import * as THREE from 'three';
import { outline, events, types, circle } from './data.js';
import 'maplibre-gl/dist/maplibre-gl.css';

// Bundle the worker and its shared dependencies for both Vite dev and production.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

export function createMap(onSelect, onStatus) {
  const collection = (features) => ({ type: 'FeatureCollection', features });
  const land = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [outline] },
  };
  const grid = [];
  for (let x = 117; x <= 126; x += 0.5)
    grid.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [x, 19],
          [x, 28],
        ],
      },
    });
  for (let y = 19; y <= 28; y += 0.5)
    grid.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [117, y],
          [126, y],
        ],
      },
    });
  const map = new maplibregl.Map({
    container: 'map',
    center: [121.0, 23.65],
    zoom: 6.65,
    pitch: 40,
    bearing: -12,
    maxPitch: 65,
    minZoom: 5,
    maxZoom: 13,
    attributionControl: false,
    canvasContextAttributes: { antialias: true },
    style: {
      version: 8,
      sources: {
        base: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxzoom: 19,
        },
        land: { type: 'geojson', data: land },
        grid: { type: 'geojson', data: collection(grid) },
        zones: { type: 'geojson', data: collection(events.map(circle)) },
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#0d1c20' } },
        {
          id: 'base',
          type: 'raster',
          source: 'base',
          paint: {
            'raster-opacity': 0.85,
            'raster-saturation': -0.7,
            'raster-brightness-max': 0.45,
          },
        },
        {
          id: 'grid',
          type: 'line',
          source: 'grid',
          paint: { 'line-color': '#4e8273', 'line-opacity': 0.13, 'line-width': 1 },
        },
        {
          id: 'land',
          type: 'fill',
          source: 'land',
          paint: { 'fill-color': '#29443a', 'fill-opacity': 0.25 },
        },
        {
          id: 'coast',
          type: 'line',
          source: 'land',
          paint: { 'line-color': '#698978', 'line-opacity': 0.7, 'line-width': 1.2 },
        },
        {
          id: 'zones',
          type: 'fill',
          source: 'zones',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 },
        },
        {
          id: 'zone-outlines',
          type: 'line',
          source: 'zones',
          paint: {
            'line-color': ['get', 'color'],
            'line-opacity': 0.65,
            'line-width': 1.4,
            'line-dasharray': [3, 3],
          },
        },
      ],
    },
  });
  map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-left');
  const origin = maplibregl.MercatorCoordinate.fromLngLat([121, 23.6]);
  const unit = origin.meterInMercatorCoordinateUnits();
  const project = (lng, lat, z = 0) => {
    const c = maplibregl.MercatorCoordinate.fromLngLat([lng, lat]);
    return [(c.x - origin.x) / unit, -(c.y - origin.y) / unit, z];
  };
  const scene = new THREE.Scene(),
    camera = new THREE.Camera(),
    terrain = new THREE.Group(),
    columns = new THREE.Group();
  scene.add(terrain, columns, new THREE.AmbientLight('#b7dac5', 2));
  const light = new THREE.DirectionalLight('#f4ffe5', 3);
  light.position.set(-100000, 60000, 180000);
  scene.add(light);
  const inside = (x, y) => {
    let b = false;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      const a = outline[i],
        c = outline[j];
      if (a[1] > y !== c[1] > y && x < ((c[0] - a[0]) * (y - a[1])) / (c[1] - a[1]) + a[0]) b = !b;
    }
    return b;
  };
  const height = (x, y) => {
    const ridge = 120.87 + (y - 23.5) * 0.29;
    return (
      800 +
      19000 *
        Math.exp(-(((x - ridge) / 0.23) ** 2)) *
        Math.exp(-(((y - 23.65) / 1.25) ** 4)) *
        (0.62 + 0.38 * Math.abs(Math.sin(y * 18 + x * 21) * Math.cos(x * 16 - y * 9)))
    );
  };
  const positions = [],
    colors = [];
  for (let y = 22; y < 25.25; y += 0.038)
    for (let x = 120.08; x < 121.97; x += 0.038) {
      const pts = [
        [x, y],
        [x + 0.038, y],
        [x, y + 0.038],
        [x + 0.038, y],
        [x + 0.038, y + 0.038],
        [x, y + 0.038],
      ];
      for (let t = 0; t < 6; t += 3) {
        if (pts.slice(t, t + 3).every((p) => inside(...p))) {
          for (const [a, b] of pts.slice(t, t + 3)) {
            const h = height(a, b);
            positions.push(...project(a, b, h));
            const c = new THREE.Color().setHSL(0.39, 0.12, 0.15 + h / 100000);
            colors.push(c.r, c.g, c.b);
          }
        }
      }
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  terrain.add(
    new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    ),
  );
  const wire = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: '#83b194',
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    }),
  );
  terrain.add(wire);
  const groups = new Map();
  events.forEach((e) => {
    const group = new THREE.Group();
    group.position.set(...project(...e.coord, 800));
    const h = e.level === '高' ? 22000 : e.level === '中' ? 14000 : 8500;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1300, 1300, h, 12),
      new THREE.MeshBasicMaterial({ color: types[e.type].color, transparent: true, opacity: 0.8 }),
    );
    body.rotation.x = Math.PI / 2;
    body.position.z = h / 2;
    group.add(body);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(e.radius * 0.64, e.radius * 0.67, 80),
      new THREE.MeshBasicMaterial({
        color: types[e.type].color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    ring.position.z = 500;
    group.add(ring);
    columns.add(group);
    groups.set(e.id, group);
  });
  let renderer;
  const layer = {
    id: 'three-disaster-scene',
    type: 'custom',
    renderingMode: '3d',
    onAdd(m, gl) {
      renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl });
      renderer.autoClear = false;
    },
    render(gl, args) {
      const projection = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      const transform = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .scale(new THREE.Vector3(unit, -unit, unit));
      camera.projectionMatrix = projection.multiply(transform);
      renderer.resetState();
      renderer.render(scene, camera);
    },
    onRemove() {
      geometry.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          if (o.geometry !== geometry) o.geometry.dispose();
          o.material.dispose();
        }
      });
      renderer?.dispose();
    },
  };
  const markers = events.map((e) => {
    const el = document.createElement('button');
    el.className = 'map-pin';
    el.style.setProperty('--pin', types[e.type].color);
    el.setAttribute('aria-label', `查看${e.title}`);
    el.innerHTML = `<span class="pin-core"></span><span class="pin-caption">${types[e.type].label} <b>${e.value}</b></span>`;
    el.onclick = () => onSelect(e.id);
    return {
      id: e.id,
      el,
      marker: new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(e.coord)
        .addTo(map),
    };
  });
  const labels = [
    ['台北 TAIPEI', 121.5, 25.08],
    ['台中 TAICHUNG', 120.5, 24.15],
    ['高雄 KAOHSIUNG', 120.2, 22.63],
    ['花蓮 HUALIEN', 121.73, 23.8],
    ['台東 TAITUNG', 121.2, 22.7],
    ['台 灣 海 峽', 119.6, 23.7],
    ['太 平 洋', 122.35, 23.35],
  ];
  labels.forEach(([name, lng, lat]) => {
    const el = document.createElement('span');
    el.className = 'city-label';
    el.textContent = name;
    new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
  });
  let active = events,
    ranges = true,
    ready = false;
  // Local layers must not wait for external raster tiles to finish loading.
  map.on('style.load', () => {
    map.addLayer(layer);
    ready = true;
    update(active);
    onStatus('ready');
  });
  map.on('error', (e) => {
    if (e.sourceId === 'base') onStatus('offline');
    else console.warn('Map:', e.error?.message);
  });
  function update(list) {
    active = list;
    const ids = new Set(list.map((e) => e.id));
    markers.forEach((m) => (m.el.hidden = !ids.has(m.id)));
    groups.forEach((g, id) => (g.visible = ids.has(id)));
    if (ready) map.getSource('zones').setData(collection(list.map(circle)));
    map.triggerRepaint();
  }
  return {
    map,
    update,
    select(id) {
      markers.forEach((m) => m.el.classList.toggle('selected', m.id === id));
      const e = events.find((e) => e.id === id);
      map.flyTo({
        center: e.coord,
        zoom: 8,
        pitch: map.getPitch() === 0 ? 0 : 50,
        speed: 0.9,
        padding: { right: window.innerWidth > 1100 ? 260 : 0 },
      });
    },
    home() {
      map.flyTo({ center: [121, 23.65], zoom: 6.65, pitch: 40, bearing: -12, padding: 0 });
    },
    setLayer(name, value) {
      if (name === 'terrain') terrain.visible = value;
      if (name === 'columns') columns.visible = value;
      if (name === 'ranges') {
        ranges = value;
        ['zones', 'zone-outlines'].forEach((id) =>
          map.setLayoutProperty(id, 'visibility', ranges ? 'visible' : 'none'),
        );
      }
      if (name === 'base') map.setLayoutProperty('base', 'visibility', value ? 'visible' : 'none');
      map.triggerRepaint();
    },
    set3d(value) {
      terrain.visible = value;
      columns.visible = value;
      map.easeTo({ pitch: value ? 40 : 0, bearing: value ? -12 : 0 });
    },
  };
}
