#!/usr/bin/env python3
"""
Этап 1: Архитектура состояний загрузки
Создание единой системы управления состояниями загрузки для всех компонентов
"""

import os
import re
from pathlib import Path

def modify_index_astro():
    """Расширяем Alpine.js контекст глобальным store изображений"""
    file_path = "src/pages/index.astro"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Находим x-data блок и расширяем его
    old_x_data = '''x-data="{
      isModalOpen: false,
      currentProject: null,
      currentSlideIndex: 0,'''
    
    new_x_data = '''x-data="{
      isModalOpen: false,
      currentProject: null,
      currentSlideIndex: 0,
      
      // Store состояний загрузки изображений
      imageStore: {
        states: new Map(),
        
        // Генерация уникального ID для изображения
        generateId(src, width = '', height = '') {
          const normalizedSrc = typeof src === 'string' ? src : src.src || '';
          return btoa(normalizedSrc + width + height).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        },
        
        // Установка состояния изображения
        setState(imageId, state, metadata = {}) {
          this.states.set(imageId, {
            state,
            timestamp: Date.now(),
            ...metadata
          });
          
          // Диспатчим событие для реактивности
          window.dispatchEvent(new CustomEvent('imageStateChanged', {
            detail: { imageId, state, metadata }
          }));
        },
        
        // Получение состояния изображения
        getState(imageId) {
          return this.states.get(imageId)?.state || 'idle';
        },
        
        // Получение метаданных изображения
        getMetadata(imageId) {
          return this.states.get(imageId) || {};
        },
        
        // Проверка состояния
        isIdle(imageId) { return this.getState(imageId) === 'idle'; },
        isLoading(imageId) { return this.getState(imageId) === 'loading'; },
        isLoaded(imageId) { return this.getState(imageId) === 'loaded'; },
        isError(imageId) { return this.getState(imageId) === 'error'; },
        
        // Очистка старых состояний (старше 5 минут)
        cleanup() {
          const now = Date.now();
          const maxAge = 5 * 60 * 1000; // 5 минут
          
          for (const [imageId, data] of this.states) {
            if (now - data.timestamp > maxAge) {
              this.states.delete(imageId);
            }
          }
        },
        
        // Получение статистики
        getStats() {
          const states = Array.from(this.states.values());
          return {
            total: states.length,
            idle: states.filter(s => s.state === 'idle').length,
            loading: states.filter(s => s.state === 'loading').length,
            loaded: states.filter(s => s.state === 'loaded').length,
            error: states.filter(s => s.state === 'error').length
          };
        }
      },'''
    
    # Заменяем старый x-data на новый
    content = content.replace(old_x_data, new_x_data)
    
    # Добавляем метод для работы с imageStore в основной контекст
    init_method_old = '''init() {
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {'''
    
    init_method_new = '''init() {
        // Инициализация imageStore
        this.imageStore.cleanup();
        
        // Периодическая очистка imageStore
        setInterval(() => {
          this.imageStore.cleanup();
        }, 60000); // каждую минуту
        
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {'''
    
    content = content.replace(init_method_old, init_method_new)
    
    # Добавляем метод для получения imageStore в глобальную область
    get_current_slide = '''get currentSlide() {
        return this.currentProject?.slides?.[this.currentSlideIndex] || null;
      }'''
    
    get_current_slide_new = '''get currentSlide() {
        return this.currentProject?.slides?.[this.currentSlideIndex] || null;
      },
      
      // Методы для работы с imageStore из других компонентов
      setImageState(imageId, state, metadata = {}) {
        this.imageStore.setState(imageId, state, metadata);
      },
      
      getImageState(imageId) {
        return this.imageStore.getState(imageId);
      },
      
      getImageMetadata(imageId) {
        return this.imageStore.getMetadata(imageId);
      }'''
    
    content = content.replace(get_current_slide, get_current_slide_new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Модифицирован {file_path} - добавлен imageStore")

def modify_progressive_image():
    """Модифицируем ProgressiveImage.astro для интеграции с store"""
    file_path = "src/components/ProgressiveImage.astro"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Добавляем генерацию ID в frontmatter
    frontmatter_addition = '''
// Генерация уникального ID для изображения
const imageId = typeof src === 'string' 
  ? btoa(src + (width || '') + (height || '')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  : btoa((src.src || '') + (width || '') + (height || '')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

const isRemote = typeof src === 'string' && src.startsWith('http');'''
    
    # Находим место для вставки (после деструктуризации props)
    props_end = '''const isRemote = typeof src === 'string' && src.startsWith('http');'''
    
    if props_end in content:
        content = content.replace(props_end, frontmatter_addition)
    else:
        # Если не найдено, вставляем после деструктуризации
        const_section = '''} = Astro.props;'''
        if const_section in content:
            content = content.replace(const_section, const_section + '\n' + frontmatter_addition)
    
    # Модифицируем HTML часть
    old_div = '''<div class:list={["relative w-full h-full overflow-hidden isolate", className]} {...rest}>'''
    
    new_div = '''<div 
  class:list={["relative w-full h-full overflow-hidden isolate", className]} 
  x-data="{ imageId: $el.dataset.imageId }"
  x-init="$root.setImageState(imageId, 'idle')"
  :data-image-state="$root.getImageState(imageId)"
  data-image-id={imageId}
  {...rest}
>'''
    
    content = content.replace(old_div, new_div)
    
    # Модифицируем remote изображение
    old_remote_img = '''    <img 
      src={src as string} 
      alt={alt}
      class="w-full h-full object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />'''
    
    new_remote_img = '''    <img 
      src={src as string} 
      alt={alt}
      class="w-full h-full object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      x-on:loadstart="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'loading')"
      x-on:load="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'loaded')"
      x-on:error="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'error')"
    />'''
    
    content = content.replace(old_remote_img, new_remote_img)
    
    # Модифицируем Astro Image
    old_astro_image = '''    <Image 
      src={src as ImageMetadata} 
      alt={alt}
      class="w-full h-full object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
    />'''
    
    new_astro_image = '''    <Image 
      src={src as ImageMetadata} 
      alt={alt}
      class="w-full h-full object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
      x-on:loadstart="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'loading')"
      x-on:load="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'loaded')"
      x-on:error="$root.setImageState($el.closest('[data-image-id]').dataset.imageId, 'error')"
    />'''
    
    content = content.replace(old_astro_image, new_astro_image)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Модифицирован {file_path} - добавлена интеграция с imageStore")

def add_css_loading_states():
    """Добавляем CSS custom properties и утилиты для состояний загрузки"""
    file_path = "src/styles/global.css"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # CSS для состояний загрузки
    loading_states_css = '''
/* ===== СИСТЕМА СОСТОЯНИЙ ЗАГРУЗКИ ===== */

/* CSS Custom Properties для управления состояниями */
:root {
  /* Timing функции для анимаций */
  --loading-transition-duration: 300ms;
  --loading-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --loading-shimmer-duration: 1.5s;
  --loading-fade-duration: 500ms;
  
  /* Цвета состояний */
  --loading-skeleton-bg: rgba(255, 255, 255, 0.1);
  --loading-skeleton-highlight: rgba(255, 255, 255, 0.2);
  --loading-error-bg: rgba(220, 38, 38, 0.1);
  --loading-error-border: rgba(220, 38, 38, 0.3);
  
  /* Z-index для состояний */
  --loading-overlay-z: 10;
  --loading-skeleton-z: 5;
}

/* Базовые стили для состояний загрузки */
[data-image-state] {
  position: relative;
  transition: all var(--loading-transition-duration) var(--loading-transition-easing);
}

/* Состояние idle - готово к загрузке */
[data-image-state="idle"] {
  opacity: 1;
}

/* Состояние loading - процесс загрузки */
[data-image-state="loading"] {
  opacity: 0.8;
}

[data-image-state="loading"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--loading-skeleton-bg);
  z-index: var(--loading-skeleton-z);
  pointer-events: none;
}

/* Состояние loaded - успешно загружено */
[data-image-state="loaded"] {
  opacity: 1;
}

[data-image-state="loaded"] img,
[data-image-state="loaded"] picture {
  animation: loading-fade-in var(--loading-fade-duration) var(--loading-transition-easing);
}

/* Состояние error - ошибка загрузки */
[data-image-state="error"] {
  opacity: 0.6;
  background: var(--loading-error-bg);
  border: 1px solid var(--loading-error-border);
}

[data-image-state="error"]::after {
  content: '⚠️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  z-index: var(--loading-overlay-z);
  pointer-events: none;
}

/* Анимации */
@keyframes loading-fade-in {
  from {
    opacity: 0;
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes loading-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Shimmer эффект для loading состояния */
[data-image-state="loading"]::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--loading-skeleton-highlight),
    transparent
  );
  animation: loading-shimmer var(--loading-shimmer-duration) infinite;
  z-index: calc(var(--loading-skeleton-z) + 1);
  pointer-events: none;
}

/* Утилитарные классы */
.loading-state-idle { opacity: 1; }
.loading-state-loading { opacity: 0.8; }
.loading-state-loaded { opacity: 1; }
.loading-state-error { opacity: 0.6; }

/* Responsive изменения для мобильных */
@media (max-width: 768px) {
  :root {
    --loading-transition-duration: 200ms;
    --loading-shimmer-duration: 1s;
    --loading-fade-duration: 300ms;
  }
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --loading-transition-duration: 0ms;
    --loading-shimmer-duration: 0ms;
    --loading-fade-duration: 0ms;
  }
  
  [data-image-state="loading"]::after {
    animation: none;
    background: var(--loading-skeleton-highlight);
  }
  
  @keyframes loading-fade-in {
    from, to {
      opacity: 1;
      transform: scale(1);
    }
  }
}

/* ===== КОНЕЦ СИСТЕМЫ СОСТОЯНИЙ ЗАГРУЗКИ ===== */
'''
    
    # Вставляем после существующих утилит, перед концом файла
    insertion_point = "/* Анимации */"
    if insertion_point in content:
        content = content.replace(insertion_point, loading_states_css + "\n" + insertion_point)
    else:
        # Если не найдено, добавляем в конец
        content += loading_states_css
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Модифицирован {file_path} - добавлены CSS состояния загрузки")

def create_utils_file():
    """Создаем утилитарный файл для работы с состояниями загрузки"""
    utils_dir = "src/utils"
    os.makedirs(utils_dir, exist_ok=True)
    
    file_path = f"{utils_dir}/loadingUtils.js"
    
    utils_content = '''/**
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
'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(utils_content)
    
    print(f"✓ Создан {file_path} - утилиты для работы с состояниями")

def create_documentation():
    """Создаем документацию для первого этапа"""
    docs_dir = "docs"
    os.makedirs(docs_dir, exist_ok=True)
    
    file_path = f"{docs_dir}/loading-states-architecture.md"
    
    docs_content = '''# Этап 1: Архитектура состояний загрузки

## Обзор реализации

Создана единая система управления состояниями загрузки изображений на основе Alpine.js store, интегрированная с существующей архитектурой приложения.

## Компоненты системы

### 1. ImageStore (src/pages/index.astro)
Центральный store для управления состояниями загрузки:
- `states` - Map для хранения состояний изображений
- `generateId()` - генерация уникальных ID
- `setState()` / `getState()` - управление состояниями
- `cleanup()` - автоматическая очистка старых состояний

### 2. ProgressiveImage Component (src/components/ProgressiveImage.astro)
Интегрирован с imageStore:
- Автоматическая генерация imageId
- Обработчики событий загрузки
- Alpine.js директивы для связи с store
- Data-атрибуты для CSS стилизации

### 3. CSS Loading States (src/styles/global.css)
Визуальная система состояний:
- CSS custom properties для настройки
- Селекторы по data-атрибутам
- Shimmer анимации для loading состояния
- Responsive и accessibility поддержка

### 4. Loading Utils (src/utils/loadingUtils.js)
Утилитарные функции:
- Константы состояний
- Генерация ID
- DOM утилиты
- Функции оптимизации

## Состояния загрузки

1. **idle** - изображение не начинало загружаться
2. **loading** - процесс загрузки идет (с shimmer эффектом)
3. **loaded** - успешная загрузка (с fade-in анимацией)
4. **error** - ошибка загрузки (с индикатором ошибки)

## Использование

### В компонентах
```astro
<ProgressiveImage 
  src={image} 
  alt="Описание"
  priority={true}
/>
```

### В Alpine.js контексте
```javascript
// Получение состояния
$root.getImageState(imageId)

// Установка состояния
$root.setImageState(imageId, 'loaded')

// Проверка статистики
$root.imageStore.getStats()
```

### CSS стилизация
```css
[data-image-state="loading"] {
  /* Стили для загрузки */
}
```

## Производительность

- Автоматическая очистка старых состояний (>5 минут)
- Debounce/throttle функции для оптимизации
- Поддержка prefers-reduced-motion
- Минимальное влияние на производительность

## Следующие этапы

1. Скелетоны с Shimmer эффектами
2. Плавные анимации загрузки
3. Обработка ошибок и автоповтор
4. Мобильные взаимодействия

## Отладка

Включите режим отладки:
```javascript
localStorage.setItem('loading-debug', 'true');
```

Проверьте статистику состояний в консоли браузера:
```javascript
Alpine.store('main').imageStore.getStats()
```
'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(docs_content)
    
    print(f"✓ Создана документация {file_path}")

def main():
    """Основная функция выполнения всех изменений"""
    print("🚀 Начинаем реализацию Этапа 1: Архитектура состояний загрузки")
    print("=" * 60)
    
    try:
        # Проверяем существование ключевых файлов
        required_files = [
            "src/pages/index.astro",
            "src/components/ProgressiveImage.astro", 
            "src/styles/global.css"
        ]
        
        for file_path in required_files:
            if not os.path.exists(file_path):
                print(f"❌ Не найден файл: {file_path}")
                return
        
        print("✓ Все необходимые файлы найдены")
        print()
        
        # Выполняем модификации
        modify_index_astro()
        modify_progressive_image()
        add_css_loading_states()
        create_utils_file()
        create_documentation()
        
        print()
        print("=" * 60)
        print("🎉 Этап 1 успешно завершен!")
        print()
        print("Реализовано:")
        print("• Единая система состояний загрузки в Alpine.js")
        print("• Интеграция ProgressiveImage с imageStore")
        print("• CSS custom properties для состояний")
        print("• Shimmer анимации для loading состояния")
        print("• Утилиты для работы с состояниями")
        print("• Автоматическая очистка и оптимизация")
        print()
        print("Следующий этап: Скелетоны с Shimmer эффектами")
        print("Запустите dev сервер и проверьте работу состояний загрузки")
        
    except Exception as e:
        print(f"❌ Ошибка при выполнении: {e}")
        raise

if __name__ == "__main__":
    main()
