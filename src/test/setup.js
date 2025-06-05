import '@testing-library/jest-dom';

// Mock для ImageMetadata из Astro
global.mockImageMetadata = (src, width = 400, height = 300) => ({
  src: src || '/test-image.png',
  width,
  height,
  format: 'png'
});

// Mock для Astro.props
global.mockAstroProps = (props = {}) => ({
  Astro: {
    props
  }
});

// Мок для Alpine.js
global.Alpine = {
  start: vi.fn(),
  data: vi.fn()
};

window.Alpine = global.Alpine;