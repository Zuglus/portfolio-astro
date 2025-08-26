import { openModal } from './openModal'
import { changeSlide } from './changeSlide'
import { subscribeToModalEvents } from './eventSubscriptions'
import { ModalStore } from './modal-store'
import { updateCloseHint, unlockBodyScroll } from './modal-ui'

export default function createModalController() {
  const store = new ModalStore()

  return Object.assign(store, {
    init() {
      subscribeToModalEvents(this)
      updateCloseHint(this.$nextTick)
    },

    openModal(projectId: string) {
      return openModal(this, projectId)
    },

    changeSlide(newIndex: number) {
      return changeSlide(this, newIndex)
    },

    closeModal() {
      ModalStore.prototype.closeModal.call(this)
      unlockBodyScroll()
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
  })
}

export type ModalController = ReturnType<typeof createModalController>
