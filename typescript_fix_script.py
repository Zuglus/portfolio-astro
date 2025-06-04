#!/usr/bin/env python3
"""
Скрипт для создания объявлений TypeScript типов и исправления ошибок глобальных свойств
Применяет принцип движения от целого к целому: система типов -> конкретные объявления -> интеграция
"""

import os
import json
from pathlib import Path

def create_global_types():
    """
    Создает файл объявления типов для глобальных расширений
    Движение от абстрактного (общая система типов) к конкретному (специфичные объявления)
    """
    
    types_content = '''/**
 * Глобальные объявления типов для портфолио
 * Расширения window объекта для FLIP анимаций и управления состоянием
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

// Контроллер FLIP анимаций
interface FlipAnimationController {
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

// Конструктор для FlipAnimationController
interface FlipAnimationControllerConstructor {
  new(): FlipAnimationController;
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

// Расширение глобального объекта Window
declare global {
  interface Window {
    // Конфигурация FLIP анимаций
    FLIP_CONFIG: FlipConfig;
    
    // Конструктор контроллера FLIP анимаций
    FlipAnimationController: FlipAnimationControllerConstructor;
    
    // Глобальный экземпляр контроллера
    globalFlipController: FlipAnimationController;
    
    // Утилиты для FLIP анимаций
    flipUtils: FlipUtils;
    
    // Данные портфолио
    portfolioProjects: PortfolioProject[];
  }
}

// Экспорт для использования в модулях
export {};
'''
    
    # Создаем директорию src/types если её нет
    types_dir = Path('src/types')
    types_dir.mkdir(exist_ok=True)
    
    # Записываем файл объявлений типов
    types_file = types_dir / 'global.d.ts'
    with open(types_file, 'w', encoding='utf-8') as f:
        f.write(types_content)
    
    print(f"✅ Создан файл объявления типов: {types_file}")
    return types_file

def update_tsconfig():
    """
    Обновляет tsconfig.json для включения файлов объявления типов
    Принцип последовательности: настройка системы -> интеграция файлов
    """
    
    tsconfig_path = Path('tsconfig.json')
    
    if not tsconfig_path.exists():
        print("❌ Файл tsconfig.json не найден")
        return False
    
    try:
        with open(tsconfig_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Убеждаемся что в include есть src/types
        include_list = config.get('include', [])
        
        # Добавляем src/types если её нет
        types_pattern = 'src/types/**/*'
        if types_pattern not in include_list:
            include_list.append(types_pattern)
            config['include'] = include_list
            
            with open(tsconfig_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Обновлен tsconfig.json: добавлен {types_pattern}")
        else:
            print("✅ tsconfig.json уже содержит нужные настройки")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Ошибка парсинга tsconfig.json: {e}")
        return False
    except Exception as e:
        print(f"❌ Ошибка обновления tsconfig.json: {e}")
        return False

def verify_types_integration():
    """
    Проверяет интеграцию системы типов
    Принцип проверки от целого: система работает как единое целое
    """
    
    checks = []
    
    # Проверяем существование файла типов
    types_file = Path('src/types/global.d.ts')
    checks.append(('Файл типов создан', types_file.exists()))
    
    # Проверяем tsconfig.json
    tsconfig_path = Path('tsconfig.json')
    tsconfig_ok = False
    if tsconfig_path.exists():
        try:
            with open(tsconfig_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            include_list = config.get('include', [])
            tsconfig_ok = any('src/types' in item for item in include_list)
        except:
            pass
    
    checks.append(('tsconfig.json настроен', tsconfig_ok))
    
    # Проверяем основные файлы проекта
    important_files = [
        'src/pages/index.astro',
        'src/styles/flip-animations.css',
        'src/styles/modal-transitions.css'
    ]
    
    for file_path in important_files:
        checks.append((f'Файл {file_path} существует', Path(file_path).exists()))
    
    # Выводим результаты проверки
    print("\n🔍 Проверка интеграции типов:")
    all_ok = True
    for check_name, is_ok in checks:
        status = "✅" if is_ok else "❌"
        print(f"  {status} {check_name}")
        if not is_ok:
            all_ok = False
    
    return all_ok

def create_env_d_ts():
    """
    Создает дополнительный файл для переменных окружения
    Обеспечивает полную типизацию среды разработки
    """
    
    env_types_content = '''/**
 * Объявления типов для переменных окружения и Astro
 */

/// <reference types="astro/client" />

// Дополнительные типы для Astro
declare namespace App {
  // Можно добавить дополнительные типы для приложения
}

// Типы для CSS модулей (если будут использоваться)
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Типы для SVG файлов
declare module '*.svg' {
  const content: any;
  export default content;
}

// Типы для изображений
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}
'''
    
    env_file = Path('src/env.d.ts')
    
    # Проверяем существует ли файл и нужно ли его обновлять
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            existing_content = f.read()
        
        # Если уже содержит нужные объявления, не перезаписываем
        if '/// <reference types="astro/client" />' in existing_content:
            print("✅ Файл env.d.ts уже существует и настроен")
            return env_file
    
    # Создаем или обновляем файл
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(env_types_content)
    
    print(f"✅ Создан/обновлен файл типов среды: {env_file}")
    return env_file

def main():
    """
    Главная функция - применяет диалектический подход
    От проблемы (противоречие типов) к решению (синтез объявлений)
    """
    
    print("🚀 Исправление TypeScript ошибок для FLIP анимаций")
    print("=" * 60)
    
    # Этап 1: Создание базовой системы типов
    print("\n📁 Создание системы объявления типов...")
    types_file = create_global_types()
    
    # Этап 2: Создание дополнительных типов среды
    print("\n🌍 Настройка типов среды разработки...")
    env_file = create_env_d_ts()
    
    # Этап 3: Интеграция с конфигурацией TypeScript
    print("\n⚙️ Интеграция с TypeScript конфигурацией...")
    tsconfig_updated = update_tsconfig()
    
    # Этап 4: Проверка целостности решения
    print("\n🔍 Проверка интеграции...")
    verification_passed = verify_types_integration()
    
    # Итоговый результат
    print("\n" + "=" * 60)
    if verification_passed and tsconfig_updated:
        print("✅ Исправление TypeScript ошибок завершено успешно!")
        print("\n📋 Что было сделано:")
        print("  • Созданы объявления глобальных типов")
        print("  • Настроены типы среды разработки")
        print("  • Обновлена конфигурация TypeScript")
        print("  • Проверена интеграция системы")
        print("\n🎯 Результат: TypeScript ошибки должны быть устранены")
        print("💡 Рекомендация: Перезапустите TypeScript Language Server в редакторе")
    else:
        print("❌ Обнаружены проблемы при исправлении")
        print("🔧 Проверьте логи выше для диагностики")
    
    print("\n🔄 Для применения изменений:")
    print("  1. Перезапустите TypeScript Language Server")
    print("  2. Перезагрузите окно редактора если нужно")
    print("  3. Проверьте что ошибки исчезли")

if __name__ == "__main__":
    main()
