import { render, screen, fireEvent } from '../../../utils/test-utils'
import { vi } from 'vitest'
import Input from '../../../../components/ui/Input/Input'

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Username" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Username')
    fireEvent.change(input, { target: { value: 'testuser' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('testuser')
  })

  it('displays error state correctly', () => {
    render(
      <Input 
        label="Username" 
        error={true}
        helperText="This field is required"
      />
    )
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    // Find the root element of the Input component
    const inputRoot = screen.getByLabelText('Username').closest('.MuiInputBase-root')
    expect(inputRoot).toHaveClass('Mui-error')
  })

  it('applies different variants correctly', () => {
    const { rerender } = render(<Input label="Standard" variant="standard" />)
    const standardInput = screen.getByLabelText('Standard').closest('.MuiInputBase-root')
    expect(standardInput).toHaveClass('MuiInput-root')

    rerender(<Input label="Outlined" variant="outlined" />)
    const outlinedInput = screen.getByLabelText('Outlined').closest('.MuiInputBase-root')
    expect(outlinedInput).toHaveClass('MuiOutlinedInput-root')

    rerender(<Input label="Filled" variant="filled" />)
    const filledInput = screen.getByLabelText('Filled').closest('.MuiInputBase-root')
    expect(filledInput).toHaveClass('MuiFilledInput-root')
  })

  it('handles disabled state', () => {
    render(<Input label="Disabled Input" disabled />)
    expect(screen.getByLabelText('Disabled Input')).toBeDisabled()
  })

  it('handles required state', () => {
    render(<Input label="Required Input" required />)
    expect(screen.getByLabelText('Required Input *')).toBeInTheDocument()
  })

  it('handles placeholder text', () => {
    render(<Input label="With Placeholder" placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('handles multiline input', () => {
    render(<Input label="Multiline" multiline rows={3} />)
    const textarea = screen.getByLabelText('Multiline')
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
    expect(textarea).toHaveAttribute('rows', '3')
  })
}) 