# Этап 1: Архитектура состояний загрузки

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
