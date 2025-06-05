/**
 * Расширенная система анимаций для модальных окон
 * Интеграция с FLIP контроллером и добавление spring physics
 */

import { FlipAnimationController } from './flipController.js';

class ModalAnimationSystem {
  constructor() {
    this.flipController = new FlipAnimationController();
    this.activeModals = new Map();
    this.animationQueue = [];
    this.isProcessingQueue = false;
    this.preloadCache = new Map();
  }

  /**
   * Инициализация системы анимаций
   */
  init() {
    this.setupEventListeners();
    this.preloadCriticalResources();
  }

  /**
   * Настройка глобальных слушателей
   */
  setupEventListeners() {
    // ESC для закрытия модалок
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTopModal();
      }
    });

    // Предзагрузка изображений при hover
    document.addEventListener('mouseenter', (e) => {
      const triggerElement = e.target.closest('[data-modal-trigger]');
      if (triggerElement) {
        this.preloadModalContent(triggerElement);
      }
    }, true);

    // Обработка ошибок анимаций
    window.addEventListener('unhandledrejection', (e) => {
      if (e.reason && e.reason.message && e.reason.message.includes('animation')) {
        console.warn('Ошибка анимации перехвачена:', e.reason);
        e.preventDefault();
      }
    });
  }

  /**
   * Предзагрузка критических ресурсов
   */
  preloadCriticalResources() {
    // Предзагружаем первые несколько изображений
    const images = document.querySelectorAll('img[data-preload]');
    images.forEach(img => {
      if (img.dataset.preload === 'true') {
        this.preloadImage(img.src);
      }
    });
  }

  /**
   * Предзагрузка изображения
   */
  preloadImage(src) {
    if (this.preloadCache.has(src)) return this.preloadCache.get(src);

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    this.preloadCache.set(src, promise);
    return promise;
  }

  /**
   * Предзагрузка контента модального окна
   */
  async preloadModalContent(triggerElement) {
    const modalData = this.extractModalData(triggerElement);
    if (!modalData || !modalData.images) return;

    try {
      await Promise.all(
        modalData.images.slice(0, 3).map(src => this.preloadImage(src))
      );
    } catch (error) {
      console.warn('Ошибка предзагрузки:', error);
    }
  }

  /**
   * Извлечение данных модального окна из элемента
   */
  extractModalData(element) {
    try {
      const dataAttr = element.dataset.modalData;
      return dataAttr ? JSON.parse(dataAttr) : null;
    } catch (error) {
      console.warn('Ошибка парсинга данных модального окна:', error);
      return null;
    }
  }

  /**
   * Открытие модального окна с FLIP анимацией
   */
  async openModal(sourceElement, modalConfig = {}) {
    const modalId = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const config = {
      type: 'default',
      backdrop: 'blur',
      closeOnBackdrop: true,
      closeOnEscape: true,
      preloadNext: true,
      springPhysics: true,
      ...modalConfig
    };

    try {
      // Добавляем в очередь если система занята
      if (this.isProcessingQueue) {
        this.animationQueue.push({ action: 'open', sourceElement, config, modalId });
        return;
      }

      this.isProcessingQueue = true;

      // Создаем backdrop
      const backdrop = this.createBackdrop(config);
      document.body.appendChild(backdrop);

      // Создаем контейнер модального окна
      const modalContainer = this.createModalContainer(config);
      backdrop.appendChild(modalContainer);

      // Добавляем loading состояние
      const loadingElement = this.createLoadingIndicator();
      modalContainer.appendChild(loadingElement);

      // Запускаем FLIP анимацию
      await this.flipController.animateOpen(
        sourceElement, 
        modalContainer,
        () => this.onModalOpened(modalContainer, config)
      );

      // Загружаем контент модального окна
      await this.loadModalContent(modalContainer, config);

      // Регистрируем модальное окно
      this.activeModals.set(modalId, {
        backdrop,
        container: modalContainer,
        config,
        sourceElement
      });

      // Настраиваем обработчики
      this.setupModalHandlers(backdrop, modalContainer, modalId);

      return modalId;

    } catch (error) {
      console.error('Ошибка открытия модального окна:', error);
      this.cleanup();
    } finally {
      this.isProcessingQueue = false;
      this.processQueue();
    }
  }

  /**
   * Создание backdrop элемента
   */
  createBackdrop(config) {
    const backdrop = document.createElement('div');
    backdrop.className = `modal-backdrop ${config.backdrop === 'heavy' ? 'heavy' : ''}`;
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Анимация появления backdrop
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
    });

    return backdrop;
  }

  /**
   * Создание контейнера модального окна
   */
  createModalContainer(config) {
    const container = document.createElement('div');
    container.className = 'modal-container';
    container.style.cssText = `
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      background: var(--color-skeleton);
      border-radius: var(--border-radius-large);
      overflow: hidden;
    `;

    // Spring physics анимация
    if (config.springPhysics) {
      container.classList.add('opening');
      setTimeout(() => {
        container.classList.remove('opening');
        container.classList.add('active');
      }, 50);
    }

    return container;
  }

  /**
   * Создание индикатора загрузки
   */
  createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.className = 'modal-loading active';
    loading.innerHTML = `
      <div class="modal-loading-spinner"></div>
    `;
    return loading;
  }

  /**
   * Загрузка контента модального окна
   */
  async loadModalContent(container, config) {
    // Симуляция загрузки контента
    await new Promise(resolve => setTimeout(resolve, 300));

    const loadingElement = container.querySelector('.modal-loading');
    if (loadingElement) {
      loadingElement.classList.remove('active');
      setTimeout(() => {
        loadingElement.remove();
      }, 300);
    }

    // Здесь должна быть логика загрузки реального контента
    const content = this.createModalContent(config);
    container.appendChild(content);
  }

  /**
   * Создание контента модального окна
   */
  createModalContent(config) {
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
      padding: 2rem;
      min-height: 300px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 300ms ease-out, transform 300ms ease-out;
    `;

    // Анимация появления контента
    requestAnimationFrame(() => {
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    });

    return content;
  }

  /**
   * Настройка обработчиков модального окна
   */
  setupModalHandlers(backdrop, container, modalId) {
    const modal = this.activeModals.get(modalId);
    if (!modal) return;

    // Клик по backdrop
    if (modal.config.closeOnBackdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal(modalId);
        }
      });
    }

    // Кнопка закрытия
    const closeButton = container.querySelector('[data-modal-close]');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeModal(modalId);
      });
    }
  }

  /**
   * Закрытие модального окна
   */
  async closeModal(modalId) {
    const modal = this.activeModals.get(modalId);
    if (!modal) return;

    try {
      // Анимация закрытия backdrop
      modal.backdrop.classList.remove('active');

      // Spring physics для контейнера
      modal.container.classList.remove('active');
      modal.container.classList.add('closing');

      // FLIP анимация обратно к источнику
      await this.flipController.animateClose(
        modal.container,
        modal.sourceElement,
        () => this.onModalClosed(modal)
      );

      // Удаление из DOM
      setTimeout(() => {
        if (modal.backdrop.parentNode) {
          modal.backdrop.parentNode.removeChild(modal.backdrop);
        }
      }, 300);

      this.activeModals.delete(modalId);

    } catch (error) {
      console.error('Ошибка закрытия модального окна:', error);
    }
  }

  /**
   * Закрытие верхнего модального окна
   */
  closeTopModal() {
    const modalEntries = Array.from(this.activeModals.entries());
    if (modalEntries.length > 0) {
      const [topModalId] = modalEntries[modalEntries.length - 1];
      this.closeModal(topModalId);
    }
  }

  /**
   * Callback при открытии модального окна
   */
  onModalOpened(container, config) {
    // Диспатчим кастомное событие
    container.dispatchEvent(new CustomEvent('modal:opened', {
      bubbles: true,
      detail: { config }
    }));

    // Фокус на первый интерактивный элемент
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Callback при закрытии модального окна
   */
  onModalClosed(modal) {
    // Диспатчим кастомное событие
    document.dispatchEvent(new CustomEvent('modal:closed', {
      bubbles: true,
      detail: { config: modal.config }
    }));

    // Возвращаем фокус на исходный элемент
    if (modal.sourceElement) {
      modal.sourceElement.focus();
    }
  }

  /**
   * Обработка очереди анимаций
   */
  async processQueue() {
    if (this.animationQueue.length === 0 || this.isProcessingQueue) return;

    const { action, sourceElement, config, modalId } = this.animationQueue.shift();
    
    if (action === 'open') {
      await this.openModal(sourceElement, config);
    } else if (action === 'close') {
      await this.closeModal(modalId);
    }
  }

  /**
   * Полная очистка системы
   */
  cleanup() {
    this.flipController.cleanup();
    this.activeModals.clear();
    this.animationQueue.length = 0;
    this.isProcessingQueue = false;

    // Удаляем все модальные backdrop'ы
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    });
  }

  /**
   * Получение статистики производительности
   */
  getPerformanceStats() {
    return {
      activeModals: this.activeModals.size,
      queuedAnimations: this.animationQueue.length,
      preloadedImages: this.preloadCache.size,
      isProcessing: this.isProcessingQueue
    };
  }
}

// Создаем глобальный экземпляр
const modalAnimations = new ModalAnimationSystem();

// Экспортируем для использования
export default modalAnimations;

// Также делаем доступным глобально
if (typeof window !== 'undefined') {
  window.modalAnimations = modalAnimations;
}