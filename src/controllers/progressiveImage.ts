export interface ProgressiveImageOptions {
  imageId: string
  animationClass: string
  animationDelay: number
  useIntersectionObserver: boolean
}

// Timing constants
const FORCE_INIT_DELAY_MS = 200

declare global {
  interface Window {
    appLogger?: {
      info: (...args: unknown[]) => void
      error: (...args: unknown[]) => void
    }
    errorHandler?: {
      handleError: (
        error: unknown,
        context: Record<string, unknown>,
      ) => Promise<unknown>
    }
  }
}

export default function progressiveImage({
  imageId,
  animationClass,
  animationDelay,
  useIntersectionObserver,
}: ProgressiveImageOptions) {
  return {
    $store: undefined as any,
    $el: undefined as unknown as HTMLElement,
    $nextTick: undefined as unknown as (cb: () => void) => void,
    imageId,
    imageLoaded: false,
    imageError: false,
    isVisible: false,
    animationStarted: false,
    observer: null as IntersectionObserver | null,
    isInitialized: false,

    init() {
      // Регистрируем изображение в глобальном store
      this.$store.loading.setState(
        this.imageId,
        this.$store.loading.states.IDLE,
      )

      this.$el.style.setProperty('--animation-delay', `${animationDelay}ms`)
      this.$el.classList.add(`${animationClass}-container`)
      this.$el.dataset.imageId = this.imageId
      this.$el.dataset.loadingState = this.$store.loading.states.IDLE

      // Детерминированная инициализация
      this.$nextTick(() => {
        this.initializeComponent()
      })

      // Дополнительная проверка через setTimeout
      setTimeout(() => {
        if (!this.isInitialized) {
          this.forceInitialize()
        }
      }, FORCE_INIT_DELAY_MS)
    },

    initializeComponent() {
      if (this.isInitialized) return
      this.isInitialized = true

      if (useIntersectionObserver) {
        // Проверяем, виден ли элемент уже сейчас
        const rect = this.$el.getBoundingClientRect()
        const isCurrentlyVisible =
          rect.top < window.innerHeight && rect.bottom > 0

        if (isCurrentlyVisible) {
          this.makeVisible()
        } else {
          this.setupIntersectionObserver()
        }
      } else {
        this.makeVisible()
      }

      this.setupImageHandlers()
    },

    forceInitialize() {
      try {
        window.appLogger?.info('Принудительная инициализация изображения')
        this.makeVisible()
        this.setupImageHandlers()
      } catch (error) {
        window.appLogger?.error(
          'Ошибка принудительной инициализации изображения',
          error,
        )
        if (window.errorHandler) {
          window.errorHandler.handleError(error, {
            type: 'image_force_init',
            imageId: this.imageId,
            element: this.$el,
          })
        }
      }
    },

    makeVisible() {
      if (this.isVisible) return
      this.isVisible = true

      // Обновляем состояние в store
      this.$store.loading.startLoading(this.imageId)
      this.$el.dataset.loadingState = this.$store.loading.states.LOADING

      this.startAnimation()
    },

    setupIntersectionObserver() {
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        // Используем улучшенные настройки для лучшего UX
        this.observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            if (entry.isIntersecting && !this.isVisible) {
              this.makeVisible()
              this.observer!.disconnect()
              this.observer = null
            }
          },
          {
            threshold: 0.01,
            rootMargin: '200px 0px', // Увеличиваем для еще более раннего срабатывания
          },
        )

        this.observer.observe(this.$el)

        // Добавляем scroll animation класс если включен useIntersectionObserver
        if (useIntersectionObserver) {
          this.$el.classList.add('scroll-animate')
        }
      } else {
        this.makeVisible()
      }
    },

    setupImageHandlers() {
      const img = this.$el.querySelector('img') as HTMLImageElement | null
      if (img) {
        if (img.complete && img.naturalHeight !== 0) {
          this.onImageLoad()
        } else {
          img.addEventListener('load', () => this.onImageLoad())
          img.addEventListener('error', () => this.onImageError())
        }
      }
    },

    startAnimation() {
      if (this.animationStarted) return
      this.animationStarted = true

      // Добавляем класс in-view для scroll анимаций
      if (useIntersectionObserver) {
        this.$el.classList.add('in-view')
      }

      setTimeout(() => {
        this.$el.classList.add(`${animationClass}-ready`)
      }, animationDelay)
    },

    onImageLoad() {
      this.imageLoaded = true

      // Обновляем состояние в store
      this.$store.loading.setLoaded(this.imageId)
      this.$el.dataset.loadingState = this.$store.loading.states.LOADED

      if (this.isVisible) {
        this.$el.classList.add(`${animationClass}-loaded`)
      }
    },

    async onImageError() {
      this.imageError = true

      // Обновляем состояние в store
      this.$store.loading.setError(this.imageId)
      this.$el.dataset.loadingState = this.$store.loading.states.ERROR

      this.$el.classList.add(`${animationClass}-error`)

      // Интеграция с системой обработки ошибок
      if (window.errorHandler) {
        const img = this.$el.querySelector('img') as HTMLImageElement | null
        const errorContext = {
          type: 'image_load',
          url: img?.src,
          element: img,
          imageId: this.imageId,
          retryCallback: () => this.retryImageLoad(),
        }

        try {
          await window.errorHandler.handleError(
            new Error('Image load failed'),
            errorContext,
          )
        } catch (retryError) {
          window.appLogger?.info(
            'Все попытки загрузки изображения исчерпаны:',
            retryError,
          )
          this.showErrorFallback()
        }
      }
    },

    async retryImageLoad() {
      const img = this.$el.querySelector('img') as HTMLImageElement | null
      if (!img) return

      // Сбрасываем состояние ошибки
      this.imageError = false
      this.$store.loading.startLoading(this.imageId)
      this.$el.dataset.loadingState = this.$store.loading.states.LOADING
      this.$el.classList.remove(`${animationClass}-error`)

      // Перезагружаем изображение с cache-busting
      const originalSrc = img.src
      const cacheBuster = new Date().getTime()
      const separator = originalSrc.includes('?') ? '&' : '?'

      return new Promise<void>((resolve, reject) => {
        const newImg = new Image()
        newImg.onload = () => {
          img.src = newImg.src
          this.onImageLoad()
          resolve()
        }
        newImg.onerror = reject
        newImg.src = `${originalSrc}${separator}cb=${cacheBuster}`
      })
    },

    showErrorFallback() {
      // Создаем fallback контент
      const errorElement = document.createElement('div')
      errorElement.className = 'image-error-fallback'
      errorElement.innerHTML = `
        <div class="image-error-content">
          <svg class="image-error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          <p class="image-error-text">Изображение недоступно</p>
        </div>
      `

      // Заменяем изображение на fallback
      const img = this.$el.querySelector('img')
      if (img && img.parentNode) {
        img.parentNode.replaceChild(errorElement, img)
      }
    },

    // Cleanup
    destroy() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }

      // Удаляем изображение из store при cleanup
      this.$store.loading.remove(this.imageId)
    },
  }
}
