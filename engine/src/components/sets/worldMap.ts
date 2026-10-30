import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land from "world-atlas/land-110m.json";

export interface MapGeometry {
  projection: GeoProjection;
  landPath: string;
}

// Land outline projected into a box; memoised per size because projecting is costly per frame
const cache = new Map<string, MapGeometry>();

export function worldMap(width: number, height: number, offsetX = 0, offsetY = 0): MapGeometry {
  const key = `${width}x${height}@${offsetX},${offsetY}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const topo = land as unknown as Topology<{ land: GeometryCollection }>;
  const geo = feature(topo, topo.objects.land);
  const projection = geoNaturalEarth1().fitExtent([[offsetX, offsetY], [offsetX + width, offsetY + height]], geo);
  const result = { projection, landPath: geoPath(projection)(geo) ?? "" };
  cache.set(key, result);
  return result;
}

export const PLACES = {
  usa: [-98, 39] as [number, number],
  russia: [60, 57] as [number, number],
  china: [104, 35] as [number, number],
  europe: [10, 50] as [number, number],
  korea: [127, 37] as [number, number],
  india: [78, 22] as [number, number],
};
