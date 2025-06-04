/**
 * Глобальные объявления типов для портфолио
 * Исправленная типизация FLIP анимаций с правильным разделением конструктора и экземпляра
 */

// Конфигурация FLIP анимаций
interface FlipConfig {
  DURATION: number;
  EASING: string;
  ELASTIC_EASING: string;
  Z_INDEX: number;
  SCALE_FACTOR: number;
  BLUR_AMOUNT: number;
}

// Прямоугольник элемента для FLIP анимации
interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  transform: string;
  borderRadius: string;
  background: ElementBackground;
  zIndex: string;
}

// Фон элемента (изображение или цвет)
interface ElementBackground {
  type: 'image' | 'color';
  src?: string;
  objectFit?: string;
  objectPosition?: string;
  background?: string;
  backgroundColor?: string;
}

// Экземпляр контроллера FLIP анимаций
interface FlipAnimationControllerInstance {
  activeAnimations: Map<string, Animation>;
  animationElements: Set<HTMLElement>;
  isAnimating: boolean;
  hiddenElements: Map<HTMLElement, any>;
  
  captureElementRect(element: HTMLElement): ElementRect | null;
  extractBackground(element: HTMLElement): ElementBackground;
  createAnimationElement(sourceRect: ElementRect, sourceElement: HTMLElement): HTMLElement;
  applyBackground(element: HTMLElement, background: ElementBackground, sourceElement: HTMLElement): void;
  calculateTargetRect(modalContainer?: HTMLElement): ElementRect;
  animateOpen(sourceElement: HTMLElement, targetContainer?: HTMLElement, onComplete?: () => Promise<void>): Promise<void>;
  animateClose(modalContainer: HTMLElement, targetElement: HTMLElement, onComplete?: () => Promise<void>): Promise<void>;
  hideElementSafely(element: HTMLElement): void;
  restoreElementSafely(element: HTMLElement): void;
  cleanupAnimation(animationEl: HTMLElement): void;
  cleanup(): void;
}

// Конструктор для FlipAnimationController - исправленная типизация
interface FlipAnimationControllerConstructor {
  new(): FlipAnimationControllerInstance;
}

// Утилиты для FLIP анимаций
interface FlipUtils {
  forceRestoreElement(element: HTMLElement): void;
}

// Данные портфолио
interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  audience: string;
  slides: Array<{
    image: {
      src: string;
      width?: number;
      height?: number;
    };
    task?: string;
    solution?: string;
  }>;
}

// Расширение глобального объекта Window - правильная типизация
declare global {
  interface Window {
    // Конфигурация FLIP анимаций
    FLIP_CONFIG: FlipConfig;
    
    // Конструктор контроллера FLIP анимаций (правильно типизированный)
    FlipAnimationController: FlipAnimationControllerConstructor;
    
    // Глобальный экземпляр контроллера
    globalFlipController: FlipAnimationControllerInstance;
    
    // Утилиты для FLIP анимаций
    flipUtils: FlipUtils;
    
    // Данные портфолио
    portfolioProjects: PortfolioProject[];
  }
}

// Экспорт для использования в модулях
export {};
