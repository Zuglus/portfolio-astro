export default function ModalController() {
  return {
    isModalOpen: false,
    currentProject: null as any,
    currentSlideIndex: 0,
    isTransitioning: false,
    isContentVisible: true,
    isImageLoading: false,
    isInitialLoad: false,
    currentImageAspectRatio: null as number | null,
    isImageZoomed: false,

    init() {
      this.setupEventListeners()
      this.updateCloseHint()
    },

    setupEventListeners() {
      document.addEventListener('open-modal', (e: any) => {
        this.openModal(e.detail.projectId)
      })

      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (!this.isModalOpen) return

        if (e.key === 'Escape') {
          if (this.isImageZoomed) {
            this.closeZoom()
          } else {
            this.closeModal()
          }
        } else if (e.key === 'ArrowRight' && !this.isImageZoomed) {
          this.nextSlide()
        } else if (e.key === 'ArrowLeft' && !this.isImageZoomed) {
          this.prevSlide()
        }
      })
    },

    async openModal(projectId: string) {
      if (this.isModalOpen) return

      const projects = (window as any).portfolioProjects
      if (!projects) return

      const project = projects.find((p: any) => p.id === projectId)
      if (project) {
        this.currentProject = project
        this.currentSlideIndex = 0
        this.isContentVisible = false
        this.isInitialLoad = true
        this.isModalOpen = true
        document.body.style.overflow = 'hidden'

        // Загружаем первое изображение
        try {
          const firstSlide = project.slides?.[0]
          if (firstSlide?.image?.src) {
            await this.preloadImage(firstSlide.image.src)
          }

          this.isInitialLoad = false
          this.isContentVisible = true
        } catch (error) {
          // Если изображение не загрузилось, все равно показываем контент
          this.isInitialLoad = false
          this.isContentVisible = true
        }
      }
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
          // Определяем соотношение сторон
          this.currentImageAspectRatio = img.width / img.height
          resolve(img)
        }
        img.onerror = () => reject()
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

    async changeSlide(newIndex: number) {
      if (
        this.isTransitioning ||
        !this.currentProject ||
        !this.currentProject.slides
      )
        return

      this.isTransitioning = true
      this.isContentVisible = false

      // Ждем завершения fade-out анимации
      await new Promise((resolve) => setTimeout(resolve, 150))

      let skeletonTimeout: any
      let imageLoaded = false

      // Таймер для показа скелетона через 150ms если изображение еще не загрузилось
      skeletonTimeout = setTimeout(() => {
        if (!imageLoaded) {
          this.isImageLoading = true
        }
      }, 150)

      try {
        // Предзагружаем новое изображение
        const newSlide = this.currentProject.slides[newIndex]
        if (newSlide?.image?.src) {
          await this.preloadImage(newSlide.image.src)
        }

        imageLoaded = true
        clearTimeout(skeletonTimeout)

        // Скрываем скелетон и меняем слайд
        this.isImageLoading = false
        this.currentSlideIndex = newIndex
        this.isContentVisible = true

        // Ждем завершения fade-in анимации
        await new Promise((resolve) => setTimeout(resolve, 150))
      } catch (error) {
        // Если изображение не загрузилось, все равно показываем слайд
        imageLoaded = true
        clearTimeout(skeletonTimeout)
        this.isImageLoading = false
        this.currentSlideIndex = newIndex
        this.isContentVisible = true
        await new Promise((resolve) => setTimeout(resolve, 150))
      }

      this.isTransitioning = false
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
      // Определяем устройство по наличию тачскрина
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
