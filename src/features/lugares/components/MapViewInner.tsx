"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Place } from "../types";
import { getImageUrl } from "@/lib/constants";
import { Rating } from "@mui/material";

/* ─── Custom beer-pin icon ─── */
const beerIcon = new L.DivIcon({
  className: "",
  html: `<span style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🍺</span>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

const selectedBeerIcon = new L.DivIcon({
  className: "",
  html: `<span style="font-size:34px;filter:drop-shadow(0 0 10px rgba(245,158,11,.65))">📍</span>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

/* ─── Helper to fly the map to a place ─── */
function FlyToPlace({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

interface Props {
  places: Place[];
  selectedId: string | null;
  onSelectPlace: (id: string) => void;
}

export default function MapViewInner({ places, selectedId, onSelectPlace }: Props) {
  /* Default center: Santiago, Chile */
  const defaultCenter: [number, number] = [-33.45, -70.65];

  const flyTarget = useMemo<[number, number] | null>(() => {
    if (!selectedId) return null;
    const p = places.find((l) => l._id === selectedId);
    if (p?.coordinates?.lat && p?.coordinates?.lng) {
      return [p.coordinates.lat, p.coordinates.lng];
    }
    return null;
  }, [selectedId, places]);

  const placesWithCoords = places.filter((p) => p.coordinates?.lat && p.coordinates?.lng);

  /* Compute map bounds to fit all markers */
  const center = useMemo<[number, number]>(() => {
    if (placesWithCoords.length === 0) return defaultCenter;
    const avgLat =
      placesWithCoords.reduce((s, p) => s + p.coordinates!.lat, 0) / placesWithCoords.length;
    const avgLng =
      placesWithCoords.reduce((s, p) => s + p.coordinates!.lng, 0) / placesWithCoords.length;
    return [avgLat, avgLng];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesWithCoords.length]);

  return (
    <MapContainer
      center={center}
      zoom={placesWithCoords.length > 0 ? 6 : 5}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToPlace coords={flyTarget} />

      {placesWithCoords.map((lugar) => {
        const avgRating = lugar.reviews?.length
          ? lugar.reviews.reduce((a, r) => a + r.rating, 0) / lugar.reviews.length
          : 0;

        return (
          <Marker
            key={lugar._id}
            position={[lugar.coordinates!.lat, lugar.coordinates!.lng]}
            icon={lugar._id === selectedId ? selectedBeerIcon : beerIcon}
            eventHandlers={{ click: () => onSelectPlace(lugar._id) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                {lugar.coverImage && (
                  <img
                    src={getImageUrl(lugar.coverImage)}
                    alt={lugar.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                )}
                <strong style={{ fontSize: 14 }}>{lugar.name}</strong>
                <br />
                <span style={{ fontSize: 12, color: "#666" }}>
                  {lugar.address.city}, {lugar.address.country}
                </span>
                <br />
                <Rating value={avgRating} precision={0.5} readOnly size="small" />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
