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
})
