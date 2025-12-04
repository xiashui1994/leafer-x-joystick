import { describe, expect, test, beforeEach, vi } from 'vitest'
import { Joystick, Direction } from '../src'
import { Ellipse, Group } from '@leafer-ui/core'

describe('Joystick', () => {
  describe('Initialization', () => {
    test('should create joystick with default settings', () => {
      const joystick = new Joystick()

      expect(joystick).toBeInstanceOf(Group)
      expect(joystick.outer).toBeDefined()
      expect(joystick.inner).toBeDefined()
      expect(joystick.outerRadius).toBeGreaterThan(0)
      expect(joystick.innerRadius).toBeGreaterThan(0)
    })

    test('should create joystick with custom outer and inner elements', () => {
      const customOuter = new Ellipse({ width: 150, height: 150, fill: '#ff0000' })
      const customInner = new Ellipse({ width: 80, height: 80, fill: '#00ff00' })

      const joystick = new Joystick({
        outer: customOuter,
        inner: customInner,
      })

      expect(joystick.outer).toBe(customOuter)
      expect(joystick.inner).toBe(customInner)
    })

    test('should apply custom scales', () => {
      const joystick = new Joystick({
        outerScale: { x: 1.5, y: 1.5 },
        innerScale: { x: 0.8, y: 0.8 },
      })

      expect(joystick.outer.scaleX).toBe(1.5)
      expect(joystick.outer.scaleY).toBe(1.5)
      expect(joystick.inner.scaleX).toBe(0.8)
      expect(joystick.inner.scaleY).toBe(0.8)
    })

    test('should set inner element to center position initially', () => {
      const joystick = new Joystick()

      const outerScaledWidth = (joystick.outer.width || 0) * joystick.outer.scaleX
      const outerScaledHeight = (joystick.outer.height || 0) * joystick.outer.scaleY
      const innerScaledWidth = (joystick.inner.width || 0) * joystick.inner.scaleX
      const innerScaledHeight = (joystick.inner.height || 0) * joystick.inner.scaleY

      const expectedX = outerScaledWidth / 2 - innerScaledWidth / 2
      const expectedY = outerScaledHeight / 2 - innerScaledHeight / 2

      expect(joystick.inner.x).toBe(expectedX)
      expect(joystick.inner.y).toBe(expectedY)
    })

    test('should have pointer cursor enabled', () => {
      const joystick = new Joystick()
      expect(joystick.cursor).toBe('pointer')
    })

    test('should add outer and inner to children', () => {
      const joystick = new Joystick()
      expect(joystick.children).toContain(joystick.outer)
      expect(joystick.children).toContain(joystick.inner)
    })

    test('should have inner opacity set to standby value initially', () => {
      const joystick = new Joystick()
      expect(joystick.inner.opacity).toBe(joystick.innerAlphaStandby)
    })
  })

  describe('getPower()', () => {
    let joystick: Joystick

    beforeEach(() => {
      joystick = new Joystick()
    })

    test('should return 0 when center point is at origin', () => {
      const power = (joystick as any).getPower({ x: 0, y: 0 })
      expect(power).toBe(0)
    })

    test('should return power proportional to distance', () => {
      const power1 = (joystick as any).getPower({ x: 10, y: 0 })
      const power2 = (joystick as any).getPower({ x: 20, y: 0 })

      expect(power2).toBeGreaterThan(power1)
    })

    test('should return power for diagonal movement', () => {
      const power = (joystick as any).getPower({ x: 10, y: 10 })

      // sqrt(10^2 + 10^2) / outerRadius should equal power
      const distance = Math.sqrt(10 * 10 + 10 * 10)
      const expectedPower = Math.min(1, distance / joystick.outerRadius)

      expect(power).toBeCloseTo(expectedPower)
    })

    test('should cap power at 1', () => {
      const power = (joystick as any).getPower({
        x: joystick.outerRadius * 10,
        y: joystick.outerRadius * 10,
      })

      expect(power).toBeLessThanOrEqual(1)
      expect(power).toBe(1)
    })

    test('should handle negative coordinates', () => {
      const powerPositive = (joystick as any).getPower({ x: 10, y: 10 })
      const powerNegative = (joystick as any).getPower({ x: -10, y: -10 })

      expect(powerPositive).toBeCloseTo(powerNegative)
    })

    test('should return correct power at boundary', () => {
      const power = (joystick as any).getPower({
        x: joystick.outerRadius,
        y: 0,
      })

      expect(power).toBeCloseTo(1)
    })
  })

  describe('getDirection()', () => {
    let joystick: Joystick

    beforeEach(() => {
      joystick = new Joystick()
    })

    test('should return RIGHT for positive x, neutral y', () => {
      const direction = (joystick as any).getDirection({ x: 10, y: 0 })
      expect(direction).toBe(Direction.RIGHT)
    })

    test('should return LEFT for negative x with small negative y', () => {
      const direction = (joystick as any).getDirection({ x: -100, y: -1 })
      expect(direction).toBe(Direction.LEFT)
    })

    test('should return BOTTOM for positive y, neutral x', () => {
      const direction = (joystick as any).getDirection({ x: 0, y: 10 })
      expect(direction).toBe(Direction.BOTTOM)
    })

    test('should return TOP for negative y, neutral x', () => {
      const direction = (joystick as any).getDirection({ x: 0, y: -10 })
      expect(direction).toBe(Direction.TOP)
    })

    test('should return BOTTOM_RIGHT for positive x and y', () => {
      const direction = (joystick as any).getDirection({ x: 10, y: 10 })
      expect(direction).toBe(Direction.BOTTOM_RIGHT)
    })

    test('should return TOP_LEFT for negative x and y', () => {
      const direction = (joystick as any).getDirection({ x: -10, y: -10 })
      expect(direction).toBe(Direction.TOP_LEFT)
    })

    test('should return BOTTOM_LEFT for negative x and positive y', () => {
      const direction = (joystick as any).getDirection({ x: -10, y: 10 })
      expect(direction).toBe(Direction.BOTTOM_LEFT)
    })

    test('should return TOP_RIGHT for positive x and negative y', () => {
      const direction = (joystick as any).getDirection({ x: 10, y: -10 })
      expect(direction).toBe(Direction.TOP_RIGHT)
    })

    test('should handle edge cases near boundaries', () => {
      // Angles near 0 degrees (RIGHT)
      const rightDirSmallAngle = (joystick as any).getDirection({ x: 100, y: 1 })
      expect(rightDirSmallAngle).toBe(Direction.RIGHT)

      // Angles near 45 degrees (BOTTOM_RIGHT)
      const brDir = (joystick as any).getDirection({ x: 100, y: 50 })
      expect(brDir).toBe(Direction.BOTTOM_RIGHT)

      // Angles near 90 degrees (BOTTOM)
      const bottomDir = (joystick as any).getDirection({ x: 1, y: 100 })
      expect(bottomDir).toBe(Direction.BOTTOM)
    })

    test('should handle very small coordinates', () => {
      const direction = (joystick as any).getDirection({ x: 0.001, y: 0.001 })
      expect(direction).toBe(Direction.BOTTOM_RIGHT)
    })
  })

  describe('Callbacks', () => {
    test('should store onStart callback when provided', () => {
      const onStart = vi.fn()
      const joystick = new Joystick({ onStart })

      expect(joystick.settings.onStart).toBe(onStart)
    })

    test('should call onEnd callback when provided', () => {
      const onEnd = vi.fn()
      const joystick = new Joystick({ onEnd })

      expect(joystick.settings.onEnd).toBe(onEnd)
    })

    test('should call onChange callback when provided', () => {
      const onChange = vi.fn()
      const joystick = new Joystick({ onChange })

      expect(joystick.settings.onChange).toBe(onChange)
    })

    test('should handle multiple callbacks', () => {
      const onStart = vi.fn()
      const onChange = vi.fn()
      const onEnd = vi.fn()

      const joystick = new Joystick({ onStart, onChange, onEnd })

      expect(joystick.settings.onStart).toBe(onStart)
      expect(joystick.settings.onChange).toBe(onChange)
      expect(joystick.settings.onEnd).toBe(onEnd)
    })
  })

  describe('Scaling and Positioning', () => {
    test('should calculate correct outer radius with scale', () => {
      const joystick = new Joystick({
        outerScale: { x: 2, y: 2 },
      })

      const outerScaledWidth = (joystick.outer.width || 0) * 2
      const expectedRadius = outerScaledWidth / 2.5

      expect(joystick.outerRadius).toBe(expectedRadius)
    })

    test('should calculate correct inner radius with scale', () => {
      const joystick = new Joystick({
        innerScale: { x: 1.5, y: 1.5 },
      })

      const innerScaledWidth = (joystick.inner.width || 0) * 1.5
      const expectedRadius = innerScaledWidth / 2

      expect(joystick.innerRadius).toBe(expectedRadius)
    })

    test('should apply different x and y scales', () => {
      const joystick = new Joystick({
        outerScale: { x: 1.2, y: 0.8 },
      })

      expect(joystick.outer.scaleX).toBe(1.2)
      expect(joystick.outer.scaleY).toBe(0.8)
    })

    test('should position inner element relative to outer', () => {
      const joystick = new Joystick({
        outerScale: { x: 1.5, y: 1.5 },
        innerScale: { x: 0.9, y: 0.9 },
      })

      const outerScaledWidth = (joystick.outer.width || 0) * 1.5
      const outerScaledHeight = (joystick.outer.height || 0) * 1.5
      const innerScaledWidth = (joystick.inner.width || 0) * 0.9
      const innerScaledHeight = (joystick.inner.height || 0) * 0.9

      const expectedX = outerScaledWidth / 2 - innerScaledWidth / 2
      const expectedY = outerScaledHeight / 2 - innerScaledHeight / 2

      expect(joystick.inner.x).toBe(expectedX)
      expect(joystick.inner.y).toBe(expectedY)
    })
  })

  describe('Settings merge', () => {
    test('should preserve provided settings', () => {
      const customOuter = new Ellipse({ width: 100, height: 100 })
      const onStart = vi.fn()

      const joystick = new Joystick({
        outer: customOuter,
        outerScale: { x: 1.5, y: 1.5 },
        onStart,
      })

      expect(joystick.settings.outer).toBe(customOuter)
      expect(joystick.settings.outerScale).toEqual({ x: 1.5, y: 1.5 })
      expect(joystick.settings.onStart).toBe(onStart)
    })

    test('should merge with default settings', () => {
      const joystick = new Joystick({
        outerScale: { x: 2, y: 2 },
      })

      expect(joystick.settings.outerScale).toEqual({ x: 2, y: 2 })
      expect(joystick.settings.innerScale).toEqual({ x: 1, y: 1 })
    })
  })

  describe('Direction Enum', () => {
    test('should have all direction values', () => {
      expect(Direction.LEFT).toBe('left')
      expect(Direction.RIGHT).toBe('right')
      expect(Direction.TOP).toBe('top')
      expect(Direction.BOTTOM).toBe('bottom')
      expect(Direction.TOP_LEFT).toBe('top_left')
      expect(Direction.TOP_RIGHT).toBe('top_right')
      expect(Direction.BOTTOM_LEFT).toBe('bottom_left')
      expect(Direction.BOTTOM_RIGHT).toBe('bottom_right')
    })
  })

  describe('Edge cases', () => {
    test('should handle zero-sized elements gracefully', () => {
      const zeroOuter = new Ellipse({ width: 0, height: 0 })
      const zeroInner = new Ellipse({ width: 0, height: 0 })

      const joystick = new Joystick({
        outer: zeroOuter,
        inner: zeroInner,
      })

      expect(joystick.outerRadius).toBe(0)
      expect(joystick.innerRadius).toBe(0)
    })

    test('should handle very large scale values', () => {
      const joystick = new Joystick({
        outerScale: { x: 100, y: 100 },
        innerScale: { x: 100, y: 100 },
      })

      expect(joystick.outerRadius).toBeGreaterThan(0)
      expect(joystick.innerRadius).toBeGreaterThan(0)
    })

    test('should handle very small scale values', () => {
      const joystick = new Joystick({
        outerScale: { x: 0.01, y: 0.01 },
        innerScale: { x: 0.01, y: 0.01 },
      })

      expect(joystick.outerRadius).toBeGreaterThan(0)
      expect(joystick.innerRadius).toBeGreaterThan(0)
    })

    test('should handle asymmetric scales', () => {
      const joystick = new Joystick({
        outerScale: { x: 2, y: 0.5 },
      })

      expect(joystick.outer.scaleX).toBe(2)
      expect(joystick.outer.scaleY).toBe(0.5)
    })
  })
})