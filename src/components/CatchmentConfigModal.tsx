import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Layers
} from 'lucide-react';
import { CatchmentSettings, DEFAULT_CATCHMENT_CONFIG, VillageConfigItem } from '../config/catchmentConfig';

interface CatchmentConfigModalProps {
  currentConfig: CatchmentSettings;
  isOpen: boolean;
  onSave: (newConfig: CatchmentSettings) => void;
  onReset: () => void;
  onClose: () => void;
}

export const CatchmentConfigModal: React.FC<CatchmentConfigModalProps> = ({
  currentConfig,
  isOpen,
  onSave,
  onReset,
  onClose,
}) => {
  const [config, setConfig] = useState<CatchmentSettings>(currentConfig);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleVillageChange = (index: number, field: keyof VillageConfigItem, value: any) => {
    const updatedVillages = [...config.villages];
    updatedVillages[index] = {
      ...updatedVillages[index],
      [field]: value,
    };
    setConfig({
      ...config,
      villages: updatedVillages,
    });
  };

  const handleWaveSpeedChange = (index: 0 | 1, value: number) => {
    const updatedSpeeds: [number, number] = [
      config.assumedWaveSpeedRangeMs[0],
      config.assumedWaveSpeedRangeMs[1],
    ];
    updatedSpeeds[index] = value;
    setConfig({
      ...config,
      assumedWaveSpeedRangeMs: updatedSpeeds,
    });
  };

  const handleSave = () => {
    onSave(config);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Settings className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  CENTRAL GEOSPATIAL PARAMETERS
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Catchment & Village Configuration Editor
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
            {/* Global Settings Bar */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {config.name} — {config.basin}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Upstream Trigger Point: <strong>{config.upstreamTriggerPoint.name}</strong> ({config.upstreamTriggerPoint.elevationM}m elevation, {config.upstreamTriggerPoint.lat.toFixed(3)}°N, {config.upstreamTriggerPoint.lon.toFixed(3)}°E)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Flood Wave Velocity Range (m/s):
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={config.assumedWaveSpeedRangeMs[0]}
                    onChange={(e) => handleWaveSpeedChange(0, parseFloat(e.target.value) || 2)}
                    className="w-16 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="12"
                    value={config.assumedWaveSpeedRangeMs[1]}
                    onChange={(e) => handleWaveSpeedChange(1, parseFloat(e.target.value) || 5)}
                    className="w-16 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-mono">m/s</span>
                </div>
              </div>
            </div>

            {/* Villages Table Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-tight text-slate-900 text-xs">
                  5 Catchment Villages (Chamoli / Rishi Ganga)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Modify distances, populations, or shelters to test dynamic lead-time recalculation
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Village Name</th>
                      <th className="py-2.5 px-2">Lat / Lon</th>
                      <th className="py-2.5 px-2">Altitude (m)</th>
                      <th className="py-2.5 px-2">Pop.</th>
                      <th className="py-2.5 px-2">Dist. from Trigger (km)</th>
                      <th className="py-2.5 px-2">Nearest Shelter</th>
                      <th className="py-2.5 px-2">Walk Dist. (km)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {config.villages.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleVillageChange(idx, 'name', e.target.value)}
                            className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2 px-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {v.lat.toFixed(3)}°, {v.lon.toFixed(3)}°
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={v.elevationM}
                            onChange={(e) => handleVillageChange(idx, 'elevationM', parseInt(e.target.value) || 0)}
                            className="w-20 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={v.population}
                            onChange={(e) => handleVillageChange(idx, 'population', parseInt(e.target.value) || 0)}
                            className="w-20 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.5"
                            value={v.distanceFromTriggerKm}
                            onChange={(e) => handleVillageChange(idx, 'distanceFromTriggerKm', parseFloat(e.target.value) || 0)}
                            className="w-20 rounded border border-amber-300 bg-amber-50/50 px-2 py-1 font-mono text-xs font-bold text-amber-900"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={v.nearestShelter}
                            onChange={(e) => handleVillageChange(idx, 'nearestShelter', e.target.value)}
                            className="w-44 rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={v.walkingDistanceKm}
                            onChange={(e) => handleVillageChange(idx, 'walkingDistanceKm', parseFloat(e.target.value) || 0)}
                            className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
            <button
              onClick={() => {
                setConfig(DEFAULT_CATCHMENT_CONFIG);
                onReset();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              {savedToast && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Config Saved!</span>
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>Apply Settings</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
