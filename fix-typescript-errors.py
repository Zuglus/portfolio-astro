#!/usr/bin/env python3
"""
Скрипт для исправления ошибок TypeScript в FLIP контроллере
Диалектический подход: от противоречия (JS с TS синтаксисом) к синтезу (чистый JS)
"""

import os
import sys
from pathlib import Path

# Определяем базовую директорию проекта
BASE_DIR = Path.cwd()
FLIP_CONTROLLER_PATH = BASE_DIR / "src" / "utils" / "flipController.js"

# Новое содержимое файла - чистый JavaScript без TypeScript синтаксиса
FLIP_CONTROLLER_CONTENT = """/**
 * FLIP Animation Controller - отдельный модуль
 * Диалектический подход: от единства противоположностей (статика/динамика) к синтезу (плавные переходы)
 */

// Константы конфигурации - неизменная основа для изменчивых анимаций
export const FLIP_CONFIG = {
  DURATION: 400,
  EASING: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  ELASTIC_EASING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  Z_INDEX: 9999,
  SCALE_FACTOR: 0.95,
  BLUR_AMOUNT: 8
};

/**
 * Контроллер FLIP анимаций
 * Реализует диалектику движения: от потенциального (статичная карточка) к актуальному (модальное окно)
 */
export class FlipAnimationController {
  constructor() {
    // Публичные свойства для соответствия интерфейсу
    this.activeAnimations = new Map();
    this.animationElements = new Set();
    this.isAnimating = false;
    this.hiddenElements = new Map();
  }

  /**
   * Захват состояния элемента - фиксация "первого" состояния для FLIP
   */
  captureElementRect(element) {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      transform: computedStyle.transform,
      borderRadius: computedStyle.borderRadius,
      background: this.extractBackground(element),
      zIndex: computedStyle.zIndex
    };
  }

  /**
   * Извлечение визуального содержания элемента
   */
  extractBackground(element) {
    const img = element.querySelector('img');
    if (img && img.complete) {
      return {
        type: 'image',
        src: img.src,
        objectFit: window.getComputedStyle(img).objectFit,
        objectPosition: window.getComputedStyle(img).objectPosition
      };
    }
    
    const computedStyle = window.getComputedStyle(element);
    return {
      type: 'color',
      background: computedStyle.background,
      backgroundColor: computedStyle.backgroundColor
    };
  }

  /**
   * Создание промежуточного элемента для анимации - материализация перехода
   */
  createAnimationElement(sourceRect, sourceElement) {
    const animationEl = document.createElement('div');
    
    Object.assign(animationEl.style, {
      position: 'fixed',
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      borderRadius: sourceRect.borderRadius,
      zIndex: FLIP_CONFIG.Z_INDEX.toString(),
      pointerEvents: 'none',
      willChange: 'transform, opacity, border-radius',
      transformOrigin: 'center center',
      overflow: 'hidden'
    });

    this.applyBackground(animationEl, sourceRect.background, sourceElement);
    
    document.body.appendChild(animationEl);
    this.animationElements.add(animationEl);
    
    return animationEl;
  }

  /**
   * Применение фона к анимационному элементу
   */
  applyBackground(element, background, sourceElement) {
    if (background.type === 'image') {
      const img = document.createElement('img');
      img.src = background.src;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: ${background.objectFit};
        object-position: ${background.objectPosition};
        display: block;
      `;
      element.appendChild(img);
    } else {
      element.style.background = background.background || '';
      element.style.backgroundColor = background.backgroundColor || '';
    }
  }

  /**
   * Вычисление целевого прямоугольника - "последнее" состояние FLIP
   */
  calculateTargetRect(modalContainer) {
    if (!modalContainer) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const targetWidth = Math.min(viewportWidth * 0.9, 1200);
      const targetHeight = Math.min(viewportHeight * 0.8, 800);
      
      return {
        left: (viewportWidth - targetWidth) / 2,
        top: (viewportHeight - targetHeight) / 2,
        width: targetWidth,
        height: targetHeight,
        centerX: viewportWidth / 2,
        centerY: viewportHeight / 2,
        borderRadius: '1.875rem',
        transform: 'none',
        background: { type: 'color' },
        zIndex: 'auto'
      };
    }
    
    const rect = modalContainer.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(modalContainer);
    
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      borderRadius: computedStyle.borderRadius,
      transform: computedStyle.transform,
      background: { type: 'color' },
      zIndex: computedStyle.zIndex
    };
  }

  /**
   * Анимация открытия - диалектический переход от частного к общему
   */
  async animateOpen(sourceElement, targetContainer, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    try {
      const sourceRect = this.captureElementRect(sourceElement);
      if (!sourceRect) throw new Error('Не удалось захватить позицию источника');

      const animationEl = this.createAnimationElement(sourceRect, sourceElement);
      const targetRect = this.calculateTargetRect(targetContainer);

      // Вычисление трансформации - от "здесь" к "там"
      const deltaX = targetRect.centerX - sourceRect.centerX;
      const deltaY = targetRect.centerY - sourceRect.centerY;
      const scaleX = targetRect.width / sourceRect.width;
      const scaleY = targetRect.height / sourceRect.height;

      this.hideElementSafely(sourceElement);

      const animation = animationEl.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          borderRadius: sourceRect.borderRadius,
          opacity: '1'
        },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: targetRect.borderRadius,
          opacity: '0.95'
        }
      ], {
        duration: FLIP_CONFIG.DURATION,
        easing: FLIP_CONFIG.EASING,
        fill: 'forwards'
      });

      await animation.finished;

      if (onComplete) await onComplete();
      this.cleanupAnimation(animationEl);

    } catch (error) {
      console.warn('Ошибка FLIP анимации:', error);
      this.restoreElementSafely(sourceElement);
      if (onComplete) await onComplete();
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Анимация закрытия - возврат к источнику
   */
  async animateClose(modalContainer, targetElement, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    try {
      const sourceRect = this.calculateTargetRect(modalContainer);
      const targetRect = this.captureElementRect(targetElement);
      
      if (!targetRect) throw new Error('Не удалось найти целевой элемент');

      const animationEl = this.createAnimationElement(sourceRect, modalContainer);

      if (modalContainer) {
        modalContainer.style.opacity = '0';
      }

      const deltaX = targetRect.centerX - sourceRect.centerX;
      const deltaY = targetRect.centerY - sourceRect.centerY;
      const scaleX = targetRect.width / sourceRect.width;
      const scaleY = targetRect.height / sourceRect.height;

      const animation = animationEl.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          borderRadius: sourceRect.borderRadius,
          opacity: '0.95'
        },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: targetRect.borderRadius,
          opacity: '1'
        }
      ], {
        duration: FLIP_CONFIG.DURATION * 0.8,
        easing: FLIP_CONFIG.ELASTIC_EASING,
        fill: 'forwards'
      });

      await animation.finished;

      this.restoreElementSafely(targetElement);
      if (onComplete) await onComplete();
      this.cleanupAnimation(animationEl);

    } catch (error) {
      console.warn('Ошибка FLIP анимации закрытия:', error);
      this.restoreElementSafely(targetElement);
      if (onComplete) await onComplete();
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Безопасное сокрытие элемента с сохранением состояния
   */
  hideElementSafely(element) {
    if (!element) return;
    
    const originalState = {
      opacity: element.style.opacity,
      visibility: element.style.visibility,
      transform: element.style.transform,
      transition: element.style.transition
    };
    
    this.hiddenElements.set(element, originalState);
    
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.transition = 'none';
  }

  /**
   * Безопасное восстановление элемента
   */
  restoreElementSafely(element) {
    if (!element) return;
    
    const originalState = this.hiddenElements.get(element);
    
    if (originalState) {
      element.style.opacity = originalState.opacity;
      element.style.visibility = originalState.visibility;
      element.style.transform = originalState.transform;
      element.style.transition = originalState.transition;
      
      this.hiddenElements.delete(element);
    } else {
      element.style.removeProperty('opacity');
      element.style.removeProperty('visibility');
      element.style.removeProperty('transform');
      element.style.removeProperty('transition');
    }
    
    element.classList.remove('flip-preparing', 'flip-animating', 'flip-click-effect');
    element.offsetHeight; // Принудительный reflow
  }

  /**
   * Очистка анимационного элемента
   */
  cleanupAnimation(animationEl) {
    if (animationEl && animationEl.parentNode) {
      animationEl.style.transition = 'opacity 200ms ease-out';
      animationEl.style.opacity = '0';
      
      setTimeout(() => {
        if (animationEl.parentNode) {
          animationEl.parentNode.removeChild(animationEl);
        }
        this.animationElements.delete(animationEl);
      }, 200);
    }
  }

  /**
   * Полная очистка контроллера
   */
  cleanup() {
    this.hiddenElements.forEach((originalState, element) => {
      this.restoreElementSafely(element);
    });
    
    this.animationElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    this.animationElements.clear();
    this.activeAnimations.clear();
    this.hiddenElements.clear();
    this.isAnimating = false;
  }
}
"""

def main():
    """
    Основная функция - исправляет ошибки TypeScript
    Движение от проблемы к решению через преобразование кода
    """
    print("🔧 Исправление ошибок TypeScript в FLIP контроллере...")
    
    try:
        # Проверяем существование файла
        if not FLIP_CONTROLLER_PATH.exists():
            print(f"❌ Файл {FLIP_CONTROLLER_PATH} не найден!")
            return False
        
        # Записываем исправленное содержимое
        with open(FLIP_CONTROLLER_PATH, 'w', encoding='utf-8') as f:
            f.write(FLIP_CONTROLLER_CONTENT)
        
        print(f"✅ Файл {FLIP_CONTROLLER_PATH} успешно исправлен!")
        print("   - Убран TypeScript синтаксис из JavaScript файла")
        print("   - Свойства класса теперь публичные")
        print("   - Сохранена вся функциональность")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при исправлении файла: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
