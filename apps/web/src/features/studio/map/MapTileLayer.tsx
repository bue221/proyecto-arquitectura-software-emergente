"use client";

import { TileLayer } from "react-leaflet";

import type { MapTileStyle } from "@/features/studio/map/port";

type MapTileLayerProps = {
  style: MapTileStyle;
};

/**
 * Inbound map UI depends only on MapTileStyle from the port — never on a CDN brand.
 *
 * Leaflet always reads `options.subdomains.length` in `_getSubdomain`, even when the
 * URL has no `{s}`. Passing `subdomains={undefined}` overrides the built-in default
 * (`"abc"`) and crashes — only forward the prop when the adapter sets it.
 */
export function MapTileLayer({ style }: MapTileLayerProps) {
  return (
    <TileLayer
      key={style.id}
      url={style.urlTemplate}
      attribution={style.attribution}
      maxZoom={style.maxZoom}
      {...(style.subdomains ? { subdomains: style.subdomains } : {})}
    />
  );
}
