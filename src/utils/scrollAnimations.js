/**
 * Утилиты для анимаций при скролле с Intersection Observer
 */

class ScrollAnimationController {
  constructor() {
    this.observers = new Map();
    this.animatedElements = new Set();
    this.isInitialized = false;
  }

  /**
   * Инициализация контроллера
   */
  init() {
    if (this.isInitialized) return;
    
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer не поддерживается');
      this.fallbackToImmediate();
      return;
    }

    this.isInitialized = true;
    this.setupDefaultObserver();
  }

  /**
   * Создает базовый observer для стандартных анимаций
   */
  setupDefaultObserver() {
    const defaultObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    this.observers.set('default', defaultObserver);
  }

  /**
   * Создает кастомный observer
   * @param {string} name - имя observer'а
   * @param {Object} options - настройки IntersectionObserver
   * @param {Function} callback - кастомный callback
   */
  createObserver(name, options = {}, callback = null) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '50px 0px'
    };

    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver(
      callback || ((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
          }
        });
      }),
      observerOptions
    );

    this.observers.set(name, observer);
    return observer;
  }

  /**
   * Добавляет элемент для отслеживания
   * @param {HTMLElement} element - элемент для анимации
   * @param {string} observerName - имя observer'а (по умолчанию 'default')
   * @param {Object} animationOptions - опции анимации
   */
  observe(element, observerName = 'default', animationOptions = {}) {
    if (!element || this.animatedElements.has(element)) return;

    const observer = this.observers.get(observerName);
    if (!observer) {
      console.error(`Observer ${observerName} не найден`);
      return;
    }

    // Сохраняем опции анимации в dataset
    if (animationOptions.delay) {
      element.style.transitionDelay = `${animationOptions.delay}ms`;
    }
    if (animationOptions.duration) {
      element.style.transitionDuration = `${animationOptions.duration}ms`;
    }
    if (animationOptions.easing) {
      element.style.transitionTimingFunction = animationOptions.easing;
    }

    // Добавляем базовый класс для анимации
    element.classList.add('scroll-animate');
    
    observer.observe(element);
  }

  /**
   * Анимирует элемент
   * @param {HTMLElement} element - элемент для анимации
   */
  animateElement(element) {
    if (this.animatedElements.has(element)) return;

    this.animatedElements.add(element);
    element.classList.add('in-view');

    // Отключаем observer для этого элемента после анимации
    this.observers.forEach(observer => {
      observer.unobserve(element);
    });

    // Диспатчим кастомное событие
    element.dispatchEvent(new CustomEvent('scroll-animate', {
      bubbles: true,
      detail: { element }
    }));
  }

  /**
   * Создает stagger эффект для группы элементов
   * @param {NodeList|Array} elements - элементы для анимации
   * @param {number} staggerDelay - задержка между элементами (мс)
   * @param {string} observerName - имя observer'а
   */
  createStaggerGroup(elements, staggerDelay = 100, observerName = 'default') {
    const elementsArray = Array.from(elements);
    
    // Добавляем контейнер класс для CSS
    if (elementsArray[0] && elementsArray[0].parentElement) {
      elementsArray[0].parentElement.classList.add('scroll-animate-stagger');
    }

    elementsArray.forEach((element, index) => {
      this.observe(element, observerName, {
        delay: index * staggerDelay
      });
    });
  }

  /**
   * Параллакс эффект для элементов
   * @param {HTMLElement} element - элемент для параллакса
   * @param {number} speed - скорость параллакса (0-1)
   */
  createParallax(element, speed = 0.5) {
    if (!element) return;

    element.classList.add('parallax-image');

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight;
          
          // Вычисляем позицию относительно viewport
          const relativePos = (rect.top + rect.height / 2) / windowHeight;
          const translateY = (relativePos - 0.5) * speed * 100;
          
          if (entry.isIntersecting) {
            element.style.transform = `translateY(${translateY}px)`;
            element.classList.add('in-view');
          } else if (rect.top < 0) {
            element.classList.add('above-view');
            element.classList.remove('below-view', 'in-view');
          } else {
            element.classList.add('below-view');
            element.classList.remove('above-view', 'in-view');
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '20% 0px'
      }
    );

    parallaxObserver.observe(element);
    this.observers.set(`parallax-${Math.random()}`, parallaxObserver);
  }

  /**
   * Fallback для браузеров без Intersection Observer
   */
  fallbackToImmediate() {
    // Сразу показываем все элементы с анимациями
    document.addEventListener('DOMContentLoaded', () => {
      const animateElements = document.querySelectorAll('.scroll-animate');
      animateElements.forEach(element => {
        element.classList.add('in-view');
      });
    });
  }

  /**
   * Остановка всех observer'ов
   */
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.animatedElements.clear();
    this.isInitialized = false;
  }

  /**
   * Проверка на медленное соединение
   */
  isSlowConnection() {
    return 'connection' in navigator && 
           (navigator.connection.effectiveType === 'slow-2g' || 
            navigator.connection.effectiveType === '2g');
  }

  /**
   * Адаптивная инициализация в зависимости от устройства
   */
  adaptiveInit() {
    // Отключаем сложные анимации на медленных соединениях
    if (this.isSlowConnection()) {
      this.fallbackToImmediate();
      return;
    }

    // Отключаем анимации если пользователь предпочитает reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.fallbackToImmediate();
      return;
    }

    this.init();
  }
}

// Создаем глобальный экземпляр
const scrollAnimations = new ScrollAnimationController();

// Экспортируем для использования в Alpine.js и других модулях
export default scrollAnimations;

// Также делаем доступным глобально
if (typeof window !== 'undefined') {
  window.scrollAnimations = scrollAnimations;
}