import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Example test - replace with actual component tests
describe('Example Component', () => {
  it('should render hello world', () => {
    render(<div>Hello World</div>)
    
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})