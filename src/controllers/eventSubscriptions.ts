export function subscribeToModalEvents(controller: any) {
  document.addEventListener('open-modal', (e: Event) => {
    const ce = e as CustomEvent<{ projectId?: string }>
    if (ce.detail?.projectId) {
      controller.openModal(ce.detail.projectId)
    }
  })

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!controller.isModalOpen) return

    if (e.key === 'Escape') {
      if (controller.isImageZoomed) {
        controller.closeZoom()
      } else {
        controller.closeModal()
      }
    } else if (e.key === 'ArrowRight' && !controller.isImageZoomed) {
      controller.nextSlide()
    } else if (e.key === 'ArrowLeft' && !controller.isImageZoomed) {
      controller.prevSlide()
    }
  })
}
