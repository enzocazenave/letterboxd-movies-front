import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../components/ui/ConfirmDialog'

describe('ConfirmDialog Component', () => {
  it('does not render when open=false', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Title"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when open=true', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        description="Are you sure?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Delete Movie')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)
    
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        confirmText="Delete"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(confirmButton)
    
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('closes on Escape key press', () => {
    const onCancel = vi.fn()
    
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        onCancel={onCancel}
        onConfirm={() => {}}
      />
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders custom confirm button text', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        confirmText="Confirm Delete"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    )
    
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
  })

  it('renders without description', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Movie"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    )
    
    expect(screen.getByText('Delete Movie')).toBeInTheDocument()
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})
