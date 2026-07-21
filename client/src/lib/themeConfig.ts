export type ThemeCategory =
  | 'CRT Monitors'
  | 'Hardware & Retro OS'
  | 'Cyberpunk & Synthwave'
  | 'Modern & Minimal'
  | 'Creative & Vintage';

export interface ThemeDef {
  id: string;
  name: string;
  category: ThemeCategory;
  emoji: string;
  description: string;
  bg: string;
  fg: string;
  accent: string;
  panelBg: string;
  borderColor: string;
  glow?: string;
  scanlineOpacity: number;
  fontTitle?: string;
  fontBody?: string;
}

export interface ThemeSettings {
  themeId: string;
  scanlineOpacity: number; // 0.0 to 1.0 relative multiplier
  flickerEnabled: boolean;
  soundEnabled: boolean;
  fontOverride?: string;
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  'CRT Monitors',
  'Hardware & Retro OS',
  'Cyberpunk & Synthwave',
  'Modern & Minimal',
  'Creative & Vintage',
];

export const THEMES: ThemeDef[] = [
  {
    id: 'green',
    name: 'CRT Matrix Green',
    category: 'CRT Monitors',
    emoji: '🟢',
    description: 'Classic 1980s green monochrome CRT monitor phosphor glow.',
    bg: '#071407',
    fg: '#33ff33',
    accent: '#66ff66',
    panelBg: '#0b220b',
    borderColor: '#1b4d1b',
    glow: '0 0 8px rgba(51, 255, 51, 0.7)',
    scanlineOpacity: 0.15,
    fontTitle: 'VT323',
    fontBody: 'Courier Prime',
  },
  {
    id: 'amber',
    name: 'Amber Phosphor CRT',
    category: 'CRT Monitors',
    emoji: '🟠',
    description: 'Warm amber glow of vintage mainframe computer terminals.',
    bg: '#120900',
    fg: '#ffb000',
    accent: '#ffcc00',
    panelBg: '#221100',
    borderColor: '#592e00',
    glow: '0 0 8px rgba(255, 176, 0, 0.7)',
    scanlineOpacity: 0.18,
    fontTitle: 'VT323',
    fontBody: 'Courier Prime',
  },
  {
    id: 'matrix',
    name: 'Code Matrix Rain',
    category: 'CRT Monitors',
    emoji: '📟',
    description: 'Deep cyber green terminal with bright glowing matrix code accents.',
    bg: '#020d04',
    fg: '#00ff66',
    accent: '#00ffa3',
    panelBg: '#051909',
    borderColor: '#005522',
    glow: '0 0 10px rgba(0, 255, 102, 0.8)',
    scanlineOpacity: 0.2,
    fontTitle: 'VT323',
    fontBody: 'Courier Prime',
  },
  {
    id: 'win95',
    name: 'Windows 95 Desktop',
    category: 'Hardware & Retro OS',
    emoji: '💻',
    description: 'Authentic 90s teal desktop wallpaper with classic bevel buttons.',
    bg: '#008080',
    fg: '#000000',
    accent: '#000080',
    panelBg: '#c0c0c0',
    borderColor: '#808080',
    glow: 'none',
    scanlineOpacity: 0.0,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Arial',
  },
  {
    id: 'c64',
    name: 'Commodore 64',
    category: 'Hardware & Retro OS',
    emoji: '🕹️',
    description: 'Iconic blue-on-blue palette of the legend 8-bit computer.',
    bg: '#3c3c9c',
    fg: '#a4a4ff',
    accent: '#ffffff',
    panelBg: '#1c1c7c',
    borderColor: '#a4a4ff',
    glow: 'none',
    scanlineOpacity: 0.15,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Share Tech Mono',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    category: 'Cyberpunk & Synthwave',
    emoji: '🔵',
    description: 'Futuristic high-contrast cyan and electric pink neon glow.',
    bg: '#0d0015',
    fg: '#00ffff',
    accent: '#ffff00',
    panelBg: '#1d0032',
    borderColor: '#ff007f',
    glow: '0 0 8px rgba(0, 255, 255, 0.8)',
    scanlineOpacity: 0.22,
    fontTitle: 'Press Start 2P',
    fontBody: 'Share Tech Mono',
  },
  {
    id: 'sunset',
    name: 'Synthwave Sunset',
    category: 'Cyberpunk & Synthwave',
    emoji: '🌅',
    description: 'Vaporwave aesthetics with deep purple gradients and golden sun glow.',
    bg: '#150624',
    fg: '#ff33a3',
    accent: '#ffb800',
    panelBg: '#2d0b47',
    borderColor: '#00ffff',
    glow: '0 0 8px rgba(255, 51, 163, 0.8)',
    scanlineOpacity: 0.2,
    fontTitle: 'VT323',
    fontBody: 'Share Tech Mono',
  },
  {
    id: 'midnight',
    name: 'Deep Space Cyber',
    category: 'Cyberpunk & Synthwave',
    emoji: '🌌',
    description: 'Dark midnight cosmos paired with electric cyan and crimson highlights.',
    bg: '#020617',
    fg: '#38bdf8',
    accent: '#f43f5e',
    panelBg: '#0b0f19',
    borderColor: '#1e293b',
    glow: '0 0 8px rgba(56, 189, 248, 0.5)',
    scanlineOpacity: 0.15,
    fontTitle: 'Press Start 2P',
    fontBody: 'Share Tech Mono',
  },
  {
    id: 'dracula',
    name: 'Dracula Gothic',
    category: 'Creative & Vintage',
    emoji: '🧛',
    description: 'Popular dark gothic palette with vibrant purple, pink, and mint accents.',
    bg: '#282a36',
    fg: '#f8f8f2',
    accent: '#50fa7b',
    panelBg: '#1d1f27',
    borderColor: '#44475a',
    glow: '0 0 6px rgba(248, 248, 242, 0.4)',
    scanlineOpacity: 0.12,
    fontTitle: 'VT323',
    fontBody: 'Courier Prime',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark Teal',
    category: 'Creative & Vintage',
    emoji: '🌲',
    description: 'Precision ergonomic color palette designed for high contrast and low eye strain.',
    bg: '#002b36',
    fg: '#839496',
    accent: '#2aa198',
    panelBg: '#073642',
    borderColor: '#073642',
    glow: '0 0 4px rgba(131, 148, 150, 0.5)',
    scanlineOpacity: 0.1,
    fontTitle: 'VT323',
    fontBody: 'Courier Prime',
  },
  {
    id: 'paper',
    name: 'Vintage Parchment',
    category: 'Creative & Vintage',
    emoji: '📜',
    description: 'Warm antique paper and sepia ink for distraction-free novel reading & poetry.',
    bg: '#f4ecd8',
    fg: '#5c4033',
    accent: '#8b0000',
    panelBg: '#fcf8ed',
    borderColor: '#d2b48c',
    glow: 'none',
    scanlineOpacity: 0.0,
    fontTitle: 'Georgia',
    fontBody: 'Georgia',
  },
  {
    id: 'sakura',
    name: 'Retro Sakura Pastel',
    category: 'Creative & Vintage',
    emoji: '🌸',
    description: 'Soft pink aesthetic inspired by Japanese retro arcade cabinets.',
    bg: '#fff0f5',
    fg: '#8b008b',
    accent: '#ff69b4',
    panelBg: '#ffe4e1',
    borderColor: '#ffb6c1',
    glow: '0 0 4px rgba(255, 105, 180, 0.4)',
    scanlineOpacity: 0.05,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Courier Prime',
  },
  {
    id: 'slate',
    name: 'Slate Terminal',
    category: 'Modern & Minimal',
    emoji: '🌑',
    description: 'Modern slate dark aesthetic tailored for software engineering notes.',
    bg: '#0f172a',
    fg: '#f8fafc',
    accent: '#38bdf8',
    panelBg: '#1e293b',
    borderColor: '#334155',
    glow: 'none',
    scanlineOpacity: 0.05,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Courier Prime',
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    category: 'Modern & Minimal',
    emoji: '⬛',
    description: 'Deep neutral dark theme with royal blue highlights.',
    bg: '#0c0a0f',
    fg: '#e2e8f0',
    accent: '#3b82f6',
    panelBg: '#1a202c',
    borderColor: '#4a5568',
    glow: 'none',
    scanlineOpacity: 0.05,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Courier Prime',
  },
  {
    id: 'amoled',
    name: 'Pure Pitch AMOLED',
    category: 'Modern & Minimal',
    emoji: '📱',
    description: '100% pure black OLED background with bright white text and cyan accents.',
    bg: '#000000',
    fg: '#ffffff',
    accent: '#00ffcc',
    panelBg: '#111111',
    borderColor: '#222222',
    glow: 'none',
    scanlineOpacity: 0.0,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Courier Prime',
  },
  {
    id: 'light',
    name: 'Clean Light Canvas',
    category: 'Modern & Minimal',
    emoji: '⚪',
    description: 'Crisp white canvas with dark charcoal text for high-daylight readability.',
    bg: '#f3f4f6',
    fg: '#1f2937',
    accent: '#2563eb',
    panelBg: '#ffffff',
    borderColor: '#9ca3af',
    glow: 'none',
    scanlineOpacity: 0.02,
    fontTitle: 'Share Tech Mono',
    fontBody: 'Courier Prime',
  },
];

// Helper functions for theme management and localStorage persistence
export const DEFAULT_SETTINGS: ThemeSettings = {
  themeId: 'green',
  scanlineOpacity: 1.0,
  flickerEnabled: true,
  soundEnabled: true,
};

export function getThemeDef(themeId: string): ThemeDef {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const savedTheme = localStorage.getItem('retronotes-theme') || 'green';
    const savedScanline = localStorage.getItem('retronotes-scanline-opacity');
    const savedFlicker = localStorage.getItem('retronotes-flicker-enabled');
    const savedSound = localStorage.getItem('retronotes-sounds');

    return {
      themeId: savedTheme,
      scanlineOpacity: savedScanline !== null ? parseFloat(savedScanline) : 1.0,
      flickerEnabled: savedFlicker !== 'false',
      soundEnabled: savedSound !== 'false',
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveThemeSettings(settings: Partial<ThemeSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    if (settings.themeId) {
      localStorage.setItem('retronotes-theme', settings.themeId);
      document.documentElement.setAttribute('data-theme', settings.themeId);
    }
    if (settings.scanlineOpacity !== undefined) {
      localStorage.setItem('retronotes-scanline-opacity', String(settings.scanlineOpacity));
      document.documentElement.style.setProperty(
        '--user-scanline-multiplier',
        String(settings.scanlineOpacity)
      );
    }
    if (settings.flickerEnabled !== undefined) {
      localStorage.setItem('retronotes-flicker-enabled', String(settings.flickerEnabled));
      if (settings.flickerEnabled) {
        document.documentElement.classList.add('crt-flicker-active');
      } else {
        document.documentElement.classList.remove('crt-flicker-active');
      }
    }
    if (settings.soundEnabled !== undefined) {
      localStorage.setItem('retronotes-sounds', String(settings.soundEnabled));
    }
  } catch (e) {
    console.error('Failed to save theme settings:', e);
  }
}

export function applyThemeToDOM(settings: ThemeSettings): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', settings.themeId);
  document.documentElement.style.setProperty(
    '--user-scanline-multiplier',
    String(settings.scanlineOpacity)
  );
  if (settings.flickerEnabled) {
    document.documentElement.classList.add('crt-flicker-active');
  } else {
    document.documentElement.classList.remove('crt-flicker-active');
  }
}
