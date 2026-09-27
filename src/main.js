import {
  createIcons,
  MountainSnow,
  LayoutDashboard,
  Layers,
  History,
  Info,
  FlaskConical,
  CalendarDays,
  Radar,
  Activity,
  Waves,
  Mountain,
  Search,
  ArrowDownWideNarrow,
  ArrowUpRight,
  MapPin,
  Box,
  Plus,
  Minus,
  Scan,
  Navigation,
  X,
  Play,
  Pause,
  RotateCcw,
  SearchX,
} from 'lucide';
const icons = {
  MountainSnow,
  LayoutDashboard,
  Layers,
  History,
  Info,
  FlaskConical,
  CalendarDays,
  Radar,
  Activity,
  Waves,
  Mountain,
  Search,
  ArrowDownWideNarrow,
  ArrowUpRight,
  MapPin,
  Box,
  Plus,
  Minus,
  Scan,
  Navigation,
  X,
  Play,
  Pause,
  RotateCcw,
  SearchX,
};
import { events, types, visibleEvents } from './data.js';
import { createMap } from './map.js';
import './style.css';
const icon = (name) => `<i data-lucide="${name}"></i>`;
const drawIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.7 } });
let filter = 'all',
  hour = 24,
  query = '',
  selected = null,
  playing = null;
document.querySelector('#app').innerHTML = `
<aside class="rail"><a class="brand-mark" href="/" aria-label="TERRA 首頁">${icon('mountain-snow')}</a><div class="rail-middle"><button class="rail-btn active" title="災害總覽" aria-label="災害總覽" id="overview">${icon('layout-dashboard')}</button><button class="rail-btn" title="圖層設定" aria-label="圖層設定" id="rail-layers">${icon('layers')}</button><button class="rail-btn" title="時間回放" aria-label="時間回放" id="rail-time">${icon('history')}</button></div><button class="rail-btn rail-info" title="關於平台" aria-label="關於平台" id="about">${icon('info')}</button><span class="avatar">T</span></aside>
<div class="workspace"><header><div class="brand"><strong>TERRA<span> / </span></strong><span>災害情境監測平台</span><span class="version">BETA 1.0</span></div><div class="header-right"><span class="status"><b></b>系統運作正常</span><span class="header-divider"></span><span class="demo-tag">${icon('flask-conical')} 模擬資料</span></div></header>
<main><section class="page-heading"><div><div class="eyebrow">TAIWAN DISASTER INTELLIGENCE</div><h1>掌握風險，看見全貌<span>.</span></h1><p>以空間視角理解災害，探索台灣的環境韌性。</p></div><button class="date-button" id="date-info">${icon('calendar-days')}<span>2026 年 09 月 27 日</span><span class="date-dot"></span>情境展示</button></section>
<section class="stats"><article class="stat"><div class="stat-label">災害事件總數 ${icon('radar')}</div><div class="stat-value"><span id="total">6</span><small>件</small><span class="stat-note">當日模擬事件</span></div><div class="spark green"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></article>${Object.entries(
  types,
)
  .map(
    ([key, t]) =>
      `<article class="stat" style="--accent:${t.color}"><div class="stat-label"><span class="type-dot"></span>${t.label}事件 ${icon(t.icon)}</div><div class="stat-value"><span id="count-${key}">2</span><small>件</small><span class="stat-note" id="note-${key}">${key === 'earthquake' ? '最大規模 6.2' : key === 'flood' ? '最高水深 1.2 m' : '最高雨量 156 mm'}</span></div><div class="stat-track"><span></span></div></article>`,
  )
  .join('')}</section>
<section class="dashboard"><aside class="event-panel"><div class="panel-title"><h2>災害事件</h2><span class="counter" id="list-count">06</span><span class="live-label"><b></b>情境清單</span></div><div class="search">${icon('search')}<input id="search" placeholder="搜尋地點、災害事件…" aria-label="搜尋地點或災害事件"/><kbd>/</kbd></div><div class="filters" role="group" aria-label="災害類型篩選"><button class="active" data-filter="all">全部</button>${Object.entries(
  types,
)
  .map(([key, t]) => `<button data-filter="${key}">${t.label}</button>`)
  .join(
    '',
  )}</div><div class="list-heading"><span>依事件時間排序</span>${icon('arrow-down-wide-narrow')}</div><div id="event-list" class="event-list"></div><div class="panel-foot">${icon('info')} 以下為示範情境，非即時災情</div></aside>
<div class="map-panel"><div id="map"></div><div class="map-top"><div class="map-title"><span class="live-dot"></span><div><b>台灣災害分布</b><small>TAIWAN · DISASTER OVERVIEW</small></div></div><div class="view-toggle"><button id="view-2d">2D</button><button class="active" id="view-3d">${icon('box')} 3D</button></div></div><div class="map-tools"><button title="放大" aria-label="放大" id="zoom-in">${icon('plus')}</button><button title="縮小" aria-label="縮小" id="zoom-out">${icon('minus')}</button><span></span><button title="回到台灣全景" aria-label="回到台灣全景" id="home-map">${icon('scan')}</button><button title="正北方向" aria-label="正北方向" id="north">${icon('navigation')}</button><button title="圖層設定" aria-label="開關圖層設定" id="toggle-layers">${icon('layers')}</button></div>
<div class="layer-panel" id="layers" hidden><div class="layer-heading"><b>地圖圖層</b><button id="close-layers" aria-label="關閉圖層設定">${icon('x')}</button></div>${[
  ['terrain', '立體地形（示意）'],
  ['columns', '3D 風險柱體'],
  ['ranges', '災害影響範圍'],
  ['base', '街道底圖'],
]
  .map(
    ([id, label]) =>
      `<label><span>${label}</span><input type="checkbox" data-layer="${id}" checked/><span class="switch"></span></label>`,
  )
  .join('')}</div>
<div id="detail" class="detail" hidden></div><div class="map-bottom"><div class="legend"><span>災害圖例</span>${Object.values(
  types,
)
  .map((t) => `<span><b style="background:${t.color}"></b>${t.label}</span>`)
  .join(
    '',
  )}</div><div class="terrain-note">${icon('mountain')} 地形高度誇飾 · 示意模型</div></div><div class="map-coordinates" id="coordinates">23.6500° N &nbsp; 121.0000° E</div><div id="map-error" hidden>底圖暫時無法連線，已保留本機地圖與災害圖層。</div></div></section>
<section class="timeline"><button id="play" class="play-button" aria-label="播放時間軸">${icon('play')}</button><div class="timeline-label"><b>災害時間軸</b><span>2026.09.27 <strong id="hour-label">24:00</strong></span></div><div class="timeline-track"><div class="timeline-ticks"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div><input type="range" id="timeline" min="0" max="24" step="1" value="24" aria-label="災害時間"/><div class="timeline-events"><span style="left:35%"></span><span style="left:39%"></span><span style="left:47%"></span><span style="left:52%"></span><span style="left:57%"></span><span style="left:61%"></span></div></div><button id="reset-time" class="reset-time">${icon('rotate-ccw')} 顯示全日</button></section>
<footer><span><b></b> 地理資訊與災害情境的視覺化探索</span><span>Three.js + MapLibre GL <span class="footer-sep">/</span> WGS 84</span></footer></main></div>
<dialog id="about-dialog"><button class="dialog-close" aria-label="關閉說明">${icon('x')}</button><span class="eyebrow">ABOUT TERRA</span><h2>用空間理解災害。</h2><p>TERRA 結合 Three.js 立體視覺化與 MapLibre GL 地理資訊地圖，展示台灣地震、淹水及土石流的模擬情境。</p><p>所有事件、雨量、水深與影響範圍均為合成資料。地形使用程序化示意模型，並非實測高程；不適用於防災決策。</p><p>底圖：© OpenStreetMap contributors。離線時仍可使用本機台灣輪廓與災害資料。</p><button class="primary" id="got-it">開始探索 ${icon('arrow-up-right')}</button></dialog><div class="toast" id="toast" role="status" hidden></div>`;
let gis;
function render() {
  const list = visibleEvents(filter, hour, query);
  document.querySelector('#list-count').textContent = String(list.length).padStart(2, '0');
  document.querySelector('#total').textContent = list.length;
  for (const type of Object.keys(types))
    document.querySelector(`#count-${type}`).textContent = list.filter(
      (e) => e.type === type,
    ).length;
  for (const type of Object.keys(types)) {
    const items = list.filter((e) => e.type === type);
    const max = items.length ? Math.max(...items.map((e) => Number(e.value))) : null;
    document.querySelector(`#note-${type}`).textContent =
      max === null
        ? '目前無事件'
        : type === 'earthquake'
          ? `最大規模 ${max.toFixed(1)}`
          : type === 'flood'
            ? `最高水深 ${max.toFixed(1)} m`
            : `最高雨量 ${max} mm`;
  }
  document.querySelector('#event-list').innerHTML = list.length
    ? list
        .map(
          (e) =>
            `<button class="event ${selected === e.id ? 'selected' : ''}" data-id="${e.id}" style="--event-color:${types[e.type].color}"><div class="event-top"><span class="event-type">${icon(types[e.type].icon)}${types[e.type].label}</span><span class="level level-${e.level}">${e.level}風險</span><time>${e.time}</time></div><div class="event-name">${e.title}${icon('arrow-up-right')}</div><div class="event-place">${icon('map-pin')}${e.place}</div><div class="event-metric"><b>${e.value}</b><span>${e.unit}</span><span class="event-id">${e.id}</span></div></button>`,
        )
        .join('')
    : `<div class="empty">${icon('search-x')}<b>目前沒有符合的事件</b><span>請調整搜尋、類型或時間範圍。</span></div>`;
  if (selected && !list.some((e) => e.id === selected)) {
    selected = null;
    document.querySelector('#detail').hidden = true;
  }
  gis?.update(list);
  drawIcons();
}
function select(id) {
  selected = id;
  const e = events.find((e) => e.id === id),
    t = types[e.type];
  render();
  const panel = document.querySelector('#detail');
  panel.hidden = false;
  panel.innerHTML = `<button class="detail-close" aria-label="關閉事件詳情">${icon('x')}</button><div class="eyebrow" style="color:${t.color}">${e.id} / 模擬事件</div><h3>${e.title}</h3><span class="detail-place">${e.place}</span><div class="detail-value" style="color:${t.color}">${e.value}<small>${e.unit}</small></div><p>${e.description}</p><div class="detail-metrics">${e.metrics.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}</div><div class="detail-coords">${e.coord[1].toFixed(4)}° N, ${e.coord[0].toFixed(4)}° E</div>`;
  panel.querySelector('button').onclick = () => {
    panel.hidden = true;
    selected = null;
    render();
  };
  drawIcons();
  gis?.select(id);
}
render();
try {
  gis = createMap(select, (status) => {
    if (status === 'offline') document.querySelector('#map-error').hidden = false;
  });
  gis.map.on(
    'mousemove',
    (e) =>
      (document.querySelector('#coordinates').textContent =
        `${e.lngLat.lat.toFixed(4)}° N   ${e.lngLat.lng.toFixed(4)}° E`),
  );
} catch (error) {
  document.querySelector('#map-error').hidden = false;
  document.querySelector('#map-error').textContent =
    '無法啟動 WebGL 地圖。請開啟瀏覽器硬體加速；事件清單仍可使用。';
  console.error(error);
}
document.querySelector('#event-list').onclick = (e) => {
  const button = e.target.closest('[data-id]');
  if (button) select(button.dataset.id);
};
document.querySelectorAll('[data-filter]').forEach(
  (b) =>
    (b.onclick = () => {
      filter = b.dataset.filter;
      document
        .querySelectorAll('[data-filter]')
        .forEach((x) => x.classList.toggle('active', x === b));
      render();
    }),
);
document.querySelector('#search').oninput = (e) => {
  query = e.target.value.trim();
  render();
};
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    document.querySelector('#search').focus();
  }
});
const toggleLayers = () =>
  (document.querySelector('#layers').hidden = !document.querySelector('#layers').hidden);
['toggle-layers', 'rail-layers'].forEach(
  (id) => (document.getElementById(id).onclick = toggleLayers),
);
document.querySelector('#close-layers').onclick = toggleLayers;
document
  .querySelectorAll('[data-layer]')
  .forEach((el) => (el.onchange = () => gis?.setLayer(el.dataset.layer, el.checked)));
function view(value) {
  gis?.set3d(value);
  document.querySelector('#view-3d').classList.toggle('active', value);
  document.querySelector('#view-2d').classList.toggle('active', !value);
  ['terrain', 'columns'].forEach(
    (id) => (document.querySelector(`[data-layer="${id}"]`).checked = value),
  );
}
document.querySelector('#view-3d').onclick = () => view(true);
document.querySelector('#view-2d').onclick = () => view(false);
document.querySelector('#zoom-in').onclick = () => gis?.map.zoomIn();
document.querySelector('#zoom-out').onclick = () => gis?.map.zoomOut();
function home() {
  view(true);
  gis?.home();
}
document.querySelector('#home-map').onclick = home;
document.querySelector('#overview').onclick = () => {
  home();
  filter = 'all';
  query = '';
  document.querySelector('#search').value = '';
  document.querySelector('[data-filter="all"]').click();
};
document.querySelector('#north').onclick = () => gis?.map.easeTo({ bearing: 0 });
function timeUpdate(value) {
  hour = Number(value);
  document.querySelector('#timeline').value = hour;
  document.querySelector('#hour-label').textContent = `${String(hour).padStart(2, '0')}:00`;
  render();
}
function stop() {
  clearInterval(playing);
  playing = null;
  document.querySelector('#play').innerHTML = icon('play');
  document.querySelector('#play').setAttribute('aria-label', '播放時間軸');
  drawIcons();
}
document.querySelector('#timeline').oninput = (e) => {
  stop();
  timeUpdate(e.target.value);
};
document.querySelector('#play').onclick = () => {
  if (playing) {
    stop();
    return;
  }
  if (hour === 24) timeUpdate(0);
  document.querySelector('#play').innerHTML = icon('pause');
  document.querySelector('#play').setAttribute('aria-label', '暫停時間軸');
  drawIcons();
  playing = setInterval(() => {
    timeUpdate(hour + 1);
    if (hour >= 24) stop();
  }, 700);
};
document.querySelector('#reset-time').onclick = () => {
  stop();
  timeUpdate(24);
};
document.querySelector('#rail-time').onclick = () => {
  document.querySelector('#timeline').focus();
  document.querySelector('.timeline').scrollIntoView({ behavior: 'smooth', block: 'center' });
};
const dialog = document.querySelector('dialog');
document.querySelector('#about').onclick = () => dialog.showModal();
document.querySelector('.dialog-close').onclick = () => dialog.close();
document.querySelector('#got-it').onclick = () => dialog.close();
dialog.onclick = (e) => {
  if (e.target === dialog) dialog.close();
};
document.querySelector('#date-info').onclick = () => {
  const t = document.querySelector('#toast');
  t.textContent = '目前展示 2026/09/27 的固定模擬情境，可使用下方時間軸回放。';
  t.hidden = false;
  setTimeout(() => (t.hidden = true), 4500);
};
window.addEventListener('pagehide', () => {
  stop();
  gis?.map.remove();
});
