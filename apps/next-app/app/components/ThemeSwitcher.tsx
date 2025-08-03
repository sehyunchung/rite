'use client';

import { useState, useEffect } from 'react';
import { Button } from '@rite/ui';
import { PaletteIcon } from 'lucide-react';
import { alternativeThemes, type AlternativeThemeKey, generateThemeCSS } from '@rite/ui/design-tokens';

const themes = [
  { key: 'riteRefined', name: 'RITE Refined', description: 'Enhanced readability', icon: '🎨' },
  { key: 'oceanDepth', name: 'Deep Ocean', description: 'Mysterious depths', icon: '🌊' },
  { key: 'joshComeau', name: 'Josh Comeau', description: 'Atmospheric gradients', icon: '✨' },
  { key: 'monochromeLight', name: 'Light Mode', description: 'Clean minimal light', icon: '☀️' },
  { key: 'monochromeDark', name: 'Dark Mode', description: 'Clean minimal dark', icon: '🌙' },
] as const;

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AlternativeThemeKey>('joshComeau');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('rite-theme') as AlternativeThemeKey;
    if (savedTheme && alternativeThemes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Apply default theme if no saved theme
      applyTheme('joshComeau');
    }
  }, []);

  const applyTheme = (themeKey: AlternativeThemeKey) => {
    const theme = alternativeThemes[themeKey];
    const css = generateThemeCSS(theme);
    
    // Remove existing theme style
    const existingStyle = document.getElementById('rite-theme-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new theme style
    const style = document.createElement('style');
    style.id = 'rite-theme-style';
    style.textContent = css;
    document.head.appendChild(style);
  };

  const switchTheme = (themeKey: AlternativeThemeKey) => {
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    localStorage.setItem('rite-theme', themeKey);
    setIsOpen(false);
  };

  const currentThemeInfo = themes.find(t => t.key === currentTheme) || themes[0];

  // Hide theme switcher in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <PaletteIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentThemeInfo.name}</span>
        <span className="sm:hidden">{currentThemeInfo.icon}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-neutral-700 border border-neutral-600 rounded-md shadow-lg z-50 min-w-[200px]">
          {themes.map((theme) => (
            <button
              key={theme.key}
              onClick={() => switchTheme(theme.key)}
              className={`w-full px-3 py-2 text-left text-sm text-white hover:bg-neutral-600 flex items-center gap-3 ${
                currentTheme === theme.key ? 'bg-neutral-600 font-medium' : ''
              }`}
            >
              <span className="text-base">{theme.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{theme.name}</span>
                <span className="text-xs text-neutral-400">{theme.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}