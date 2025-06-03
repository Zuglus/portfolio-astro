/**
 * Утилиты для управления анимациями
 * Этап 3: Плавные анимации загрузки изображений
 * 
 * Философия: каждая анимация - это переход от потенциального к актуальному
 */

// Константы для типов анимаций
export const ANIMATION_TYPES = {
  FADE_IN: 'fade-in',
  BLUR_TO_SHARP: 'blur-to-sharp', 
  REVEAL_UP: 'reveal-up',
  REVEAL_DOWN: 'reveal-down',
  SCALE_IN: 'scale-in',
  STAGGER: 'stagger'
};

// Тайминги для естественности движения
export const ANIMATION_TIMINGS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800
};

// Easing функции (отражают физику реального мира)
export const EASING = {
  NATURAL: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  SHARP: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'
};

/**
 * Intersection Observer для отслеживания появления элементов
 * Нервная система анимаций - реагирует на изменения в пространстве
 */
export class AnimationObserver {
  constructor(options = {}) {
    this.defaultOptions = {
      threshold: [0, 0.1, 0.5, 0.8, 1.0],
      rootMargin: '-10% 0px -10% 0px',
      ...options
    };
    
    this.observer = null;
    this.callbacks = new Map();
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver не поддерживается, используем fallback');
      this.useFallback = true;
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const callback = this.callbacks.get(entry.target);
        if (callback) {
          callback(entry);
        }
      });
    }, this.defaultOptions);
  }

  observe(element, callback) {
    if (this.useFallback) {
      // Fallback для старых браузеров
      setTimeout(() => callback({ isIntersecting: true, target: element }), 100);
      return;
    }

    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element) {
    if (this.useFallback) return;
    
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

/**
 * Менеджер staggered анимаций
 * Создает ритм появления элементов
 */
export class StaggerManager {
  constructor(baseDelay = 100) {
    this.baseDelay = baseDelay;
    this.animatedElements = new Set();
  }

  applyStagger(elements, animationType = ANIMATION_TYPES.FADE_IN) {
    elements.forEach((element, index) => {
      if (this.animatedElements.has(element)) return;
      
      const delay = index * this.baseDelay;
      this.scheduleAnimation(element, animationType, delay);
      this.animatedElements.add(element);
    });
  }

  scheduleAnimation(element, type, delay) {
    setTimeout(() => {
      element.classList.add(`animate-${type}`);
      element.style.animationDelay = '0ms'; // Сбрасываем задержку после запуска
    }, delay);
  }

  reset() {
    this.animatedElements.clear();
  }
}

/**
 * Утилита для создания blur-to-sharp эффекта
 * Качественный переход от размытого к четкому
 */
export function createBlurToSharpImage(src, onLoad) {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Создаем низкокачественную версию
  const lowQualityImg = new Image();
  lowQualityImg.crossOrigin = 'anonymous';
  
  // Генерируем низкокачественную версию (если нет готовой)
  img.onload = () => {
    canvas.width = img.width / 10; // Уменьшаем для blur эффекта
    canvas.height = img.height / 10;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const blurredDataUrl = canvas.toDataURL('image/jpeg', 0.1);
    
    if (onLoad) {
      onLoad({
        blurred: blurredDataUrl,
        sharp: src,
        dimensions: { width: img.width, height: img.height }
      });
    }
  };
  
  img.src = src;
}

/**
 * Проверка поддержки современных CSS свойств
 */
export function checkCSSSupport() {
  const testElement = document.createElement('div');
  
  return {
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    transformStyle: CSS.supports('transform-style', 'preserve-3d'),
    willChange: CSS.supports('will-change', 'transform'),
    intersectionObserver: 'IntersectionObserver' in window,
    customProperties: CSS.supports('color', 'var(--test)')
  };
}

/**
 * Оптимизация производительности
 */
export class PerformanceOptimizer {
  constructor() {
    this.pendingAnimations = new Set();
    this.rafId = null;
  }

  scheduleAnimation(callback) {
    this.pendingAnimations.add(callback);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flushAnimations();
      });
    }
  }

  flushAnimations() {
    this.pendingAnimations.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Ошибка анимации:', error);
      }
    });
    
    this.pendingAnimations.clear();
    this.rafId = null;
  }

  // Добавляем will-change для оптимизации
  prepareForAnimation(element, properties = ['transform', 'opacity']) {
    element.style.willChange = properties.join(', ');
    
    // Убираем will-change после анимации
    const removeWillChange = () => {
      element.style.willChange = 'auto';
      element.removeEventListener('animationend', removeWillChange);
      element.removeEventListener('transitionend', removeWillChange);
    };
    
    element.addEventListener('animationend', removeWillChange);
    element.addEventListener('transitionend', removeWillChange);
  }
}

// Создаем глобальные экземпляры
export const globalAnimationObserver = new AnimationObserver();
export const globalStaggerManager = new StaggerManager(150);
export const globalPerformanceOptimizer = new PerformanceOptimizer();

// Cleanup при выгрузке страницы
window.addEventListener('beforeunload', () => {
  globalAnimationObserver.disconnect();
  globalStaggerManager.reset();
});

/**
 * Утилита для debounce/throttle (уже была, но дополняем)
 */
export function throttleRAF(callback) {
  let rafId = null;
  let lastArgs = null;

  return function(...args) {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback.apply(this, lastArgs);
        rafId = null;
      });
    }
  };
}

export default {
  ANIMATION_TYPES,
  ANIMATION_TIMINGS,
  EASING,
  AnimationObserver,
  StaggerManager,
  createBlurToSharpImage,
  checkCSSSupport,
  PerformanceOptimizer,
  globalAnimationObserver,
  globalStaggerManager,
  globalPerformanceOptimizer,
  throttleRAF
};