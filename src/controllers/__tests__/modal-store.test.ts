import { describe, it, expect, vi } from 'vitest'
import { ModalStore } from '../modal-store'

describe('ModalStore', () => {
  it('resets state on closeModal', () => {
    const store = new ModalStore()
    store.isModalOpen = true
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [],
    }
    store.currentSlideIndex = 2
    store.isImageZoomed = true
    document.body.style.overflow = 'hidden'

    store.closeModal()

    expect(store.isModalOpen).toBe(false)
    expect(store.currentProject).toBeNull()
    expect(store.currentSlideIndex).toBe(0)
    expect(store.isTransitioning).toBe(false)
    expect(store.isContentVisible).toBe(true)
    expect(store.isImageLoading).toBe(false)
    expect(store.isInitialLoad).toBe(false)
    expect(store.currentImageAspectRatio).toBeNull()
    expect(store.isImageZoomed).toBe(false)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('calculates next and previous slide indices', () => {
    const store = new ModalStore()
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}, {}],
    }
    store.changeSlide = vi.fn()

    store.currentSlideIndex = 0
    store.nextSlide()
    expect(store.changeSlide).toHaveBeenCalledWith(1)

    store.changeSlide = vi.fn()
    store.currentSlideIndex = 0
    store.prevSlide()
    expect(store.changeSlide).toHaveBeenCalledWith(2)
  })

  it('wraps slide indices at boundaries', () => {
    const store = new ModalStore()
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}],
    }

    store.changeSlide = vi.fn()
    store.currentSlideIndex = 1
    store.nextSlide()
    expect(store.changeSlide).toHaveBeenCalledWith(0)

    store.changeSlide = vi.fn()
    store.currentSlideIndex = 0
    store.prevSlide()
    expect(store.changeSlide).toHaveBeenCalledWith(1)
  })

  it('does not change slides when project or slides are missing', () => {
    const store = new ModalStore()
    store.changeSlide = vi.fn()

    store.nextSlide()
    store.prevSlide()
    store.goToSlide(1)

    expect(store.changeSlide).not.toHaveBeenCalled()
  })

  it('goToSlide only changes when index differs', () => {
    const store = new ModalStore()
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}, {}],
    }
    store.changeSlide = vi.fn()

    store.currentSlideIndex = 1
    store.goToSlide(1)
    expect(store.changeSlide).not.toHaveBeenCalled()

    store.goToSlide(2)
    expect(store.changeSlide).toHaveBeenCalledWith(2)
  })

  it('goToSlide ignores out-of-range indices', () => {
    const store = new ModalStore()
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}],
    }
    store.changeSlide = vi.fn()

    store.goToSlide(-1)
    store.goToSlide(5)

    expect(store.changeSlide).not.toHaveBeenCalled()
  })

  it('returns the current slide', () => {
    const store = new ModalStore()
    store.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{ task: 'a' }, { task: 'b' }],
    }
    store.currentSlideIndex = 1

    expect(store.currentSlide).toEqual({ task: 'b' })
  })
})
