export async function changeSlide(controller: any, newIndex: number) {
  if (
    controller.isTransitioning ||
    !controller.currentProject ||
    !controller.currentProject.slides
  )
    return

  controller.isTransitioning = true
  controller.isContentVisible = false

  await new Promise((resolve) => setTimeout(resolve, 150))

  const skeletonTimeout = window.setTimeout(() => {
    if (!imageLoaded) {
      controller.isImageLoading = true
    }
  }, 150)
  let imageLoaded = false

  try {
    const newSlide = controller.currentProject.slides[newIndex]
    if (newSlide?.image?.src) {
      await controller.preloadImage(newSlide.image.src)
    }

    imageLoaded = true
    clearTimeout(skeletonTimeout)

    controller.isImageLoading = false
    controller.currentSlideIndex = newIndex
    controller.isContentVisible = true

    await new Promise((resolve) => setTimeout(resolve, 150))
  } catch {
    imageLoaded = true
    clearTimeout(skeletonTimeout)
    controller.isImageLoading = false
    controller.currentSlideIndex = newIndex
    controller.isContentVisible = true
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  controller.isTransitioning = false
}
