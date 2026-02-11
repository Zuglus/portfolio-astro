import type { Project } from './index'

// Расширение глобального объекта Window
declare global {
  interface Window {
    portfolioProjects: Project[]
  }
}

export {}
