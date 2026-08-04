"use client";

import React, { useState, useEffect } from "react";
import {
  THEMES,
  THEME_CATEGORIES,
  ThemeCategory,
  ThemeDef,
  ThemeSettings,
  loadThemeSettings,
  saveThemeSettings,
  getThemeDef,
} from "../lib/themeConfig";
import { playToggleBeep, setSoundEnabled, isSoundEnabled } from "../lib/retroAudio";

interface ThemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeGalleryModal: React.FC<ThemeGalleryModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS_INITIAL);

  useEffect(() => {
    if (isOpen) {
      const currentSettings = loadThemeSettings();
      setSettings(currentSettings);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    playToggleBeep();
  };

  const handleThemePick = (themeId: string) => {
    onSelectTheme(themeId);
    setSettings((prev) => ({ ...prev, themeId }));
    playToggleBeep();
  };

  const handleScanlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSettings((prev) => ({ ...prev, scanlineOpacity: val }));
    saveThemeSettings({ scanlineOpacity: val });
  };

  const handleFlickerToggle = () => {
    const newVal = !settings.flickerEnabled;
    setSettings((prev) => ({ ...prev, flickerEnabled: newVal }));
    saveThemeSettings({ flickerEnabled: newVal });
    playToggleBeep();
  };

  const handleSoundToggle = () => {
    const newVal = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: newVal }));
    setSoundEnabled(newVal);
    saveThemeSettings({ soundEnabled: newVal });
    if (newVal) playToggleBeep();
  };

  const handleRandomizeTheme = () => {
    const randomIndex = Math.floor(Math.random() * THEMES.length);
    const randomTheme = THEMES[randomIndex];
    handleThemePick(randomTheme.id);
  };

  const handleResetDefaults = () => {
    handleThemePick("green");
    setSettings({
      themeId: "green",
      scanlineOpacity: 1.0,
      flickerEnabled: true,
      soundEnabled: true,
    });
    saveThemeSettings({
      themeId: "green",
      scanlineOpacity: 1.0,
      flickerEnabled: true,
      soundEnabled: true,
    });
  };

  const filteredThemes = THEMES.filter((t) => {
    const matchesCategory =
      activeCategory === "ALL" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeThemeObj = getThemeDef(currentThemeId);

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 md:p-6 z-50 select-none backdrop-blur-xs">
      <div className="retro-border bg-[var(--panel-bg)] max-w-4xl w-full max-h-[90vh] flex flex-col text-[var(--fg-color)] rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[var(--border-color)] bg-[var(--bg-color)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-glow font-mono">
              THEME STUDIO & CRT DISPLAY REGISTRY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="retro-button px-2.5 py-1 text-xs uppercase font-bold text-red-400 hover:text-red-300"
          >
            ✖ ESC
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Controls Bar: Search & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-2.5 top-2 text-xs opacity-60">🔍</span>
              <input
                type="text"
                placeholder="Search 16 retro display themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-16 py-1.5 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] font-mono placeholder:opacity-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-[9px] font-bold text-[var(--fg-color)]/70 hover:text-[var(--fg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] px-1.5 py-0.5 bg-[var(--panel-bg)] font-mono cursor-pointer transition-colors"
                  title="Clear search query"
                >
                  [CLR]
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[var(--bg-color)] border border-[var(--border-color)] px-2 py-1 text-[var(--accent-color)] text-glow hidden sm:inline-block">
                {filteredThemes.length} / {THEMES.length} REGISTRY
              </span>
              <button
                onClick={handleRandomizeTheme}
                className="retro-button px-3 py-1.5 text-xs uppercase font-bold flex items-center gap-1.5 text-amber-300"
                title="Pick a random theme"
              >
                <span>🎲</span> Randomize
              </button>
              <button
                onClick={handleResetDefaults}
                className="retro-button px-3 py-1.5 text-xs uppercase font-bold opacity-80 hover:opacity-100"
                title="Reset to default green CRT theme"
              >
                ↺ Reset Default
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-color)]/40 text-xs">
            <button
              onClick={() => handleCategorySelect("ALL")}
              className={`px-3 py-1 uppercase font-mono font-bold whitespace-nowrap transition-all border ${
                activeCategory === "ALL"
                  ? "bg-[var(--border-color)] text-[var(--bg-color)] border-[var(--border-color)]"
                  : "bg-transparent text-[var(--fg-color)] border-transparent hover:border-[var(--border-color)]"
              }`}
            >
              ALL ({THEMES.length})
            </button>
            {THEME_CATEGORIES.map((cat) => {
              const count = THEMES.filter((t) => t.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1 uppercase font-mono font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-[var(--border-color)] text-[var(--bg-color)] border-[var(--border-color)]"
                      : "bg-transparent text-[var(--fg-color)] border-transparent hover:border-[var(--border-color)]"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Theme Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme: ThemeDef) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleThemePick(theme.id)}
                  className={`group relative border-2 p-3.5 cursor-pointer transition-all duration-200 flex flex-col justify-between crt-glitch-hover transform hover:-translate-y-0.5 ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-offset-black scale-[1.02]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: theme.panelBg,
                    borderColor: isSelected ? theme.accent : theme.borderColor,
                    boxShadow: isSelected
                      ? `0 0 18px ${theme.accent}66, inset 0 0 12px ${theme.accent}22`
                      : `0 2px 6px rgba(0,0,0,0.4)`,
                  }}
                >
                  <div>
                    {/* Top Header Row: Emoji, Title & Equipped Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl leading-none transition-transform group-hover:scale-110">
                          {theme.emoji}
                        </span>
                        <div>
                          <h3
                            className="font-bold text-xs md:text-sm font-mono tracking-tight flex items-center gap-1.5"
                            style={{ color: theme.fg }}
                          >
                            {theme.name}
                          </h3>
                          <span
                            className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-none inline-block border"
                            style={{
                              backgroundColor: `${theme.bg}bb`,
                              color: theme.accent,
                              borderColor: `${theme.borderColor}88`,
                            }}
                          >
                            {theme.category}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span
                          className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none border crt-glow-pulse flex items-center gap-1"
                          style={{
                            backgroundColor: theme.accent,
                            color: theme.bg,
                            borderColor: theme.fg,
                          }}
                        >
                          <span>⚡</span> ACTIVE
                        </span>
                      ) : (
                        <span
                          className="opacity-0 group-hover:opacity-100 text-[10px] font-mono uppercase px-2 py-0.5 border transition-opacity"
                          style={{
                            color: theme.accent,
                            borderColor: `${theme.accent}66`,
                          }}
                        >
                          [EQUIP]
                        </span>
                      )}
                    </div>

                    {/* Live Terminal Sandbox Preview Card */}
                    <div
                      className="my-2.5 p-2.5 border-2 rounded-none relative overflow-hidden font-mono text-[11px]"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.borderColor,
                        color: theme.fg,
                      }}
                    >
                      {/* Mini Scanline Lines Background */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.5) 50%)`,
                          backgroundSize: "100% 3px",
                        }}
                      />

                      {/* Mini Terminal Bar */}
                      <div
                        className="flex items-center justify-between border-b pb-1 mb-1.5 text-[9px] opacity-75 font-bold uppercase"
                        style={{ borderColor: `${theme.borderColor}88` }}
                      >
                        <span style={{ color: theme.accent }}>
                          &gt; SYS_NOTE_{theme.id.toUpperCase()}.TXT
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </div>

                      {/* Mini Code/Note Text */}
                      <div className="space-y-0.5 leading-tight text-[10px]">
                        <div style={{ color: theme.accent }} className="font-bold">
                          # {theme.name} Display
                        </div>
                        <div className="opacity-90 line-clamp-1">
                          Terminal notes & AI assistant ready.
                        </div>
                        <div className="flex items-center gap-1 pt-0.5" style={{ color: theme.fg }}>
                          <span>status: OK</span>
                          <span className="animate-pulse">_</span>
                        </div>
                      </div>
                    </div>

                    {/* Theme Color Palette Swatches */}
                    <div
                      className="flex items-center gap-1.5 my-2 p-1.5 border rounded-none text-[9px] font-mono"
                      style={{
                        backgroundColor: `${theme.bg}aa`,
                        borderColor: `${theme.borderColor}66`,
                      }}
                    >
                      <div
                        className="w-4 h-4 border shadow-xs"
                        style={{ backgroundColor: theme.bg, borderColor: `${theme.fg}44` }}
                        title={`Background: ${theme.bg}`}
                      />
                      <div
                        className="w-4 h-4 border shadow-xs"
                        style={{ backgroundColor: theme.panelBg, borderColor: `${theme.fg}44` }}
                        title={`Panel: ${theme.panelBg}`}
                      />
                      <div
                        className="w-4 h-4 border shadow-xs"
                        style={{ backgroundColor: theme.fg, borderColor: `${theme.fg}44` }}
                        title={`Text Color: ${theme.fg}`}
                      />
                      <div
                        className="w-4 h-4 border shadow-xs"
                        style={{ backgroundColor: theme.accent, borderColor: `${theme.fg}44` }}
                        title={`Accent: ${theme.accent}`}
                      />
                      <div
                        className="w-4 h-4 border shadow-xs"
                        style={{ backgroundColor: theme.borderColor, borderColor: `${theme.fg}44` }}
                        title={`Border: ${theme.borderColor}`}
                      />
                      <span
                        className="ml-auto font-bold uppercase tracking-wider"
                        style={{ color: theme.accent }}
                      >
                        PALETTE
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] opacity-80 font-mono line-clamp-2 leading-tight">
                      {theme.description}
                    </p>
                  </div>

                  {/* Card Footer Info */}
                  <div
                    className="mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono opacity-70"
                    style={{ borderColor: `${theme.borderColor}66` }}
                  >
                    <span>Scanlines: {Math.round(theme.scanlineOpacity * 100)}%</span>
                    <span style={{ color: theme.accent }}>
                      {theme.fontTitle || "Default"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredThemes.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] opacity-70 font-mono text-xs">
              No display themes found matching "{searchQuery}".
            </div>
          )}

          {/* Display & CRT Effects Settings Box */}
          <div className="mt-6 border-2 border-[var(--border-color)] p-4 bg-[var(--bg-color)]/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-glow font-mono flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2">
              <span>⚙️</span> CRT DISPLAY & AUDIO CUSTOMIZATION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Scanline Intensity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold opacity-90">Scanline Intensity:</label>
                  <span className="text-[var(--accent-color)] font-bold">
                    {Math.round(settings.scanlineOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.scanlineOpacity}
                  onChange={handleScanlineChange}
                  className="w-full accent-[var(--accent-color)] cursor-pointer bg-[var(--panel-bg)]"
                />
                <span className="text-[10px] opacity-60 block">
                  Adjust CRT horizontal monitor scanline density
                </span>
              </div>

              {/* CRT Phosphor Flicker Toggle */}
              <div className="flex items-center justify-between p-2 border border-[var(--border-color)]/60 bg-[var(--panel-bg)]">
                <div>
                  <span className="font-bold block">Phosphor Flicker</span>
                  <span className="text-[10px] opacity-60">Simulate retro monitor refresh rate</span>
                </div>
                <button
                  onClick={handleFlickerToggle}
                  className={`px-3 py-1 font-bold text-[11px] uppercase border transition-colors ${
                    settings.flickerEnabled
                      ? "bg-green-700 text-white border-green-500"
                      : "bg-gray-800 text-gray-400 border-gray-600"
                  }`}
                >
                  {settings.flickerEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Audio Sound FX Toggle */}
              <div className="flex items-center justify-between p-2 border border-[var(--border-color)]/60 bg-[var(--panel-bg)]">
                <div>
                  <span className="font-bold block">Retro Audio Beeps</span>
                  <span className="text-[10px] opacity-60">Synthesized Web Audio clicks</span>
                </div>
                <button
                  onClick={handleSoundToggle}
                  className={`px-3 py-1 font-bold text-[11px] uppercase border transition-colors ${
                    settings.soundEnabled
                      ? "bg-green-700 text-white border-green-500"
                      : "bg-gray-800 text-gray-400 border-gray-600"
                  }`}
                >
                  {settings.soundEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t-2 border-[var(--border-color)] bg-[var(--bg-color)] text-xs font-mono">
          <span className="opacity-70">Active Display Theme: <strong>{activeThemeObj.name}</strong></span>
          <button
            onClick={onClose}
            className="retro-button px-4 py-1.5 uppercase font-bold"
          >
            Apply & Close [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_SETTINGS_INITIAL: ThemeSettings = {
  themeId: "green",
  scanlineOpacity: 1.0,
  flickerEnabled: true,
  soundEnabled: true,
};
