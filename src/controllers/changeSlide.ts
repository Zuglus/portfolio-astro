import type { ModalController } from './modalController'
import { delay } from '../utils/delay'

export async function changeSlide(
  controller: ModalController,
  newIndex: number,
) {
  if (
    controller.isTransitioning ||
    !controller.currentProject ||
    !controller.currentProject.slides
  )
    return

  controller.isTransitioning = true
  controller.isContentVisible = false

  await delay(150)

  let imageLoaded = false
  const skeletonTimeout = window.setTimeout(() => {
    if (!imageLoaded) {
      controller.isImageLoading = true
    }
  }, 150)

  try {
    const newSlide = controller.currentProject.slides[newIndex]
    if (newSlide?.image?.src) {
      await controller.preloadImage(newSlide.image.src)
    }
  } catch {
    // ignore preload errors
  } finally {
    imageLoaded = true
    clearTimeout(skeletonTimeout)
    controller.isImageLoading = false
    controller.currentSlideIndex = newIndex
    controller.isContentVisible = true
    await delay(150)
    controller.isTransitioning = false
  }
}
