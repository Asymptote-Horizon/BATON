"use client";

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Type, 
  Settings2, 
  X, 
  RotateCcw, 
  Check, 
  Sparkles,
  Maximize2,
  Palette,
  Eye
} from "lucide-react";

interface CustomizerSettings {
  fontScale: number; // percentage: 90, 100, 110, 120, 130
  fontFamily: string;
  letterSpacing: string;
  borderRadius: string;
}

const DEFAULT_SETTINGS: CustomizerSettings = {
  fontScale: 100,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  letterSpacing: "0px",
  borderRadius: "12px",
};

const FONT_FAMILIES = [
  { 
    id: "system", 
    label: "Modern Sans (System)", 
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  },
  { 
    id: "geist", 
    label: "Geist Tech (Modern Clean)", 
    family: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Geist", "Inter", sans-serif' 
  },
  { 
    id: "roboto", 
    label: "Roboto / High Contrast", 
    family: '"Roboto", "Helvetica Neue", Arial, sans-serif' 
  },
  { 
    id: "mono", 
    label: "JetBrains Mono (Technical)", 
    family: 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace' 
  },
  { 
    id: "serif", 
    label: "Editorial Serif (Georgia)", 
    family: 'Georgia, Cambria, "Times New Roman", Times, serif' 
  },
];

const FONT_SCALES = [
  { label: "Compact (90%)", value: 90 },
  { label: "Standard (100%)", value: 100 },
  { label: "Medium (110%)", value: 110 },
  { label: "Large (120%)", value: 120 },
  { label: "XL (135%)", value: 135 },
];

const LETTER_SPACINGS = [
  { label: "Tight", value: "-0.5px" },
  { label: "Normal", value: "0px" },
  { label: "Wide", value: "0.75px" },
];

const BORDER_RADII = [
  { label: "Sharp (4px)", value: "4px" },
  { label: "Rounded (12px)", value: "12px" },
  { label: "Smooth (18px)", value: "18px" },
];

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<CustomizerSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem("baton_ui_customizer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch (e) {
      console.warn("Could not load customizer settings:", e);
    }
  }, []);

  const applySettings = (s: CustomizerSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--font-scale", `${s.fontScale}%`);
    root.style.setProperty("--custom-font-family", s.fontFamily);
    root.style.setProperty("--custom-letter-spacing", s.letterSpacing);
    root.style.setProperty("--custom-border-radius", s.borderRadius);
  };

  const updateSetting = <K extends keyof CustomizerSettings>(key: K, val: CustomizerSettings[K]) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    applySettings(updated);
    try {
      localStorage.setItem("baton_ui_customizer_settings", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save customizer settings:", e);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem("baton_ui_customizer_settings");
    } catch (e) {}
  };

  return (
    <>
      {/* Floating Gear Trigger Button in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-500/40 border border-blue-400/30 transition-all hover:scale-105 cursor-pointer font-bold text-xs"
          title="Customize UI Typography, Font Sizes & Layout Properties"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">Appearance</span>
        </button>
      </div>

      {/* Floating Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-84 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Appearance Customizer</h3>
                <p className="text-[10px] text-slate-400">Controls persist automatically in browser</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset to defaults"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls List */}
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* 1. Font Size Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  <span>Font Size Scale</span>
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">{settings.fontScale}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FONT_SCALES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateSetting("fontScale", s.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      settings.fontScale === s.value
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Font Family / Typography */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Font Family / Typography
              </label>
              <div className="space-y-1">
                {FONT_FAMILIES.map((f) => {
                  const isSelected = settings.fontFamily === f.family;
                  return (
                    <button
                      key={f.id}
                      onClick={() => updateSetting("fontFamily", f.family)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/50 font-bold"
                          : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                      style={{ fontFamily: f.family }}
                    >
                      <span>{f.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Letter Spacing */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Letter Spacing (Tracking)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LETTER_SPACINGS.map((ls) => (
                  <button
                    key={ls.value}
                    onClick={() => updateSetting("letterSpacing", ls.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      settings.letterSpacing === ls.value
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Element Corner Roundness */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Element Corner Roundness
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {BORDER_RADII.map((br) => (
                  <button
                    key={br.value}
                    onClick={() => updateSetting("borderRadius", br.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      settings.borderRadius === br.value
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {br.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Live DOM CSS Injection</span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

