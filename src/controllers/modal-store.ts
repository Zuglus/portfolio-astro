import type { RuntimeProject } from './modalController'

export type RuntimeImage = { src?: string; width?: number; height?: number }
export type RuntimeSlide = {
  image?: RuntimeImage
  task?: string
  solution?: string
}

export class ModalStore {
  isModalOpen = false
  currentProject: RuntimeProject | null = null
  currentSlideIndex = 0
  isTransitioning = false
  isContentVisible = true
  isImageLoading = false
  isInitialLoad = false
  currentImageAspectRatio: number | null = null
  isImageZoomed = false

  // will be replaced by controller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeSlide(_newIndex: number) {
    return undefined
  }

  closeModal() {
    this.isModalOpen = false
    this.currentProject = null
    this.currentSlideIndex = 0
    this.isTransitioning = false
    this.isContentVisible = true
    this.isImageLoading = false
    this.isInitialLoad = false
    this.currentImageAspectRatio = null
    this.isImageZoomed = false
  }

  nextSlide() {
    if (!this.currentProject || !this.currentProject.slides) return
    const totalSlides = this.currentProject.slides.length
    const newIndex = (this.currentSlideIndex + 1) % totalSlides
    this.changeSlide(newIndex)
  }

  prevSlide() {
    if (!this.currentProject || !this.currentProject.slides) return
    const totalSlides = this.currentProject.slides.length
    const newIndex =
      this.currentSlideIndex === 0
        ? totalSlides - 1
        : this.currentSlideIndex - 1
    this.changeSlide(newIndex)
  }

  goToSlide(index: number) {
    if (!this.currentProject || !this.currentProject.slides) return
    const totalSlides = this.currentProject.slides.length
    if (index < 0 || index >= totalSlides || index === this.currentSlideIndex) {
      return
    }
    this.changeSlide(index)
  }

  get currentSlide() {
    return this.currentProject?.slides?.[this.currentSlideIndex] || null
  }
}
