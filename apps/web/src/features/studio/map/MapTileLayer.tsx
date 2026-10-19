"use client";

import { TileLayer } from "react-leaflet";

import type { MapTileStyle } from "@/features/studio/map/port";

type MapTileLayerProps = {
  style: MapTileStyle;
};

/** Inbound map UI depends only on MapTileStyle from the port — never on a CDN brand. */
export function MapTileLayer({ style }: MapTileLayerProps) {
  return (
    <TileLayer
      key={style.id}
      url={style.urlTemplate}
      attribution={style.attribution}
      maxZoom={style.maxZoom}
      subdomains={style.subdomains}
    />
  );
}
