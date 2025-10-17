import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'

describe('UI Components - Input', () => {
  it('renders input with label', () => {
    render(
      <Input
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(
      <Input
        name="test"
        value=""
        onChange={handleChange}
      />
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays placeholder', () => {
    render(
      <Input
        name="test"
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />
    )
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with initial value', () => {
    render(
      <Input
        name="test"
        value="initial value"
        onChange={() => {}}
      />
    )
    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument()
  })
})

describe('UI Components - Textarea', () => {
  it('renders textarea with label', () => {
    render(
      <Textarea
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(
      <Textarea
        name="test"
        value=""
        onChange={handleChange}
      />
    )
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays placeholder', () => {
    render(
      <Textarea
        name="test"
        value=""
        onChange={() => {}}
        placeholder="Enter description"
      />
    )
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })
})

describe('UI Components - Select', () => {
  it('renders select with label', () => {
    render(
      <Select
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays placeholder', () => {
    render(
      <Select
        name="test"
        value=""
        onChange={() => {}}
        placeholder="Select an option"
      />
    )
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('calls onChange when option is selected', () => {
    const handleChange = vi.fn()
    render(
      <Select
        name="test"
        value=""
        onChange={handleChange}
      />
    )
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })
    expect(handleChange).toHaveBeenCalled()
  })
})
