import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component
const App = () => <div>Hello World</div>

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('performs basic math', () => {
    expect(2 + 2).toBe(4)
  })
}) 