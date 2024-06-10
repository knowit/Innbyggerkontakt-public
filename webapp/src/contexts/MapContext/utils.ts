import { LngLatBoundsLike } from 'mapbox-gl';
import mask from '@turf/mask';
import { polygon as polygonTurf } from '@turf/helpers';

export type Coordinates = number[][][];
export const WORLD_COORDINATES: Coordinates = [
  [
    [180, 90],
    [-180, 90],
    [-180, -90],
    [180, -90],
    [180, 90],
  ],
];

export const getBounds = (coords: number[][][]): LngLatBoundsLike => {
  const minLat = coords[0].reduce((min, p) => (p[1] < min ? p[1] : min), coords[0][0][1]);
  const maxLat = coords[0].reduce((max, p) => (p[1] > max ? p[1] : max), coords[0][0][1]);
  const minLng = coords[0].reduce((min, p) => (p[0] < min ? p[0] : min), coords[0][0][0]);
  const maxLng = coords[0].reduce((max, p) => (p[0] > max ? p[0] : max), coords[0][0][0]);

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};

export const getBorders = async (municipalityNumber: string) => {
  const response = await fetch(`https://ws.geonorge.no/kommuneinfo/v1/kommuner/${municipalityNumber}/omrade`);
  const myJson = await response.json(); //extract JSON from the http response
  // do something with myJson
  const coords = myJson?.omrade?.coordinates[0];

  return coords;
};

export const addWorldLayer = (map: mapboxgl.Map, borders: Coordinates) => {
  const worldPoly = mask(polygonTurf(borders), polygonTurf(WORLD_COORDINATES));

  map.addSource(`worldSource`, {
    type: 'geojson',
    data: worldPoly,
  });

  map.addLayer({
    id: `borderLayer`,
    type: 'fill',

    source: `worldSource`,
    layout: {},
    paint: {
      'fill-color': '#000',
      'fill-opacity': 0.4,
    },
  });
};
