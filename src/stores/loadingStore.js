import Alpine from 'alpinejs';

// Глобальный store для управления состояниями загрузки
Alpine.store('loading', {
  // Карта состояний изображений: { imageId: state }
  images: new Map(),
  
  // Возможные состояния
  states: {
    IDLE: 'idle',
    LOADING: 'loading', 
    LOADED: 'loaded',
    ERROR: 'error'
  },
  
  // Глобальные настройки анимаций
  config: {
    animationDuration: 300,
    shimmerDuration: 1500,
    staggerDelay: 100,
    errorRetryDelay: 2000,
    maxRetries: 3
  },
  
  /**
   * Устанавливает состояние для изображения
   * @param {string} imageId - уникальный ID изображения
   * @param {string} state - новое состояние
   */
  setState(imageId, state) {
    if (!imageId) return;
    
    const currentState = this.images.get(imageId);
    if (currentState !== state) {
      this.images.set(imageId, state);
      
      // Отправляем кастомное событие для реактивности
      window.dispatchEvent(new CustomEvent('image-state-changed', {
        detail: { imageId, state, previousState: currentState }
      }));
    }
  },
  
  /**
   * Получает состояние изображения
   * @param {string} imageId - уникальный ID изображения
   * @returns {string} текущее состояние
   */
  getState(imageId) {
    return this.images.get(imageId) || this.states.IDLE;
  },
  
  /**
   * Проверяет, находится ли изображение в определенном состоянии
   * @param {string} imageId - уникальный ID изображения
   * @param {string} state - проверяемое состояние
   * @returns {boolean}
   */
  isState(imageId, state) {
    return this.getState(imageId) === state;
  },
  
  /**
   * Помечает изображение как начавшее загрузку
   * @param {string} imageId - уникальный ID изображения
   */
  startLoading(imageId) {
    this.setState(imageId, this.states.LOADING);
  },
  
  /**
   * Помечает изображение как загруженное
   * @param {string} imageId - уникальный ID изображения
   */
  setLoaded(imageId) {
    this.setState(imageId, this.states.LOADED);
  },
  
  /**
   * Помечает изображение как ошибочное
   * @param {string} imageId - уникальный ID изображения
   */
  setError(imageId) {
    this.setState(imageId, this.states.ERROR);
  },
  
  /**
   * Сбрасывает состояние изображения в idle
   * @param {string} imageId - уникальный ID изображения
   */
  reset(imageId) {
    this.setState(imageId, this.states.IDLE);
  },
  
  /**
   * Получает статистику по всем изображениям
   * @returns {Object} объект со статистикой
   */
  getStats() {
    const stats = {
      total: this.images.size,
      idle: 0,
      loading: 0,
      loaded: 0,
      error: 0
    };
    
    for (const state of this.images.values()) {
      stats[state] = (stats[state] || 0) + 1;
    }
    
    return stats;
  },
  
  /**
   * Очищает все состояния (для cleanup)
   */
  clear() {
    this.images.clear();
  },
  
  /**
   * Удаляет состояние конкретного изображения
   * @param {string} imageId - уникальный ID изображения
   */
  remove(imageId) {
    this.images.delete(imageId);
  }
});

// Экспортируем для использования в других модулях
export default Alpine.store('loading');