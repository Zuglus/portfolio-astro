import type { RuntimeProject } from './modalController'

export async function openModal(controller: any, projectId: string) {
  if (controller.isModalOpen) return

  const projects = (window as Window & { portfolioProjects?: RuntimeProject[] })
    .portfolioProjects
  if (!projects) return

  const project = projects.find((p) => p.id === projectId)
  if (project) {
    controller.currentProject = project
    controller.currentSlideIndex = 0
    controller.isContentVisible = false
    controller.isInitialLoad = true
    controller.isModalOpen = true
    document.body.style.overflow = 'hidden'

    try {
      const firstSlide = project.slides?.[0]
      if (firstSlide?.image?.src) {
        await controller.preloadImage(firstSlide.image.src)
      }
      controller.isInitialLoad = false
      controller.isContentVisible = true
    } catch {
      controller.isInitialLoad = false
      controller.isContentVisible = true
    }
  }
}
