/**
 * Глобальные объявления типов для портфолио
 * Использует экспортированные типы из FLIP контроллера
 */

// Импортируем типы из FLIP контроллера
import type { IFlipAnimationController, ElementRect, ElementBackground } from '../utils/flipController.js';

// Конфигурация FLIP анимаций
interface FlipConfig {
  DURATION: number;
  EASING: string;
  ELASTIC_EASING: string;
  Z_INDEX: number;
  SCALE_FACTOR: number;
  BLUR_AMOUNT: number;
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

// Утилиты для FLIP анимаций
interface FlipUtils {
  forceRestoreElement(element: HTMLElement): void;
}

// Расширение глобального объекта Window
declare global {
  interface Window {
    // Конфигурация FLIP анимаций
    FLIP_CONFIG: FlipConfig;
    
    // Конструктор FLIP контроллера
    FlipAnimationController: new () => IFlipAnimationController;
    
    // Глобальный экземпляр контроллера
    globalFlipController: IFlipAnimationController;
    
    // Утилиты для FLIP анимаций
    flipUtils: FlipUtils;
    
    // Данные портфолио
    portfolioProjects: PortfolioProject[];
  }
}

// Экспорт для использования в модулях
export {};
