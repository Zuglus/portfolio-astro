/**
 * Система обработки ошибок и автоповтора
 * Диалектический подход: от конкретных ошибок к общей системе надежности
 */

class ErrorHandler {
  constructor() {
    this.retryQueues = new Map();
    this.errorStats = new Map();
    this.networkStatus = {
      isOnline: navigator.onLine,
      effectiveType: this.getConnectionType(),
      lastOnlineTime: Date.now()
    };
    this.globalRetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true
    };
    this.errorCallbacks = new Map();
    
    this.setupNetworkMonitoring();
    this.setupGlobalErrorHandling();
  }

  /**
   * Получение типа соединения
   */
  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Мониторинг состояния сети
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      this.networkStatus.lastOnlineTime = Date.now();
      this.onNetworkRestored();
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      this.onNetworkLost();
    });

    // Мониторинг типа соединения
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.networkStatus.effectiveType = this.getConnectionType();
        this.adjustRetryStrategy();
      });
    }
  }

  /**
   * Глобальная обработка ошибок
   */
  setupGlobalErrorHandling() {
    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandled_promise',
        context: 'global'
      });
    });

    // Обработка JavaScript ошибок
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        type: 'javascript_error',
        context: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Основной метод обработки ошибок
   */
  async handleError(error, context = {}) {
    const errorKey = this.generateErrorKey(error, context);
    const errorType = this.classifyError(error);
    
    // Обновляем статистику
    this.updateErrorStats(errorType, errorKey);
    
    // Определяем стратегию обработки
    const strategy = this.determineHandlingStrategy(error, errorType, context);
    
    // Выполняем обработку согласно стратегии
    switch (strategy.action) {
      case 'retry':
        return this.scheduleRetry(error, context, strategy.config);
      
      case 'fallback':
        return this.executeFallback(error, context, strategy.fallback);
      
      case 'report':
        this.reportError(error, context);
        break;
      
      case 'ignore':
        break;
      
      default:
        console.warn('Неизвестная стратегия обработки ошибки:', strategy.action);
    }
    
    // Уведомляем подписчиков
    this.notifyErrorCallbacks(error, context, strategy);
  }

  /**
   * Классификация типа ошибки
   */
  classifyError(error) {
    if (!error) return 'unknown';
    
    const message = error.message || '';
    const name = error.name || '';
    
    // Сетевые ошибки
    if (message.includes('fetch') || message.includes('network') || 
        name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return 'network';
    }
    
    // Ошибки загрузки изображений
    if (error.target && error.target.tagName === 'IMG') {
      return 'image_load';
    }
    
    // Timeout ошибки
    if (message.includes('timeout') || name === 'TimeoutError') {
      return 'timeout';
    }
    
    // CORS ошибки
    if (message.includes('CORS') || message.includes('cross-origin')) {
      return 'cors';
    }
    
    // Ошибки парсинга
    if (name === 'SyntaxError' || message.includes('parse')) {
      return 'parse';
    }
    
    return 'general';
  }

  /**
   * Определение стратегии обработки
   */
  determineHandlingStrategy(error, errorType, context) {
    const retryCount = this.getRetryCount(this.generateErrorKey(error, context));
    
    // Стратегии в зависимости от типа ошибки
    switch (errorType) {
      case 'network':
        if (!this.networkStatus.isOnline) {
          return { action: 'fallback', fallback: 'offline_mode' };
        }
        if (retryCount < this.globalRetryConfig.maxRetries) {
          return { 
            action: 'retry', 
            config: this.getNetworkRetryConfig() 
          };
        }
        return { action: 'fallback', fallback: 'cached_content' };
      
      case 'image_load':
        if (retryCount < 2) {
          return { 
            action: 'retry', 
            config: { ...this.globalRetryConfig, maxRetries: 2 } 
          };
        }
        return { action: 'fallback', fallback: 'placeholder_image' };
      
      case 'timeout':
        if (retryCount < this.globalRetryConfig.maxRetries) {
          return { 
            action: 'retry', 
            config: this.getTimeoutRetryConfig() 
          };
        }
        return { action: 'report' };
      
      case 'cors':
        return { action: 'fallback', fallback: 'alternative_source' };
      
      default:
        if (retryCount === 0) {
          return { action: 'retry', config: this.globalRetryConfig };
        }
        return { action: 'report' };
    }
  }

  /**
   * Планирование повторной попытки
   */
  async scheduleRetry(error, context, config = {}) {
    const errorKey = this.generateErrorKey(error, context);
    const retryCount = this.getRetryCount(errorKey);
    
    if (retryCount >= (config.maxRetries || this.globalRetryConfig.maxRetries)) {
      throw new Error(`Превышено максимальное количество попыток для ${errorKey}`);
    }
    
    const delay = this.calculateRetryDelay(retryCount, config);
    
    // Добавляем в очередь retry
    const retryPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          this.incrementRetryCount(errorKey);
          
          // Выполняем retry callback если он есть
          if (context.retryCallback) {
            const result = await context.retryCallback();
            this.clearRetryCount(errorKey);
            resolve(result);
          } else {
            resolve();
          }
        } catch (retryError) {
          reject(retryError);
        }
      }, delay);
    });
    
    this.retryQueues.set(errorKey, retryPromise);
    return retryPromise;
  }

  /**
   * Вычисление задержки для retry с экспоненциальным backoff
   */
  calculateRetryDelay(retryCount, config = {}) {
    const baseDelay = config.baseDelay || this.globalRetryConfig.baseDelay;
    const backoffMultiplier = config.backoffMultiplier || this.globalRetryConfig.backoffMultiplier;
    const maxDelay = config.maxDelay || this.globalRetryConfig.maxDelay;
    const jitter = config.jitter !== undefined ? config.jitter : this.globalRetryConfig.jitter;
    
    let delay = baseDelay * Math.pow(backoffMultiplier, retryCount);
    delay = Math.min(delay, maxDelay);
    
    // Добавляем jitter для избежания thundering herd
    if (jitter) {
      delay += Math.random() * delay * 0.1;
    }
    
    return Math.floor(delay);
  }

  /**
   * Выполнение fallback стратегии
   */
  async executeFallback(error, context, fallbackType) {
    switch (fallbackType) {
      case 'offline_mode':
        return this.enableOfflineMode();
      
      case 'cached_content':
        return this.loadCachedContent(context);
      
      case 'placeholder_image':
        return this.loadPlaceholderImage(context);
      
      case 'alternative_source':
        return this.loadAlternativeSource(context);
      
      default:
        console.warn('Неизвестный тип fallback:', fallbackType);
        return null;
    }
  }

  /**
   * Активация офлайн режима
   */
  enableOfflineMode() {
    document.body.classList.add('offline-mode');
    
    // Показываем уведомление об отсутствии сети
    this.showNotification('Отсутствует подключение к интернету. Работаем в офлайн режиме.', {
      type: 'warning',
      persistent: true
    });
    
    return { mode: 'offline' };
  }

  /**
   * Загрузка кешированного контента
   */
  async loadCachedContent(context) {
    if ('caches' in window) {
      try {
        const cache = await caches.open('portfolio-cache');
        const cachedResponse = await cache.match(context.url);
        
        if (cachedResponse) {
          return cachedResponse;
        }
      } catch (error) {
        console.warn('Ошибка загрузки из кеша:', error);
      }
    }
    
    return null;
  }

  /**
   * Загрузка placeholder изображения
   */
  loadPlaceholderImage(context) {
    if (context.element && context.element.tagName === 'IMG') {
      context.element.src = this.generatePlaceholderImage(
        context.element.width || 300,
        context.element.height || 200
      );
      context.element.alt = 'Изображение недоступно';
    }
    
    return { type: 'placeholder' };
  }

  /**
   * Генерация placeholder изображения
   */
  generatePlaceholderImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Иконка изображения
    ctx.fillStyle = '#9ca3af';
    ctx.font = `${Math.min(width, height) * 0.2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🖼️', width / 2, height / 2);
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Показ уведомления пользователю
   */
  showNotification(message, options = {}) {
    const notification = document.createElement('div');
    notification.className = `error-notification ${options.type || 'info'}`;
    notification.innerHTML = `
      <div class="error-notification-content">
        <span class="error-notification-message">${message}</span>
        <button class="error-notification-close" onclick="this.parentNode.parentNode.remove()">✕</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 1rem;
      z-index: 10000;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие (если не persistent)
    if (!options.persistent) {
      setTimeout(() => {
        notification.remove();
      }, options.duration || 5000);
    }
  }

  /**
   * Обработка восстановления сети
   */
  onNetworkRestored() {
    document.body.classList.remove('offline-mode');
    
    this.showNotification('Подключение к интернету восстановлено', {
      type: 'success',
      duration: 3000
    });
    
    // Повторяем неудачные запросы
    this.retryPendingRequests();
  }

  /**
   * Обработка потери сети
   */
  onNetworkLost() {
    this.enableOfflineMode();
  }

  /**
   * Повтор отложенных запросов
   */
  async retryPendingRequests() {
    const pendingRetries = Array.from(this.retryQueues.values());
    
    if (pendingRetries.length > 0) {
      this.showNotification(`Повторяем ${pendingRetries.length} неудачных запросов...`, {
        type: 'info',
        duration: 2000
      });
    }
  }

  /**
   * Генерация ключа ошибки
   */
  generateErrorKey(error, context) {
    const errorMessage = error.message || error.toString();
    const contextKey = context.url || context.type || 'unknown';
    return `${errorMessage}:${contextKey}`;
  }

  /**
   * Управление счетчиками retry
   */
  getRetryCount(errorKey) {
    return this.errorStats.get(errorKey)?.retryCount || 0;
  }

  incrementRetryCount(errorKey) {
    const stats = this.errorStats.get(errorKey) || { retryCount: 0, firstOccurrence: Date.now() };
    stats.retryCount++;
    stats.lastOccurrence = Date.now();
    this.errorStats.set(errorKey, stats);
  }

  clearRetryCount(errorKey) {
    this.errorStats.delete(errorKey);
    this.retryQueues.delete(errorKey);
  }

  /**
   * Обновление статистики ошибок
   */
  updateErrorStats(errorType, errorKey) {
    const stats = this.errorStats.get(errorKey) || {
      errorType,
      retryCount: 0,
      firstOccurrence: Date.now()
    };
    
    stats.lastOccurrence = Date.now();
    this.errorStats.set(errorKey, stats);
  }

  /**
   * Получение конфигурации retry для сетевых ошибок
   */
  getNetworkRetryConfig() {
    const connectionType = this.networkStatus.effectiveType;
    
    // Адаптируем стратегию в зависимости от типа соединения
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return {
        ...this.globalRetryConfig,
        baseDelay: 3000,
        maxRetries: 2
      };
    }
    
    return this.globalRetryConfig;
  }

  /**
   * Получение конфигурации retry для timeout ошибок
   */
  getTimeoutRetryConfig() {
    return {
      ...this.globalRetryConfig,
      baseDelay: 2000,
      maxRetries: 2
    };
  }

  /**
   * Корректировка стратегии retry в зависимости от типа соединения
   */
  adjustRetryStrategy() {
    const connectionType = this.networkStatus.effectiveType;
    
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      this.globalRetryConfig.baseDelay = Math.max(this.globalRetryConfig.baseDelay, 2000);
      this.globalRetryConfig.maxRetries = Math.min(this.globalRetryConfig.maxRetries, 2);
    }
  }

  /**
   * Регистрация callback для обработки ошибок
   */
  onError(callback, errorType = 'all') {
    if (!this.errorCallbacks.has(errorType)) {
      this.errorCallbacks.set(errorType, []);
    }
    this.errorCallbacks.get(errorType).push(callback);
  }

  /**
   * Уведомление подписчиков об ошибках
   */
  notifyErrorCallbacks(error, context, strategy) {
    const errorType = this.classifyError(error);
    
    // Уведомляем специфичные callbacks
    const specificCallbacks = this.errorCallbacks.get(errorType) || [];
    const generalCallbacks = this.errorCallbacks.get('all') || [];
    
    [...specificCallbacks, ...generalCallbacks].forEach(callback => {
      try {
        callback(error, context, strategy);
      } catch (callbackError) {
        console.error('Ошибка в error callback:', callbackError);
      }
    });
  }

  /**
   * Отчет об ошибке (может отправлять на сервер)
   */
  reportError(error, context) {
    const report = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      networkStatus: this.networkStatus
    };
    
    console.error('Отчет об ошибке:', report);
    
    // Здесь можно добавить отправку на сервер аналитики
  }

  /**
   * Получение статистики ошибок
   */
  getErrorStats() {
    const stats = {};
    
    for (const [key, errorStats] of this.errorStats.entries()) {
      const type = errorStats.errorType;
      if (!stats[type]) {
        stats[type] = { count: 0, retries: 0 };
      }
      stats[type].count++;
      stats[type].retries += errorStats.retryCount;
    }
    
    return {
      byType: stats,
      total: this.errorStats.size,
      activeRetries: this.retryQueues.size,
      networkStatus: this.networkStatus
    };
  }

  /**
   * Очистка системы ошибок
   */
  cleanup() {
    this.retryQueues.clear();
    this.errorStats.clear();
    this.errorCallbacks.clear();
  }
}

// Создаем глобальный экземпляр
const errorHandler = new ErrorHandler();

// Экспортируем для использования
export default errorHandler;

// Также делаем доступным глобально
if (typeof window !== 'undefined') {
  window.errorHandler = errorHandler;
}