import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import createModalController, {
  ModalController,
  RuntimeProject,
} from '../modalController'
import { OPEN_MODAL_EVENT } from '../../utils/events'

// Define Alpine mock type
interface AlpineMock {
  store: ReturnType<typeof vi.fn>
}

// Mock global Alpine store
;(globalThis as { Alpine?: AlpineMock }).Alpine = {
  store: vi.fn(),
}

describe('ModalController', () => {
  let controller: ModalController

  beforeEach(() => {
    // Reset mocks and create a new controller before each test
    vi.clearAllMocks()
    const alpineStoreMock = (name: string): RuntimeProject[] => {
      if (name === 'projects') {
        return [
          {
            id: '1',
            title: 'Test Project',
            description: 'A test project',
            audience: 'Testers',
            slides: [
              { image: { src: 'img1.jpg' } },
              { image: { src: 'img2.jpg' } },
            ],
          },
        ]
      }
      return []
    }
    ;(globalThis as { Alpine?: AlpineMock }).Alpine?.store.mockImplementation(
      alpineStoreMock,
    )

    controller = createModalController()
    // Mock methods that interact with DOM or have complex async logic
    vi.spyOn(controller, 'preloadImage').mockResolvedValue(new Image())
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  // --- State and Core Logic Tests (from modal-store.test.ts) ---
  it('resets state on closeModal', async () => {
    vi.useFakeTimers()
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

    controller.closeModal()

    expect(controller.isModalOpen).toBe(false)

    // State reset is delayed
    await vi.runAllTimersAsync()

    expect(controller.currentProject).toBeNull()
    expect(controller.currentSlideIndex).toBe(0)
    expect(controller.isImageZoomed).toBe(false)
  })

  it('calculates next and previous slide indices', async () => {
    const changeSlideSpy = vi
      .spyOn(controller, 'changeSlide')
      .mockResolvedValue()
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, {}, {}],
    }

    controller.currentSlideIndex = 0
    controller.nextSlide()
    expect(changeSlideSpy).toHaveBeenCalledWith(1)

    controller.currentSlideIndex = 2
    controller.nextSlide()
    expect(changeSlideSpy).toHaveBeenCalledWith(0) // Wraps around

    controller.currentSlideIndex = 0
    controller.prevSlide()
    expect(changeSlideSpy).toHaveBeenCalledWith(2) // Wraps around
  })

  it('returns the current slide', () => {
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{ task: 'a' }, { task: 'b' }],
    }
    controller.currentSlideIndex = 1
    expect(controller.currentSlide).toEqual({ task: 'b' })
  })

  // --- Integration and Event Tests (from modalController.test.ts) ---
  it('openModal loads project data from Alpine store', async () => {
    await controller.openModal('1')

    expect(controller.isModalOpen).toBe(true)
    expect(controller.currentProject?.id).toBe('1')
    expect(controller.preloadImage).toHaveBeenCalledWith('img1.jpg')
    expect(controller.isInitialLoad).toBe(false)
    expect(controller.isContentVisible).toBe(true)
  })

  it('changeSlide updates slide index and handles transitions', async () => {
    vi.useFakeTimers()
    controller.currentProject = {
      id: '1',
      title: 'Test',
      description: '',
      audience: '',
      slides: [{}, { image: { src: 'img2.jpg' } }],
    }

    const promise = controller.changeSlide(1)
    await vi.runAllTimersAsync()
    await promise

    expect(controller.currentSlideIndex).toBe(1)
    expect(controller.isTransitioning).toBe(false)
    expect(controller.preloadImage).toHaveBeenCalledWith('img2.jpg')
  })

  it('initializes and responds to global events', () => {
    const openModalSpy = vi.spyOn(controller, 'openModal')
    const closeModalSpy = vi.spyOn(controller, 'closeModal')
    const nextSlideSpy = vi.spyOn(controller, 'nextSlide')
    const prevSlideSpy = vi.spyOn(controller, 'prevSlide')
    const closeZoomSpy = vi.spyOn(controller, 'closeZoom')

    controller.init() // Set up event listeners

    // Test OPEN_MODAL_EVENT
    document.dispatchEvent(
      new CustomEvent(OPEN_MODAL_EVENT, { detail: { projectId: '1' } }),
    )
    expect(openModalSpy).toHaveBeenCalledWith('1')

    controller.isModalOpen = true

    // Test keyboard events
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(nextSlideSpy).toHaveBeenCalled()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(prevSlideSpy).toHaveBeenCalled()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(closeModalSpy).toHaveBeenCalledTimes(1)

    // Reset for the next check
    controller.isModalOpen = true
    controller.isImageZoomed = true
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(closeZoomSpy).toHaveBeenCalledTimes(1)
  })

  it('isLandscapeImage returns correct boolean', () => {
    controller.currentImageAspectRatio = null
    expect(controller.isLandscapeImage).toBe(false)

    controller.currentImageAspectRatio = 1.2
    expect(controller.isLandscapeImage).toBe(false)

    controller.currentImageAspectRatio = 1.6
    expect(controller.isLandscapeImage).toBe(true)
  })
})
