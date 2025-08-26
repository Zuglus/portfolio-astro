import { describe, it, expect, vi, beforeEach } from 'vitest'
import progressiveImage from '../controllers/progressiveImage'

describe('progressiveImage controller', () => {
  const imageId = 'img_test'
  const animationClass = 'animate-fade-in'
  const animationDelay = 100
  const useIntersectionObserver = true

  function createController() {
    const controller = progressiveImage({
      imageId,
      animationClass,
      animationDelay,
      useIntersectionObserver,
    })
    controller.$el = document.createElement('div')
    controller.$store = {
      loading: {
        states: { IDLE: 'IDLE', LOADING: 'LOADING', LOADED: 'LOADED', ERROR: 'ERROR' },
        setState: vi.fn(),
        startLoading: vi.fn(),
        setLoaded: vi.fn(),
        setError: vi.fn(),
        remove: vi.fn(),
      },
    }
    controller.$nextTick = (cb: () => void) => cb()
    return controller
  }

  beforeEach(() => {
    // clean up any global errorHandler
    // @ts-ignore
    delete window.errorHandler
  })

  it('initializes and registers image', () => {
    const controller = createController()
    controller.initializeComponent = vi.fn()
    controller.init()

    expect(controller.$store.loading.setState).toHaveBeenCalledWith(
      imageId,
      controller.$store.loading.states.IDLE,
    )
    expect(controller.$el.dataset.imageId).toBe(imageId)
    expect(controller.$el.dataset.loadingState).toBe(
      controller.$store.loading.states.IDLE,
    )
    expect(controller.initializeComponent).toHaveBeenCalled()
  })

  it('handles image error and shows fallback when handler rejects', async () => {
    const controller = createController()
    controller.showErrorFallback = vi.fn()
    const img = document.createElement('img')
    controller.$el.appendChild(img)

    window.errorHandler = {
      handleError: vi.fn().mockRejectedValue(new Error('fail')),
    }

    await controller.onImageError()

    expect(controller.$store.loading.setError).toHaveBeenCalledWith(imageId)
    expect(controller.showErrorFallback).toHaveBeenCalled()
    expect(controller.$el.classList.contains(`${animationClass}-error`)).toBe(true)
  })
})
