import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock для ImageMetadata из Astro
/** @returns {{ src: string, width: number, height: number, format: 'png' }} */
global.mockImageMetadata = (src, width = 400, height = 300) => ({
  src: src || '/test-image.png',
  width,
  height,
  format: /** @type {'png'} */ ('png'),
})

// Mock для Astro.props
global.mockAstroProps = (props = {}) => ({
  Astro: {
    props,
  },
})

// Мок для Alpine.js
global.Alpine = {
  start: vi.fn(),
  data: vi.fn(),
}

window.Alpine = global.Alpine
