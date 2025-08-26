import { openModal } from './openModal'
import { changeSlide } from './changeSlide'
import { subscribeToModalEvents } from './eventSubscriptions'

type RuntimeImage = { src?: string; width?: number; height?: number }
type RuntimeSlide = { image?: RuntimeImage; task?: string; solution?: string }
export type RuntimeProject = {
  id: string
  title: string
  description: string
  audience: string
  slides: RuntimeSlide[]
}

export default function createModalController() {
  return {
    isModalOpen: false,
    currentProject: null as RuntimeProject | null,
    currentSlideIndex: 0,
    isTransitioning: false,
    isContentVisible: true,
    isImageLoading: false,
    isInitialLoad: false,
    currentImageAspectRatio: null as number | null,
    isImageZoomed: false,

    init() {
      subscribeToModalEvents(this)
      this.updateCloseHint()
    },

    openModal(projectId: string) {
      return openModal(this, projectId)
    },

    closeModal() {
      this.isModalOpen = false
      this.currentProject = null
      this.currentSlideIndex = 0
      this.isContentVisible = true
      this.isImageLoading = false
      this.isInitialLoad = false
      this.isImageZoomed = false
      document.body.style.overflow = ''
    },

    zoomImage() {
      if (this.isTransitioning || this.isImageLoading || this.isInitialLoad)
        return
      this.isImageZoomed = true
    },

    closeZoom() {
      this.isImageZoomed = false
    },

    preloadImage(src: string) {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          this.currentImageAspectRatio = img.width / img.height
          resolve(img)
        }
        img.onerror = () => reject(new Error('Image failed to load'))
        img.src = src
      })
    },

    get isLandscapeImage() {
      return this.currentImageAspectRatio && this.currentImageAspectRatio > 1.5
    },

    get imageContainerClasses() {
      if (this.isLandscapeImage) {
        return 'max-w-full max-h-[55vh] md:max-h-[60vh]'
      }
      return 'max-w-full max-h-[65vh] md:max-h-[70vh]'
    },

    get skeletonClasses() {
      if (this.isLandscapeImage) {
        return 'w-full max-w-5xl h-[55vh] md:h-[60vh]'
      }
      return 'w-full max-w-4xl h-[65vh] md:h-[70vh]'
    },

    changeSlide(newIndex: number) {
      return changeSlide(this, newIndex)
    },

    nextSlide() {
      if (!this.currentProject || !this.currentProject.slides) return

      const totalSlides = this.currentProject.slides.length
      const newIndex = (this.currentSlideIndex + 1) % totalSlides
      this.changeSlide(newIndex)
    },

    prevSlide() {
      if (!this.currentProject || !this.currentProject.slides) return

      const totalSlides = this.currentProject.slides.length
      const newIndex =
        this.currentSlideIndex === 0
          ? totalSlides - 1
          : this.currentSlideIndex - 1
      this.changeSlide(newIndex)
    },

    goToSlide(index: number) {
      if (
        !this.currentProject ||
        !this.currentProject.slides ||
        index === this.currentSlideIndex
      )
        return
      this.changeSlide(index)
    },

    get currentSlide() {
      return this.currentProject?.slides?.[this.currentSlideIndex] || null
    },

    updateCloseHint() {
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0

      this.$nextTick(() => {
        const hintElement = document.getElementById('close-hint')
        if (hintElement) {
          hintElement.textContent = isTouchDevice
            ? 'тап для закрытия'
            : 'ESC или клик для закрытия'
        }
      })
    },
  }
}
