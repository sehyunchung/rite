import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher'

// Mock the @rite/ui design tokens
vi.mock('@rite/ui/design-tokens', () => ({
  alternativeThemes: {
    riteRefined: { name: 'RITE Refined' },
    oceanDepth: { name: 'Deep Ocean' },
    joshComeau: { name: 'Josh Comeau' },
    monochromeLight: { name: 'Light Mode' },
    monochromeDark: { name: 'Dark Mode' },
  },
  generateThemeCSS: vi.fn(() => ':root { --brand-primary: #E946FF; }'),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  PaletteIcon: () => <span data-testid="palette-icon">🎨</span>,
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock document methods
const mockStyleElement = {
  id: '',
  textContent: '',
  remove: vi.fn(),
}

const originalCreateElement = document.createElement
const originalGetElementById = document.getElementById
const originalAppendChild = document.head.appendChild

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset NODE_ENV for each test
    delete process.env.NODE_ENV

    // Mock document methods
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'style') {
        return mockStyleElement as any
      }
      return originalCreateElement.call(document, tagName)
    })

    document.getElementById = vi.fn((id) => {
      if (id === 'rite-theme-style') {
        return null
      }
      return originalGetElementById.call(document, id)
    })

    document.head.appendChild = vi.fn()
  })

  afterEach(() => {
    document.createElement = originalCreateElement
    document.getElementById = originalGetElementById
    document.head.appendChild = originalAppendChild
  })

  describe('Production Environment', () => {
    it('should not render in production', () => {
      process.env.NODE_ENV = 'production'
      
      const { container } = render(<ThemeSwitcher />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should render theme switcher in development', () => {
      render(<ThemeSwitcher />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument()
    })

    it('should default to joshComeau theme', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      render(<ThemeSwitcher />)
      
      await waitFor(() => {
        expect(screen.getByText('Josh Comeau')).toBeInTheDocument()
      })
    })

    it('should load saved theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('oceanDepth')
      
      render(<ThemeSwitcher />)
      
      await waitFor(() => {
        expect(screen.getByText('Deep Ocean')).toBeInTheDocument()
      })
    })

    it('should fallback to default theme if saved theme is invalid', async () => {
      localStorageMock.getItem.mockReturnValue('invalidTheme')
      
      render(<ThemeSwitcher />)
      
      await waitFor(() => {
        expect(screen.getByText('Josh Comeau')).toBeInTheDocument()
      })
    })

    it('should toggle dropdown when button is clicked', () => {
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('RITE Refined')).toBeInTheDocument()
      expect(screen.getByText('Enhanced readability')).toBeInTheDocument()
    })

    it('should display all available themes in dropdown', () => {
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('RITE Refined')).toBeInTheDocument()
      expect(screen.getByText('Deep Ocean')).toBeInTheDocument()
      expect(screen.getByText('Josh Comeau')).toBeInTheDocument()
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })

    it('should switch theme when a theme option is clicked', async () => {
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      const oceanThemeButton = screen.getByText('Deep Ocean')
      fireEvent.click(oceanThemeButton)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('rite-theme', 'oceanDepth')
      
      await waitFor(() => {
        expect(screen.getByText('Deep Ocean')).toBeInTheDocument()
      })
    })

    it('should close dropdown after selecting a theme', () => {
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      const oceanThemeButton = screen.getByText('Deep Ocean')
      fireEvent.click(oceanThemeButton)
      
      expect(screen.queryByText('Enhanced readability')).not.toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', () => {
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('Enhanced readability')).toBeInTheDocument()
      
      // Click the overlay
      const overlay = document.querySelector('.fixed.inset-0')
      fireEvent.click(overlay!)
      
      expect(screen.queryByText('Enhanced readability')).not.toBeInTheDocument()
    })

    it('should apply theme styles to document head', async () => {
      render(<ThemeSwitcher />)
      
      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('style')
        expect(mockStyleElement.id).toBe('rite-theme-style')
        expect(document.head.appendChild).toHaveBeenCalledWith(mockStyleElement)
      })
    })

    it('should remove existing theme style before applying new one', async () => {
      const existingStyleElement = { remove: vi.fn() }
      document.getElementById = vi.fn(() => existingStyleElement as any)
      
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      const oceanThemeButton = screen.getByText('Deep Ocean')
      fireEvent.click(oceanThemeButton)
      
      await waitFor(() => {
        expect(existingStyleElement.remove).toHaveBeenCalled()
      })
    })

    it('should highlight current theme in dropdown', () => {
      localStorageMock.getItem.mockReturnValue('oceanDepth')
      
      render(<ThemeSwitcher />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      const oceanThemeButton = screen.getByText('Deep Ocean').closest('button')
      expect(oceanThemeButton).toHaveClass('bg-neutral-600', 'font-medium')
    })

    it('should show theme icon on mobile and name on desktop', () => {
      localStorageMock.getItem.mockReturnValue('joshComeau')
      
      render(<ThemeSwitcher />)
      
      expect(screen.getByText('Josh Comeau')).toHaveClass('hidden', 'sm:inline')
      expect(screen.getByText('✨')).toHaveClass('sm:hidden')
    })
  })

  describe('Environment Variable Edge Cases', () => {
    it('should render when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV
      
      render(<ThemeSwitcher />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      
      render(<ThemeSwitcher />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      
      render(<ThemeSwitcher />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should not render when NODE_ENV is production (strict equality)', () => {
      process.env.NODE_ENV = 'production'
      
      const { container } = render(<ThemeSwitcher />)
      
      expect(container.firstChild).toBeNull()
    })
  })
})