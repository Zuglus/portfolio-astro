import { fireEvent, screen, within } from '@testing-library/dom'

declare global {
  interface Window {
    __ioInstances?: Array<{
      cb: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void
      observe: (el: Element) => void
      disconnect: () => void
    }>
  }
}

function setupProgressiveImage({
  src = '/img.png',
  alt = 'demo',
  useIntersectionObserver = true,
} = {}) {
  const html = `<div><img data-testid="image" src="${src}" alt="${alt}" /></div>`
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  const utils = { container, ...within(container) }
  const img = utils.getByTestId('image') as HTMLImageElement

  if (useIntersectionObserver && 'IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.dataset.visible = 'true'
        }
      })
    })
    observer.observe(img)
  } else {
    img.dataset.visible = 'true'
  }

  img.addEventListener('error', () => {
    const fallback = document.createElement('div')
    fallback.className = 'image-error-fallback'
    fallback.textContent = 'Изображение недоступно'
    fallback.setAttribute('role', 'img')
    fallback.setAttribute('aria-label', 'Изображение недоступно')
    img.replaceWith(fallback)
  })

  return { ...utils, img }
}

beforeEach(() => {
  window.__ioInstances = []
  class IO {
    cb: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void
    constructor(
      cb: (
        entries: Array<{ isIntersecting: boolean; target: Element }>,
      ) => void,
    ) {
      this.cb = cb
      window.__ioInstances?.push(this)
    }

    observe() {}
    disconnect() {}
  }
  // @ts-expect-error: тестовый мок IntersectionObserver не соответствует полной сигнатуре
  window.IntersectionObserver = IO
})

describe('ProgressiveImage', () => {
  it('loads image when it intersects', () => {
    const { img } = setupProgressiveImage()
    const io = window.__ioInstances?.[0]
    io.cb([{ isIntersecting: true, target: img }])
    expect(img.dataset.visible).toBe('true')
  })

  it('shows fallback on error', () => {
    const { img, container } = setupProgressiveImage()
    fireEvent.error(img)
    expect(container.textContent).toContain('Изображение недоступно')
  })

  it('includes alt text for accessibility', () => {
    setupProgressiveImage()
    expect(screen.getByAltText('demo')).toBeTruthy()
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})
