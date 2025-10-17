import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DirectorChip from '../components/movies/DirectorChip'
import PlatformBadge from '../components/movies/PlatformBadge'
import GenreBadge from '../components/movies/GenreBadge'
import Pill from '../components/movies/Pill'
import ActiveBadge from '../components/movies/ActiveBadge'

describe('DirectorChip', () => {
  it('renders director name with image', () => {
    render(<DirectorChip nombre="Christopher Nolan" imagen="/director.jpg" />)
    expect(screen.getByText('Christopher Nolan')).toBeInTheDocument()
  })

  it('renders with correct styling', () => {
    const { container } = render(<DirectorChip nombre="Quentin Tarantino" imagen="/director2.jpg" />)
    const chip = container.querySelector('.rounded-full')
    expect(chip).toBeInTheDocument()
  })

  it('renders without image', () => {
    render(<DirectorChip nombre="Steven Spielberg" imagen="" />)
    expect(screen.getByText('Steven Spielberg')).toBeInTheDocument()
  })

  it('handles long names', () => {
    const longName = "Director With A Very Very Long Name That Should Still Render"
    render(<DirectorChip nombre={longName} imagen="/dir.jpg" />)
    expect(screen.getByText(longName)).toBeInTheDocument()
  })
})

describe('PlatformBadge', () => {
  it('renders platform with image logo', () => {
    render(<PlatformBadge name="Netflix" logoUrl="/logos/netflix.png" />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    
    const img = screen.getByRole('img', { name: /netflix/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('netflix.png'))
  })

  it('renders platform without logo', () => {
    render(<PlatformBadge name="HBO Max" logoUrl="" />)
    expect(screen.getByText('HBO Max')).toBeInTheDocument()
  })

  it('renders platform with empty string logo', () => {
    render(<PlatformBadge name="Prime Video" logoUrl="" />)
    expect(screen.getByText('Prime Video')).toBeInTheDocument()
  })

  it('handles full URL logo', () => {
    render(<PlatformBadge name="Apple TV+" logoUrl="https://example.com/logo.png" />)
    const img = screen.getByRole('img', { name: /apple tv\+/i })
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png')
  })
})

describe('GenreBadge', () => {
  it('renders genre name', () => {
    render(<GenreBadge label="Action" />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders multiple genres', () => {
    const { rerender } = render(<GenreBadge label="Sci-Fi" />)
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    
    rerender(<GenreBadge label="Thriller" />)
    expect(screen.getByText('Thriller')).toBeInTheDocument()
  })

  it('handles special characters in name', () => {
    render(<GenreBadge label="Science-Fiction & Fantasy" />)
    expect(screen.getByText('Science-Fiction & Fantasy')).toBeInTheDocument()
  })
})

describe('Pill', () => {
  it('renders children content', () => {
    render(<Pill>Test Content</Pill>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with custom content', () => {
    render(
      <Pill>
        <span>Custom Pill</span>
      </Pill>
    )
    expect(screen.getByText('Custom Pill')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    const { container } = render(<Pill>{''}</Pill>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple pills', () => {
    render(
      <>
        <Pill>Pill 1</Pill>
        <Pill>Pill 2</Pill>
        <Pill>Pill 3</Pill>
      </>
    )
    expect(screen.getByText('Pill 1')).toBeInTheDocument()
    expect(screen.getByText('Pill 2')).toBeInTheDocument()
    expect(screen.getByText('Pill 3')).toBeInTheDocument()
  })
})

describe('ActiveBadge', () => {
  it('renders active badge when active=true', () => {
    render(<ActiveBadge active={true} />)
    expect(screen.getByText(/activa/i)).toBeInTheDocument()
  })

  it('renders inactive badge when active=false', () => {
    render(<ActiveBadge active={false} />)
    expect(screen.getByText(/inactiva/i)).toBeInTheDocument()
  })

  it('has correct styling for active state', () => {
    const { container } = render(<ActiveBadge active={true} />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-emerald-500/15')
  })

  it('has correct styling for inactive state', () => {
    const { container } = render(<ActiveBadge active={false} />)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-rose-500/15')
  })
})
