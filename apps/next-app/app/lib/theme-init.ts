import { alternativeThemes, generateThemeCSS } from '@rite/ui/design-tokens';

type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Generate inline CSS for the default theme (Josh Comeau dark)
 * This can be used for server-side rendering to avoid FOUC (Flash of Unstyled Content)
 */
export function getDefaultThemeCSS(): string {
	const defaultTheme = alternativeThemes.joshComeau;
	return generateThemeCSS(defaultTheme);
}

/**
 * Script to initialize theme from localStorage or apply default theme
 * This should be inlined in the HTML head to run immediately
 */
export function getThemeInitScript(): string {
	const validModes: ThemeMode[] = ['dark', 'light', 'system'];

	return `
    (function() {
      try {
        const savedMode = localStorage.getItem('rite-theme-mode');
        const validModes = ${JSON.stringify(validModes)};
        
        // Get system theme preference
        const getSystemTheme = () => {
          return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'joshComeau' : 'joshComeauLight';
        };
        
        // Calculate actual theme based on mode
        const calculateActualTheme = (mode) => {
          switch (mode) {
            case 'dark': return 'joshComeau';
            case 'light': return 'joshComeauLight';
            case 'system': return getSystemTheme();
            default: return 'joshComeau';
          }
        };
        
        const initialMode = savedMode && validModes.includes(savedMode) ? savedMode : 'dark';
        const actualTheme = calculateActualTheme(initialMode);
        
        // Apply theme CSS
        const alternativeThemes = {
          joshComeau: ${JSON.stringify(alternativeThemes.joshComeau)},
          joshComeauLight: ${JSON.stringify(alternativeThemes.joshComeauLight)}
        };
        
        const theme = alternativeThemes[actualTheme];
        const generateThemeCSS = (theme) => {
          return \`
/* \${theme.name} - \${theme.type} theme */
:root {
  /* Brand Colors */
  --brand-primary: \${theme.brand.primary};
  --brand-primary-dark: \${theme.brand.primaryDark};
  --brand-primary-light: \${theme.brand.primaryLight};
  --brand-accent: \${theme.accent};
  
  /* Background Colors */
  --bg-primary: \${theme.type === 'dark' ? theme.neutral[800] : theme.functional.backgroundSubtle};
  --bg-secondary: \${theme.type === 'dark' ? theme.neutral[700] : theme.functional.backgroundElevated};
  --bg-tertiary: \${theme.type === 'dark' ? theme.neutral[600] : theme.functional.border};
  --bg-elevated: \${theme.functional.backgroundElevated};
  
  /* Text Colors */
  --text-primary: \${theme.functional.textPrimary};
  --text-secondary: \${theme.functional.textSecondary};
  --text-muted: \${theme.functional.textMuted};
  --text-disabled: \${theme.functional.textDisabled};
  --text-inverse: \${theme.functional.textInverse};
  
  /* Border Colors */
  --border-default: \${theme.functional.border};
  --border: \${theme.functional.border};
  --border-strong: \${theme.functional.borderStrong};
  --border-subtle: \${theme.functional.borderSubtle};
  
  /* Interactive States */
  --interactive-hover: \${theme.interactive.hover};
  --interactive-active: \${theme.interactive.active};
  --interactive-focus: \${theme.interactive.focus};
  --interactive-disabled: \${theme.interactive.disabled};
  
  /* Semantic Colors */
  --color-success: \${theme.semantic.success};
  --color-warning: \${theme.semantic.warning};
  --color-error: \${theme.semantic.error};
  --color-info: \${theme.semantic.info};
  
  /* Button Colors */
  --button-primary-text: \${theme.type === 'light' ? theme.neutral[900] : theme.neutral[0]};
  
  /* Neutral Scale */
  --neutral-0: \${theme.neutral[0]};
  --neutral-50: \${theme.neutral[50]};
  --neutral-100: \${theme.neutral[100]};
  --neutral-200: \${theme.neutral[200]};
  --neutral-300: \${theme.neutral[300]};
  --neutral-400: \${theme.neutral[400]};
  --neutral-500: \${theme.neutral[500]};
  --neutral-600: \${theme.neutral[600]};
  --neutral-700: \${theme.neutral[700]};
  --neutral-800: \${theme.neutral[800]};
  --neutral-900: \${theme.neutral[900]};
}\`.trim();
        };
        
        const css = generateThemeCSS(theme);
        const style = document.createElement('style');
        style.id = 'rite-theme-style';
        style.textContent = css;
        document.head.appendChild(style);
      } catch (e) {
        console.warn('Failed to initialize theme:', e);
      }
    })();
  `;
}
