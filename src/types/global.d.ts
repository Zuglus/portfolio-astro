import type { Project } from './index'
import type { ImageMetadata } from 'astro'

// Расширение глобального объекта Window
declare global {
  interface Window {
    portfolioProjects: Project[]
  }

  function mockImageMetadata(src: string, width?: number, height?: number): ImageMetadata
}

export {}
