# Подробный план оптимизации портфолио согласно Astro/Context7 рекомендациям

## 🎯 Общие принципы
- Каждый этап создает **рабочую версию** проекта
- После каждого этапа выполняется `npm run build` и `npm run preview` для проверки
- Коммиты в git после каждого завершенного этапа
- Тестирование в разных браузерах на мобильных и десктоп устройствах

---

## 📋 ЭТАП 1: CSS Оптимизация
**Цель**: Вынести встроенные стили из Layout.astro в отдельные CSS файлы  
**Время**: ~30-45 минут  
**Статус**: ⏳ Pending

### Задачи:
1. **Создать структуру CSS файлов**:
   - `src/styles/components/modal.css` - стили модального окна
   - `src/styles/components/animations.css` - анимации (shimmer, transitions)
   - `src/styles/utilities/accessibility.css` - стили доступности

2. **Перенести стили**:
   - Из `<style>` блока в Layout.astro (строки 54-85)
   - Сохранить функциональность prefers-reduced-motion
   - Добавить CSS custom properties для повторяющихся значений

3. **Импортировать в Layout.astro**:
   ```astro
   import '../styles/components/modal.css';
   import '../styles/components/animations.css';
   import '../styles/utilities/accessibility.css';
   ```

4. **Проверка**:
   - ✅ `npm run build` без ошибок
   - ✅ `npm run preview` - модальные окна работают
   - ✅ Анимации шиммера отображаются корректно
   - ✅ Accessibility стили активны

---

## 📋 ЭТАП 2: Astro Image Компонент
**Цель**: Замена стандартных img тегов на оптимизированный Astro Image  
**Время**: ~45-60 минут  
**Статус**: ⏳ Pending

### Задачи:
1. **Установка зависимостей** (если нужно):
   ```bash
   npm install @astrojs/image
   ```

2. **Обновить astro.config.mjs**:
   ```js
   import { defineConfig } from 'astro/config';
   import tailwind from '@astrojs/tailwind';
   
   export default defineConfig({
     integrations: [tailwind({ applyBaseStyles: false })],
     image: {
       service: { entrypoint: 'astro/assets/services/sharp' }
     }
   });
   ```

3. **Заменить img теги**:
   - **Header.astro** (строка 9-15): логотип
   - **index.astro** (строки 309-322): основные изображения в модальных окнах
   - **index.astro** (строки 428-434): увеличенные изображения

4. **Добавить оптимизацию**:
   - Автоматическое определение размеров
   - WebP/AVIF форматы для современных браузеров
   - Responsive изображения с srcset

5. **Пример замены**:
   ```astro
   ---
   import { Image } from 'astro:assets';
   import logoImage from '../assets/images/logo.svg';
   ---
   
   <Image 
     src={logoImage} 
     alt="Логотип Полина Мигранова"
     class="w-full h-full object-contain"
     format="webp"
     quality={90}
     loading="eager"
   />
   ```

6. **Проверка**:
   - ✅ `npm run build` без ошибок
   - ✅ Изображения загружаются в WebP/AVIF
   - ✅ Responsive версии генерируются
   - ✅ Performance Score улучшился в Lighthouse

---

## 📋 ЭТАП 3: TypeScript Типизация
**Цель**: Добавить строгую типизацию для Alpine.js и компонентов  
**Время**: ~60-90 минут  
**Статус**: ⏳ Pending

### Задачи:
1. **Создать типы для Alpine.js**:
   ```typescript
   // src/types/alpine.ts
   export interface ProjectSlide {
     image: { src: string; alt?: string };
     task?: string;
     solution?: string;
   }
   
   export interface Project {
     id: string;
     title: string;
     description?: string;
     audience?: string;
     slides: ProjectSlide[];
   }
   
   export interface ModalState {
     isModalOpen: boolean;
     currentProject: Project | null;
     currentSlideIndex: number;
     isTransitioning: boolean;
     isContentVisible: boolean;
     isImageLoading: boolean;
     isInitialLoad: boolean;
     currentImageAspectRatio: number | null;
     isImageZoomed: boolean;
   }
   ```

2. **Обновить src/types.ts**:
   - Добавить интерфейсы для всех данных
   - Экспортировать типы для переиспользования

3. **Добавить типы в компоненты**:
   ```astro
   ---
   import type { Project } from '../types/alpine.ts';
   
   export interface Props {
     projects: Project[];
   }
   ---
   ```

4. **Настроить tsconfig.json**:
   ```json
   {
     "extends": "astro/tsconfigs/strict",
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```

5. **Проверка**:
   - ✅ `npm run build` без TypeScript ошибок
   - ✅ IDE показывает автодополнение
   - ✅ Типы проверяются во время разработки

---

## 📋 ЭТАП 4: Bundle Оптимизация
**Цель**: Настроить code splitting и оптимизацию сборки  
**Время**: ~45-60 минут  
**Статус**: ⏳ Pending

### Задачи:
1. **Обновить astro.config.mjs**:
   ```js
   export default defineConfig({
     integrations: [tailwind({ applyBaseStyles: false })],
     vite: {
       build: {
         cssMinify: 'esbuild',
         rollupOptions: {
           output: {
             manualChunks: {
               alpine: ['alpinejs'],
               vendor: ['tailwindcss']
             }
           }
         }
       }
     }
   });
   ```

2. **Оптимизировать загрузку Alpine.js**:
   ```astro
   <!-- В Layout.astro заменить на: -->
   <script>
     import('alpinejs').then(Alpine => {
       window.Alpine = Alpine.default;
       Alpine.default.start();
     });
   </script>
   ```

3. **Добавить preload для критических ресурсов**:
   ```astro
   <link rel="preload" href="/fonts/MV-SKIFER.otf" as="font" type="font/otf" crossorigin />
   <link rel="preload" href="/fonts/Onest-Regular.ttf" as="font" type="font/ttf" crossorigin />
   <link rel="modulepreload" href="/src/scripts/alpine.js" />
   ```

4. **Настроить CSS purging**:
   ```js
   // tailwind.config.mjs
   export default {
     content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
     // ... остальные настройки
   }
   ```

5. **Проверка**:
   - ✅ Bundle analyzer показывает правильное разделение
   - ✅ Lighthouse Performance > 90
   - ✅ First Contentful Paint < 1.5s
   - ✅ Time to Interactive < 3s

---

## 📋 ЭТАП 5: Дополнительные Оптимизации
**Цель**: Финальные улучшения производительности и UX  
**Время**: ~60-90 минут  
**Статус**: ⏳ Pending

### Задачи:
1. **Preloading стратегия**:
   ```astro
   <link rel="prefetch" href="/api/projects" />
   <link rel="preload" as="image" href="/assets/hero-image.webp" />
   ```

2. **Lazy loading оптимизация**:
   - Intersection Observer для изображений вне viewport
   - Progressive JPEG для больших изображений
   - Blur placeholder пока изображение загружается

3. **Service Worker улучшения**:
   ```js
   // public/sw.js
   const CACHE_NAME = 'portfolio-v1';
   const urlsToCache = [
     '/',
     '/styles/global.css',
     '/fonts/MV-SKIFER.otf',
     '/fonts/Onest-Regular.ttf'
   ];
   ```

4. **Critical CSS inline**:
   - Inline критические стили для above-the-fold контента
   - Async загрузка остальных CSS

5. **Resource hints**:
   ```astro
   <link rel="dns-prefetch" href="//fonts.googleapis.com" />
   <link rel="preconnect" href="https://your-api-domain.com" crossorigin />
   ```

6. **Проверка финальная**:
   - ✅ Lighthouse Performance > 95
   - ✅ Lighthouse Accessibility > 95
   - ✅ Lighthouse Best Practices > 90
   - ✅ Lighthouse SEO > 90
   - ✅ WebPageTest Speed Index < 2s
   - ✅ Все тесты проходят: `npm run test`

---

## 🔄 Процесс работы между чатами:

### Перед началом работы:
```bash
git pull origin main
npm install
```

### После каждого этапа:
```bash
npm run build
npm run preview
npm run test  # если есть тесты
git add .
git commit -m "feat: завершен этап X - [описание]"
git push origin main
```

### Проверочный чек-лист для каждого этапа:
- [ ] Код собирается без ошибок
- [ ] Функциональность работает в браузере
- [ ] Мобильная версия отображается корректно
- [ ] Нет console.error в DevTools
- [ ] Performance не ухудшился
- [ ] Accessibility не нарушен

Каждый этап независим и создает рабочую версию проекта, готовую к продакшену.

---

## 📊 Отслеживание прогресса

### Статусы этапов:
- ⏳ Pending - не начат
- 🔄 In Progress - в работе  
- ✅ Completed - завершен
- ❌ Blocked - заблокирован

### История изменений:
| Дата | Этап | Статус | Комментарий |
|------|------|--------|-------------|
| TBD  | 1    | ⏳     | Создан план |
| TBD  | 2    | ⏳     | -           |
| TBD  | 3    | ⏳     | -           |
| TBD  | 4    | ⏳     | -           |
| TBD  | 5    | ⏳     | -           |