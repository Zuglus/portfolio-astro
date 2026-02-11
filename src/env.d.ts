/**
 * Объявления типов для переменных окружения и Astro
 */

/// <reference types="astro/client" />

// Дополнительные типы для Astro
declare namespace App {
  // Можно добавить дополнительные типы для приложения
}

// Типы для CSS модулей (если будут использоваться)
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// Типы для SVG файлов
declare module '*.svg' {
  const content: any
  export default content
}

// Типы для изображений
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module 'jsdom' {
  export class JSDOM {
    constructor(html: string, options?: Record<string, unknown>)
    readonly window: Window & typeof globalThis
  }
}
