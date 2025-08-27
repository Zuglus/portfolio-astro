import { describe, it, expect, vi } from 'vitest'
import createModalController from '../controllers/modalController'
import type { RuntimeProject } from '../controllers/modal-store'
import { subscribeToModalEvents } from '../controllers/eventSubscriptions'

describe('ModalController', () => {
  it('resets state on closeModal', () => {
    const controller = createModalController()
    controller.isModalOpen = true
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [],
    }
    controller.currentSlideIndex = 2
    controller.isImageZoomed = true
    document.body.style.overflow = 'hidden'

    controller.closeModal()

    expect(controller.isModalOpen).toBe(false)
    expect(controller.currentProject).toBeNull()
    expect(controller.currentSlideIndex).toBe(0)
    expect(controller.isImageZoomed).toBe(false)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('calculates next and previous slide indices', () => {
    const controller = createModalController()
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}, {}],
    }
    controller.currentSlideIndex = 0
    controller.changeSlide = vi.fn()

    controller.nextSlide()
    expect(controller.changeSlide).toHaveBeenCalledWith(1)

    controller.prevSlide()
    expect(controller.changeSlide).toHaveBeenCalledWith(2)
  })

  it('openModal loads project data', async () => {
    const controller = createModalController()
    controller.preloadImage = vi.fn().mockResolvedValue(new Image())
    ;(globalThis as typeof globalThis & {
      Alpine: { store: (name: string) => RuntimeProject[] }
    }).Alpine = {
      store: vi.fn().mockImplementation((name: string) => {
        if (name === 'projects') {
          return [
            {
              id: '1',
              title: 'Test',
              description: '',
              audience: '',
              slides: [{ image: { src: 'img.jpg' } }],
            },
          ]
        }
        return []
      }),
    }

    await controller.openModal('1')

    expect(controller.isModalOpen).toBe(true)
    expect(controller.currentProject?.id).toBe('1')
    expect(controller.isInitialLoad).toBe(false)
    expect(controller.isContentVisible).toBe(true)
  })

  it('changeSlide updates slide index', async () => {
    vi.useFakeTimers()
    const controller = createModalController()
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, { image: { src: 'img2.jpg' } }],
    }
    controller.preloadImage = vi.fn().mockResolvedValue(new Image())

    const promise = controller.changeSlide(1)
    await vi.runAllTimersAsync()
    await promise

    expect(controller.currentSlideIndex).toBe(1)
    expect(controller.isTransitioning).toBe(false)
    vi.useRealTimers()
  })

  it('subscribes to modal events', () => {
    const controller = createModalController()
    controller.openModal = vi.fn()
    controller.closeModal = vi.fn()
    controller.nextSlide = vi.fn()
    controller.prevSlide = vi.fn()
    controller.closeZoom = vi.fn()

    subscribeToModalEvents(controller)

    document.dispatchEvent(
      new CustomEvent('open-modal', { detail: { projectId: '1' } }),
    )
    expect(controller.openModal).toHaveBeenCalledWith('1')

    controller.isModalOpen = true
    document.body.style.overflow = 'hidden'
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(controller.nextSlide).toHaveBeenCalled()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(controller.prevSlide).toHaveBeenCalled()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(controller.closeModal).toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('')

    controller.isImageZoomed = true
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(controller.closeZoom).toHaveBeenCalled()
  })
})
