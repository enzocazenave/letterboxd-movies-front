import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SelectWithSearch from '../components/ui/SelectWithSearch'

describe('SelectWithSearch', () => {
  const mockOptions = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' },
  ]

  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with label and placeholder', () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        label="Test Select"
        placeholder="Search..."
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Test Select')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('opens dropdown on focus', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
  })

  it('filters options based on input', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Option 1' } })

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
    })
  })

  it('calls onChange when option is selected', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      const option = screen.getByText('Option 1')
      fireEvent.mouseDown(option)
    })

    expect(mockOnChange).toHaveBeenCalledWith(mockOptions[0])
  })

  it('shows selected option in input', () => {
    render(
      <SelectWithSearch
        name="test"
        value={1}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Option 1')
  })

  it('clears selection when clear button is clicked', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={1}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const clearButton = screen.getByLabelText('Limpiar selección')
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('shows "Sin resultados" when no options match', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'NonExistent' } })

    await waitFor(() => {
      expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    })
  })

  it('navigates options with arrow keys', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('closes dropdown on Escape key', async () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })
  })

  it('renders disabled state correctly', () => {
    render(
      <SelectWithSearch
        name="test"
        value={null}
        options={mockOptions}
        onChange={mockOnChange}
        disabled
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('shows loading state during fetch', async () => {
    const mockFetcher = vi.fn((_q: string, _signal: AbortSignal) => 
      new Promise<{ value: string | number; label: string }[]>(resolve => 
        setTimeout(() => resolve([]), 100)
      )
    )

    render(
      <SelectWithSearch
        name="test"
        value={null}
        fetcher={mockFetcher}
        minChars={1}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Buscando…')).toBeInTheDocument()
    }, { timeout: 500 })
  })
})
