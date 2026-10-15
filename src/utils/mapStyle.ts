import type {
  LayerSpecification,
  StyleSpecification,
} from 'maplibre-gl';

/*
 * Mappa vettoriale gratuita di OpenFreeMap (dati OpenStreetMap),
 * ricolorata con i toni del viaggio: carta color pietra di Parigi,
 * acqua della Senna, giardini verdi, strade color crema.
 */
const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const palette = {
  paper: '#f4ede0',
  residential: '#eee5d3',
  park: '#d2e1be',
  wood: '#c9dcb4',
  grass: '#d6e4c2',
  pitch: '#dbe5c8',
  hospital: '#efe0dc',
  school: '#ece5cf',
  water: '#b3cce6',
  waterLine: '#a5c0de',
  waterLabel: '#4a74a6',
  building: '#e8ddc9',
  buildingEdge: '#d4c7ad',
  casing: '#d9cdb5',
  casingMajor: '#cdb98d',
  roadMinor: '#fffdf8',
  roadMajor: '#fbe7b4',
  roadMotorway: '#f5d68f',
  rail: '#b8ad98',
  label: '#3a4357',
  placeLabel: '#1b2437',
  halo: '#f7f1e6',
  metro: '#17407f',
};

type Paint = Record<string, unknown>;

function paintFor(layer: LayerSpecification): Paint | null {
  const { id } = layer;

  if (id === 'background') {
    return { 'background-color': palette.paper };
  }

  if (id === 'park') {
    return {
      'fill-color': palette.park,
      'fill-outline-color': 'rgba(0,0,0,0)',
    };
  }

  if (id === 'park_outline') {
    return { 'line-color': '#e0ead0' };
  }

  if (id === 'landuse_residential') {
    return { 'fill-color': palette.residential };
  }

  if (id === 'landcover_wood') {
    return { 'fill-color': palette.wood };
  }

  if (id === 'landcover_grass') {
    return { 'fill-color': palette.grass };
  }

  if (id === 'landuse_pitch' || id === 'landuse_track') {
    return { 'fill-color': palette.pitch };
  }

  if (id === 'landuse_cemetery') {
    return { 'fill-color': palette.wood };
  }

  if (id === 'landuse_hospital') {
    return { 'fill-color': palette.hospital };
  }

  if (id === 'landuse_school') {
    return { 'fill-color': palette.school };
  }

  if (id.startsWith('waterway')) {
    return id.endsWith('_label')
      ? { 'text-color': palette.waterLabel, 'text-halo-color': palette.halo }
      : { 'line-color': palette.waterLine };
  }

  if (id === 'water') {
    return { 'fill-color': palette.water };
  }

  if (id.startsWith('water_name')) {
    return { 'text-color': palette.waterLabel, 'text-halo-color': palette.halo };
  }

  if (/_casing$/.test(id)) {
    return {
      'line-color': /secondary|trunk|motorway|link/.test(id)
        ? palette.casingMajor
        : palette.casing,
    };
  }

  if (/^(tunnel|road|bridge)_/.test(id) && layer.type === 'line') {
    if (/rail/.test(id)) {
      return { 'line-color': palette.rail };
    }

    if (/motorway/.test(id)) {
      return { 'line-color': palette.roadMotorway };
    }

    if (/secondary|trunk|link/.test(id)) {
      return { 'line-color': palette.roadMajor };
    }

    return { 'line-color': palette.roadMinor };
  }

  if (id === 'building') {
    return {
      'fill-color': palette.building,
      'fill-outline-color': palette.buildingEdge,
    };
  }

  if (id === 'building-3d') {
    return {
      'fill-extrusion-color': palette.building,
      'fill-extrusion-opacity': 0.95,
    };
  }

  if (id === 'poi_transit') {
    return { 'text-color': palette.metro, 'text-halo-color': palette.halo };
  }

  if (
    id.startsWith('poi_') ||
    id.startsWith('highway-name') ||
    id === 'airport'
  ) {
    return { 'text-color': palette.label, 'text-halo-color': palette.halo };
  }

  if (id.startsWith('label_')) {
    return {
      'text-color': palette.placeLabel,
      'text-halo-color': palette.halo,
    };
  }

  return null;
}

export function paintParis(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers
      /* Il raster a bassa risoluzione serve solo a zoom molto bassi. */
      .filter((layer) => layer.id !== 'natural_earth')
      .map((layer) => {
        const paint = paintFor(layer);

        /* Nomi nella lingua del posto (francese), non in inglese. */
        const localizeNames =
          layer.type === 'symbol' &&
          JSON.stringify(layer.layout?.['text-field'] ?? '').includes(
            'name_en',
          );

        if (!paint && !localizeNames) {
          return layer;
        }

        const next = { ...layer } as Record<string, unknown>;

        if (paint) {
          next.paint = { ...layer.paint, ...paint };
        }

        if (localizeNames) {
          next.layout = {
            ...layer.layout,
            'text-field': ['coalesce', ['get', 'name'], ['get', 'name_en']],
          };
        }

        return next as unknown as LayerSpecification;
      }),
  };
}

/* Se la mappa vettoriale non è raggiungibile: tessere raster di OSM. */
export const fallbackStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

let cachedStyle: StyleSpecification | null = null;

export async function loadParisStyle(): Promise<StyleSpecification> {
  if (cachedStyle) {
    return cachedStyle;
  }

  const response = await fetch(BASE_STYLE_URL);

  if (!response.ok) {
    throw new Error('Stile della mappa non disponibile.');
  }

  cachedStyle = paintParis(
    (await response.json()) as StyleSpecification,
  );

  return cachedStyle;
}
