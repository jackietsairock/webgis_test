export const types = {
  earthquake: { label: '地震', color: '#ffb75e', icon: 'activity' },
  flood: { label: '淹水', color: '#65b8ff', icon: 'waves' },
  landslide: { label: '土石流', color: '#eb8075', icon: 'mountain' },
};
export const events = [
  {
    id: 'EQ-001',
    type: 'earthquake',
    title: '花蓮近海地震',
    place: '花蓮縣 · 秀林鄉外海',
    coord: [121.69, 24.12],
    level: '高',
    value: '6.2',
    unit: '規模 ML',
    time: '14:32',
    hour: 14,
    radius: 26000,
    description: '模擬花蓮近海地震情境。橘色範圍代表示意影響區，立體柱體呈現相對風險程度。',
    metrics: [
      ['震源深度', '18.5 km'],
      ['模擬最大震度', '5 強'],
      ['影響範圍', '26 km'],
    ],
  },
  {
    id: 'FL-001',
    type: 'flood',
    title: '蘭陽溪流域積淹水',
    place: '宜蘭縣 · 五結鄉',
    coord: [121.77, 24.68],
    level: '高',
    value: '1.2',
    unit: '模擬水深 m',
    time: '13:45',
    hour: 13,
    radius: 12000,
    description: '模擬持續降雨造成蘭陽溪下游積淹水。藍色範圍為概念性影響區，並非實際淹水潛勢圖。',
    metrics: [
      ['模擬雨量', '180 mm'],
      ['模擬水深', '1.2 m'],
      ['影響範圍', '12 km'],
    ],
  },
  {
    id: 'LS-001',
    type: 'landslide',
    title: '仁愛山區土石流潛勢',
    place: '南投縣 · 仁愛鄉',
    coord: [121.13, 24.02],
    level: '中',
    value: '135',
    unit: '累積雨量 mm',
    time: '12:20',
    hour: 12,
    radius: 14000,
    description: '模擬山區降雨引發的土石流風險。紅色範圍僅供空間展示，不代表官方警戒區域。',
    metrics: [
      ['模擬雨量', '135 mm'],
      ['相對風險', '中'],
      ['影響範圍', '14 km'],
    ],
  },
  {
    id: 'FL-002',
    type: 'flood',
    title: '高屏溪沿岸淹水',
    place: '高雄市 · 大寮區',
    coord: [120.43, 22.58],
    level: '中',
    value: '0.6',
    unit: '模擬水深 m',
    time: '11:08',
    hour: 11,
    radius: 15000,
    description: '模擬高屏溪沿岸低窪地區積淹水，用於展示不同災害圖層的疊合效果。',
    metrics: [
      ['模擬雨量', '112 mm'],
      ['模擬水深', '0.6 m'],
      ['影響範圍', '15 km'],
    ],
  },
  {
    id: 'EQ-002',
    type: 'earthquake',
    title: '台東近海有感地震',
    place: '台東縣 · 成功鎮外海',
    coord: [121.48, 23.12],
    level: '低',
    value: '4.1',
    unit: '規模 ML',
    time: '09:16',
    hour: 9,
    radius: 18000,
    description: '模擬台東近海有感地震，供比較不同事件的分布與相對風險。',
    metrics: [
      ['震源深度', '24.0 km'],
      ['模擬最大震度', '3 級'],
      ['影響範圍', '18 km'],
    ],
  },
  {
    id: 'LS-002',
    type: 'landslide',
    title: '阿里山山區邊坡警戒',
    place: '嘉義縣 · 阿里山鄉',
    coord: [120.75, 23.51],
    level: '中',
    value: '156',
    unit: '累積雨量 mm',
    time: '08:40',
    hour: 8,
    radius: 11000,
    description: '模擬阿里山山區邊坡風險，展示山區災害的空間定位與資訊查詢。',
    metrics: [
      ['模擬雨量', '156 mm'],
      ['相對風險', '中'],
      ['影響範圍', '11 km'],
    ],
  },
];
// Simplified geographic outline for an offline-capable Taiwan overview; not a boundary dataset.
export const outline = [
  [121.54, 25.3],
  [121.77, 25.16],
  [121.96, 25.02],
  [121.9, 24.85],
  [121.84, 24.6],
  [121.79, 24.42],
  [121.67, 24.16],
  [121.6, 23.95],
  [121.53, 23.75],
  [121.48, 23.53],
  [121.4, 23.33],
  [121.3, 23.13],
  [121.19, 22.97],
  [121.16, 22.8],
  [121.03, 22.61],
  [120.91, 22.43],
  [120.88, 22.21],
  [120.85, 21.91],
  [120.73, 21.94],
  [120.68, 22.15],
  [120.57, 22.34],
  [120.36, 22.52],
  [120.2, 22.74],
  [120.15, 22.97],
  [120.08, 23.14],
  [120.12, 23.39],
  [120.15, 23.61],
  [120.23, 23.81],
  [120.4, 24.05],
  [120.55, 24.3],
  [120.7, 24.52],
  [120.87, 24.7],
  [121.02, 24.9],
  [121.24, 25.12],
  [121.43, 25.2],
  [121.54, 25.3],
];
export function circle(event) {
  const [lng, lat] = event.coord;
  return {
    type: 'Feature',
    properties: { id: event.id, type: event.type, color: types[event.type].color },
    geometry: {
      type: 'Polygon',
      coordinates: [
        Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2;
          return [
            lng + (Math.cos(a) * event.radius) / (111320 * Math.cos((lat * Math.PI) / 180)),
            lat + (Math.sin(a) * event.radius) / 111320,
          ];
        }),
      ],
    },
  };
}
export function visibleEvents(filter, hour, query = '') {
  return events.filter(
    (e) =>
      (filter === 'all' || e.type === filter) &&
      e.hour + Number(e.time.split(':')[1]) / 60 <= hour &&
      `${e.title}${e.place}`.includes(query),
  );
}
