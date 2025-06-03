/**
 * Утилиты для работы с состояниями загрузки изображений
 * Этап 1: Архитектура состояний загрузки
 */

// Константы состояний
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading', 
  LOADED: 'loaded',
  ERROR: 'error'
};

// Генерация уникального ID для изображения
export function generateImageId(src, width = '', height = '') {
  const normalizedSrc = typeof src === 'string' ? src : src.src || '';
  return btoa(normalizedSrc + width + height).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// Проверка валидности состояния
export function isValidState(state) {
  return Object.values(LOADING_STATES).includes(state);
}

// Утилиты для работы с DOM элементами
export function setElementLoadingState(element, state) {
  if (element && isValidState(state)) {
    element.setAttribute('data-image-state', state);
  }
}

export function getElementLoadingState(element) {
  return element ? element.getAttribute('data-image-state') || LOADING_STATES.IDLE : LOADING_STATES.IDLE;
}

// Создание обработчиков событий для изображений
export function createImageEventHandlers(imageId, setStateCallback) {
  return {
    onLoadStart: () => setStateCallback(imageId, LOADING_STATES.LOADING),
    onLoad: () => setStateCallback(imageId, LOADING_STATES.LOADED),
    onError: () => setStateCallback(imageId, LOADING_STATES.ERROR)
  };
}

// Проверка поддержки современных API
export function checkBrowserSupport() {
  return {
    intersectionObserver: 'IntersectionObserver' in window,
    customElements: 'customElements' in window,
    map: 'Map' in window,
    promises: 'Promise' in window
  };
}

// Debounce функция для оптимизации
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle функция для оптимизации
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Логирование для отладки (включается через localStorage)
export function debugLog(message, data = null) {
  if (localStorage.getItem('loading-debug') === 'true') {
    console.log(`[LoadingStates] ${message}`, data);
  }
}

// Экспорт всех утилит как default объект
export default {
  LOADING_STATES,
  generateImageId,
  isValidState,
  setElementLoadingState,
  getElementLoadingState,
  createImageEventHandlers,
  checkBrowserSupport,
  debounce,
  throttle,
  debugLog
};
