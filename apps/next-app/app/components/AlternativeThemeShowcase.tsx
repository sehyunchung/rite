'use client';

import { useState } from 'react';
import { alternativeThemes, AlternativeThemeKey, generateThemeCSS } from '@rite/ui/design-tokens';

export function AlternativeThemeShowcase() {
  const [selectedTheme, setSelectedTheme] = useState<AlternativeThemeKey>('joshComeau');
  const theme = alternativeThemes[selectedTheme];

  const getBackgroundColor = () => {
    return theme.type === 'dark' ? theme.neutral[800] : theme.neutral[0];
  };

  const getCardBackground = () => {
    return theme.type === 'dark' ? theme.neutral[700] : theme.neutral[50];
  };

  const getBorderColor = () => {
    return theme.type === 'dark' ? theme.neutral[600] : theme.neutral[200];
  };

  return (
    <div 
      className="min-h-screen p-8 transition-colors duration-500" 
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ color: theme.brand.primary }}>
            RITE Theme System
          </h1>
          <p className="text-lg" style={{ color: theme.functional.textSecondary }}>
            Josh Comeau inspired dark & light themes
          </p>
        </div>

        {/* Theme Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(alternativeThemes).map(([key, themeOption]) => (
            <button
              key={key}
              onClick={() => setSelectedTheme(key as AlternativeThemeKey)}
              className={`
                group relative overflow-hidden rounded-2xl transition-all duration-300 border-2 p-6 text-left
                ${selectedTheme === key ? 'scale-105' : 'hover:scale-105'}
              `}
              style={{
                backgroundColor: themeOption.type === 'dark' ? themeOption.neutral[700] : themeOption.neutral[50],
                borderColor: selectedTheme === key ? themeOption.brand.primary : (themeOption.type === 'dark' ? themeOption.neutral[600] : themeOption.neutral[200]),
                boxShadow: selectedTheme === key ? `0 0 0 4px ${themeOption.brand.primary}40` : 'none',
              }}
            >
              {/* Theme preview */}
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-xl shadow-lg border flex items-center justify-center"
                  style={{ 
                    backgroundColor: themeOption.brand.primary,
                    borderColor: themeOption.type === 'dark' ? themeOption.neutral[500] : themeOption.neutral[300]
                  }}
                >
                  <span style={{ 
                    color: themeOption.neutral[0]
                  }}>
                    {themeOption.type === 'dark' ? '🌙' : '☀️'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-lg font-semibold mb-1"
                    style={{ color: themeOption.type === 'dark' ? themeOption.neutral[0] : themeOption.neutral[900] }}
                  >
                    {themeOption.name}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ 
                      backgroundColor: themeOption.type === 'dark' ? themeOption.neutral[600] : themeOption.neutral[200],
                      color: themeOption.type === 'dark' ? themeOption.neutral[200] : themeOption.neutral[700]
                    }}
                  >
                    {themeOption.type}
                  </span>
                </div>
              </div>
              
              <p 
                className="text-sm"
                style={{ color: themeOption.type === 'dark' ? themeOption.neutral[300] : themeOption.neutral[600] }}
              >
                {themeOption.description}
              </p>

              {/* Color preview strip */}
              <div className="mt-4 flex gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: themeOption.brand.primary,
                    borderColor: themeOption.type === 'dark' ? themeOption.neutral[500] : themeOption.neutral[300]
                  }}
                />
                <div 
                  className="w-8 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: themeOption.accent,
                    borderColor: themeOption.type === 'dark' ? themeOption.neutral[500] : themeOption.neutral[300]
                  }}
                />
                <div 
                  className="w-8 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: themeOption.semantic.success,
                    borderColor: themeOption.type === 'dark' ? themeOption.neutral[500] : themeOption.neutral[300]
                  }}
                />
                <div 
                  className="w-8 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: themeOption.semantic.error,
                    borderColor: themeOption.type === 'dark' ? themeOption.neutral[500] : themeOption.neutral[300]
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Selected Theme Details */}
        <div 
          className="p-8 rounded-3xl border-2 shadow-2xl transition-all duration-500"
          style={{ 
            backgroundColor: getCardBackground(),
            borderColor: theme.brand.primary 
          }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-4xl font-bold" style={{ color: theme.brand.primary }}>
                {theme.name}
              </h2>
              <span 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: theme.interactive.hover,
                  color: theme.brand.primary
                }}
              >
                {theme.type} theme
              </span>
            </div>
            <p className="text-lg" style={{ color: theme.functional.textSecondary }}>
              {theme.description}
            </p>
          </div>

          {/* Color System Display */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.functional.textPrimary }}>
                Brand Colors
              </h3>
              <div className="space-y-3">
                {Object.entries(theme.brand).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-xl shadow-lg border"
                      style={{ 
                        backgroundColor: color,
                        borderColor: getBorderColor()
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: theme.functional.textPrimary }}>
                        {key}
                      </p>
                      <p className="text-xs font-mono" style={{ color: theme.functional.textMuted }}>
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg border"
                    style={{ 
                      backgroundColor: theme.accent,
                      borderColor: getBorderColor()
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.functional.textPrimary }}>
                      accent
                    </p>
                    <p className="text-xs font-mono" style={{ color: theme.functional.textMuted }}>
                      {theme.accent}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.functional.textPrimary }}>
                Semantic Colors
              </h3>
              <div className="space-y-3">
                {Object.entries(theme.semantic).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-xl shadow-lg border"
                      style={{ 
                        backgroundColor: color,
                        borderColor: getBorderColor()
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: theme.functional.textPrimary }}>
                        {key}
                      </p>
                      <p className="text-xs font-mono" style={{ color: theme.functional.textMuted }}>
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Functional Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.functional.textPrimary }}>
                Text & UI Colors
              </h3>
              <div className="space-y-3">
                {[
                  ['textPrimary', theme.functional.textPrimary],
                  ['textSecondary', theme.functional.textSecondary],
                  ['textMuted', theme.functional.textMuted],
                  ['border', theme.functional.border],
                ].map(([key, color]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg border"
                      style={{ 
                        backgroundColor: color,
                        borderColor: getBorderColor()
                      }}
                    />
                    <div>
                      <p className="text-xs" style={{ color: theme.functional.textPrimary }}>
                        {key}
                      </p>
                      <p className="text-xs font-mono" style={{ color: theme.functional.textMuted }}>
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Scale */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.functional.textPrimary }}>
                Neutral Scale
              </h3>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(theme.neutral).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-full h-12 rounded-md border mb-1"
                      style={{ 
                        backgroundColor: color,
                        borderColor: getBorderColor()
                      }}
                    />
                    <p className="text-xs" style={{ color: theme.functional.textMuted }}>
                      {key}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Component Examples */}
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold" style={{ color: theme.functional.textPrimary }}>
              Component Preview
            </h3>

            {/* Navigation Example */}
            <div 
              className="p-4 rounded-2xl shadow-lg border"
              style={{ 
                backgroundColor: theme.type === 'dark' ? theme.neutral[900] : theme.neutral[0],
                borderColor: getBorderColor()
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h4 className="text-xl font-bold" style={{ color: theme.brand.primary }}>
                    RITE
                  </h4>
                  <nav className="flex gap-4">
                    {['Events', 'Artists', 'About'].map((item) => (
                      <a 
                        key={item}
                        className="px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        style={{ color: theme.functional.textSecondary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.interactive.hover;
                          e.currentTarget.style.color = theme.brand.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.functional.textSecondary;
                        }}
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
                  style={{ 
                    backgroundColor: theme.brand.primary,
                    color: theme.neutral[0]
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Standard Card */}
              <div 
                className="p-6 rounded-2xl shadow-lg border transition-all hover:scale-105"
                style={{ 
                  backgroundColor: theme.type === 'dark' ? theme.neutral[700] : theme.neutral[0],
                  borderColor: getBorderColor()
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: theme.brand.primary }}
                >
                  <span style={{ color: theme.neutral[0] }}>
                    🎵
                  </span>
                </div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: theme.functional.textPrimary }}>
                  Event Card
                </h4>
                <p className="mb-4" style={{ color: theme.functional.textSecondary }}>
                  Experience the energy of live music
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: theme.functional.textMuted }}>
                    March 25, 2025
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: theme.semantic.success,
                      color: theme.neutral[0]
                    }}
                  >
                    Live
                  </span>
                </div>
              </div>

              {/* Featured Card */}
              <div 
                className="p-6 rounded-2xl shadow-lg transition-all hover:scale-105"
                style={{ 
                  backgroundColor: theme.brand.primary,
                  color: theme.neutral[0]
                }}
              >
                <h4 className="text-lg font-semibold mb-2">
                  Featured Event
                </h4>
                <p className="mb-4 opacity-90">
                  Don't miss this exclusive performance
                </p>
                <button 
                  className="w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
                  style={{ 
                    backgroundColor: theme.type === 'light' ? theme.neutral[900] : 'rgba(255,255,255,0.2)',
                    color: theme.type === 'light' ? theme.neutral[0] : theme.neutral[0]
                  }}
                >
                  Get Tickets
                </button>
              </div>

              {/* Stats Card */}
              <div 
                className="p-6 rounded-2xl shadow-lg border"
                style={{ 
                  backgroundColor: theme.functional.backgroundElevated,
                  borderColor: theme.accent
                }}
              >
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: theme.accent }}
                >
                  3,247
                </div>
                <p style={{ color: theme.functional.textPrimary }}>
                  Total Attendees
                </p>
                <div className="mt-4 flex gap-2">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: theme.interactive.hover,
                      color: theme.brand.primary
                    }}
                  >
                    +18%
                  </span>
                  <span className="text-sm" style={{ color: theme.functional.textMuted }}>
                    this month
                  </span>
                </div>
              </div>
            </div>

            {/* Button Examples */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium" style={{ color: theme.functional.textPrimary }}>
                Button Collection
              </h4>
              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: theme.brand.primary,
                    color: theme.neutral[0]
                  }}
                >
                  Primary
                </button>
                <button 
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90 border-2"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: theme.brand.primary,
                    borderColor: theme.brand.primary
                  }}
                >
                  Outline
                </button>
                <button 
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90 shadow-sm"
                  style={{ 
                    backgroundColor: theme.accent,
                    color: theme.type === 'light' ? theme.neutral[900] : theme.neutral[0]
                  }}
                >
                  Accent
                </button>
                <button 
                  className="px-6 py-3 rounded-xl font-medium transition-all border"
                  style={{ 
                    backgroundColor: theme.functional.backgroundElevated,
                    color: theme.functional.textPrimary,
                    borderColor: getBorderColor()
                  }}
                >
                  Neutral
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Components Testing */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold" style={{ color: theme.functional.textPrimary }}>
            Form Components
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{ color: theme.functional.textPrimary }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-12 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-base text-white placeholder:text-neutral-400 shadow-sm transition-all outline-none opacity-80 focus:border-brand-primary focus:bg-neutral-600 focus:ring-[3px] focus:ring-brand-primary focus:opacity-90 hover:border-neutral-500 hover:opacity-85"
              />
            </div>
            
            {/* Textarea */}
            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{ color: theme.functional.textPrimary }}>
                Message
              </label>
              <textarea
                placeholder="Enter your message"
                rows={3}
                className="flex field-sizing-content min-h-16 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-base text-white placeholder:text-neutral-400 shadow-sm transition-all outline-none opacity-80 focus:border-brand-primary focus:bg-neutral-600 focus:ring-[3px] focus:ring-brand-primary focus:opacity-90 hover:border-neutral-500 hover:opacity-85 resize-none"
              />
            </div>
          </div>
        </div>

        {/* CSS Variables Output */}
        <div 
          className="p-6 rounded-2xl font-mono text-sm overflow-x-auto border shadow-lg"
          style={{ 
            backgroundColor: theme.type === 'dark' ? theme.neutral[900] : theme.neutral[50],
            color: theme.functional.textSecondary,
            borderColor: getBorderColor()
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-sans font-medium" style={{ color: theme.functional.textPrimary }}>
              CSS Variables
            </h4>
            <button 
              className="px-3 py-1 rounded-md text-xs font-sans"
              style={{ 
                backgroundColor: theme.interactive.hover,
                color: theme.brand.primary
              }}
              onClick={() => {
                navigator.clipboard.writeText(generateThemeCSS(theme));
              }}
            >
              Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{generateThemeCSS(theme)}</pre>
        </div>
      </div>
    </div>
  );
}