import { describe, it, expect } from 'vitest'
import cls from '../utils/cls'
import formatDate from '../utils/formatDate'
import formatMinutes from '../utils/formatMinutes'
import { availablePermissions, hasPermission } from '../utils/permissions'

describe('Utils - cls', () => {
  it('concatenates class names correctly', () => {
    expect(cls('class1', 'class2')).toBe('class1 class2')
  })

  it('filters out falsy values', () => {
    expect(cls('class1', false, 'class2', null, undefined)).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cls('base', isActive && 'active')).toBe('base active')
  })

  it('returns empty string for all falsy values', () => {
    expect(cls(false, null, undefined, '')).toBe('')
  })
})

describe('Utils - formatDate', () => {
  it('formats date correctly', () => {
    const date = '2024-12-25'
    const formatted = formatDate(date)
    expect(formatted).toContain('2024')
  })

  it('handles invalid dates gracefully', () => {
    const result = formatDate('invalid-date')
    expect(result).toBeDefined()
  })
})

describe('Utils - formatMinutes', () => {
  it('formats minutes correctly', () => {
    expect(formatMinutes(90)).toBe('90 min')
  })

  it('formats only minutes when less than 60', () => {
    expect(formatMinutes(45)).toBe('45 min')
  })

  it('formats exact hours', () => {
    expect(formatMinutes(120)).toBe('120 min')
  })

  it('handles zero minutes', () => {
    expect(formatMinutes(0)).toBe('0 min')
  })
})

describe('Utils - permissions', () => {
  it('has correct permission constants', () => {
    expect(availablePermissions.CREATE_MOVIE).toBe('create_movie')
    expect(availablePermissions.EDIT_MOVIE).toBe('edit_movie')
    expect(availablePermissions.DELETE_MOVIE).toBe('delete_movie')
  })

  it('returns true when user has permission', () => {
    const userPermissions = ['create_movie', 'edit_movie']
    expect(hasPermission(userPermissions, 'create_movie')).toBe(true)
  })

  it('returns false when user does not have permission', () => {
    const userPermissions = ['create_movie']
    expect(hasPermission(userPermissions, 'delete_movie')).toBe(false)
  })

  it('returns false for empty permissions array', () => {
    expect(hasPermission([], 'create_movie')).toBe(false)
  })
})
