import type { ModalController } from './modalController'
import type { RuntimeProject } from './modal-store'
import { lockBodyScroll } from './modal-ui'

export async function openModal(
  controller: ModalController,
  projectId: string,
) {
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
    lockBodyScroll()

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
