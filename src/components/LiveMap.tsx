import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";
import { DEFAULT_CATCHMENT_CONFIG } from "../config/catchmentConfig";
import type { VillageData } from "../types";
export const tierColors = {
  LOW: "#1b8b72",
  MEDIUM: "#b87917",
  HIGH: "#d76a38",
  SEVERE: "#ca4553",
};
interface Props {
  villages: VillageData[];
  selected: string;
  onSelect: (id: string) => void;
}
export function LiveMap({ villages, selected, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const [tileError, setTileError] = useState(false);
  const callback = useRef(onSelect);
  callback.current = onSelect;
  const bounds = () =>
    L.latLngBounds(
      DEFAULT_CATCHMENT_CONFIG.villages.map(
        (v) => [v.lat, v.lon] as [number, number],
      ),
    );
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).fitBounds(bounds(), { padding: [45, 45] });
    map.current = instance;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on("tileerror", () => setTileError(true))
      .addTo(instance);
    L.control.zoom({ position: "bottomright" }).addTo(instance);
    markers.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    markers.current?.clearLayers();
    DEFAULT_CATCHMENT_CONFIG.villages.forEach((cfg) => {
      const village = villages.find((v) => v.id === cfg.id);
      const color = village ? tierColors[village.riskLevel] : "#778b90";
      const marker = L.circleMarker([cfg.lat, cfg.lon], {
        radius: selected === cfg.id ? 12 : 8,
        weight: selected === cfg.id ? 4 : 3,
        color: "#fff",
        fillColor: color,
        fillOpacity: 1,
      }).addTo(markers.current!);
      const label = document.createElement("span");
      label.textContent = `${cfg.name.split(" (")[0]} · ${village ? village.riskScore + "/100" : "No data"}`;
      marker.bindTooltip(label, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "village-tooltip",
      });
      marker.on("click", () => callback.current(cfg.id));
    });
  }, [villages, selected]);
  return (
    <div className="map-wrap">
      <div
        ref={container}
        className="live-map"
        aria-label="OpenStreetMap showing configured village coordinates"
      />
      <div className="map-label">
        <MapPin size={13} /> Chamoli, Uttarakhand <span>Geographic view</span>
      </div>
      <button
        className="map-reset"
        aria-label="Fit all villages"
        onClick={() => map.current?.fitBounds(bounds(), { padding: [45, 45] })}
      >
        <LocateFixed size={17} />
      </button>
      {tileError && (
        <div className="map-error">
          Base map unavailable. Village coordinates remain visible.
        </div>
      )}
      <div className="map-note">
        Village markers show model scores. No flood extent or safe routes are
        inferred.
      </div>
    </div>
  );
}
