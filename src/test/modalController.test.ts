import { describe, it, expect, vi } from 'vitest'
import ModalController from '../components/ModalController'

describe('ModalController', () => {
  it('resets state on closeModal', () => {
    const controller = ModalController()
    controller.isModalOpen = true
    controller.currentProject = { id: '1', slides: [] } as any
    controller.currentSlideIndex = 2
    controller.isImageZoomed = true

    controller.closeModal()

    expect(controller.isModalOpen).toBe(false)
    expect(controller.currentProject).toBeNull()
    expect(controller.currentSlideIndex).toBe(0)
    expect(controller.isImageZoomed).toBe(false)
  })

  it('calculates next and previous slide indices', () => {
    const controller = ModalController()
    controller.currentProject = { slides: [1, 2, 3] } as any
    controller.currentSlideIndex = 0
    controller.changeSlide = vi.fn()

    controller.nextSlide()
    expect(controller.changeSlide).toHaveBeenCalledWith(1)

    controller.prevSlide()
    expect(controller.changeSlide).toHaveBeenCalledWith(2)
  })
})
