/**
 * Глобальные объявления типов для портфолио
 */

// Данные портфолио
interface PortfolioProject {
  id: string
  title: string
  description: string
  audience: string
  slides: Array<{
    image: {
      src: string
      width?: number
      height?: number
    }
    task?: string
    solution?: string
  }>
}

// Расширение глобального объекта Window
declare global {
  interface Window {
    // Данные портфолио
    portfolioProjects: PortfolioProject[]
  }
}

// Экспорт для использования в модулях
export {}
