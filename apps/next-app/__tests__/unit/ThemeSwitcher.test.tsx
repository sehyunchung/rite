import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher'

// Mock the @rite/ui design tokens
vi.mock('@rite/ui/design-tokens', () => ({
  alternativeThemes: {
    joshComeau: { name: 'Josh Comeau', type: 'dark' },
    joshComeauLight: { name: 'Josh Comeau Light', type: 'light' },
  },
  generateThemeCSS: vi.fn(() => ':root { --brand-primary: #7C7CFF; }'),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">🌙</span>,
  Sun: () => <span data-testid="sun-icon">☀️</span>,
  Monitor: () => <span data-testid="monitor-icon">🖥️</span>,
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

  it('should render theme toggle button', () => {
    render(<ThemeSwitcher />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })

  it('should default to dark mode', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<ThemeSwitcher />)
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  it('should load saved dark mode from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeSwitcher />)
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  it('should load saved light mode from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('light')
    
    render(<ThemeSwitcher />)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })

  it('should load saved system mode from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('system')
    
    render(<ThemeSwitcher />)
    
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument()
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    })
  })

  it('should fallback to default mode if saved mode is invalid', async () => {
    localStorageMock.getItem.mockReturnValue('invalidMode')
    
    render(<ThemeSwitcher />)
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  it('should cycle from dark to light when button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeSwitcher />)
    
    // Initially should show dark mode
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('rite-theme-mode', 'light')
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })

  it('should cycle from light to system when button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue('light')
    
    render(<ThemeSwitcher />)
    
    // Initially should show light mode
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('rite-theme-mode', 'system')
    
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument()
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    })
  })

  it('should cycle from system to dark when button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue('system')
    
    render(<ThemeSwitcher />)
    
    // Initially should show system mode
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('rite-theme-mode', 'dark')
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
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
    
    await waitFor(() => {
      expect(existingStyleElement.remove).toHaveBeenCalled()
    })
  })

  it('should show theme text on desktop and hide on mobile', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeSwitcher />)
    
    expect(screen.getByText('Dark')).toHaveClass('hidden', 'sm:inline')
  })

  it('should have proper tooltip text for dark mode', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Switch to light mode')
  })

  it('should have proper tooltip text for light mode', () => {
    localStorageMock.getItem.mockReturnValue('light')
    
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Switch to system mode')
  })

  it('should have proper tooltip text for system mode', () => {
    localStorageMock.getItem.mockReturnValue('system')
    
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Switch to dark mode')
  })

  it('should update tooltip text when cycling through modes', async () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Switch to light mode')
    
    // Click to go to light mode
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Switch to system mode')
    })

    // Click to go to system mode
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Switch to dark mode')
    })

    // Click to go back to dark mode
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })
  })
})