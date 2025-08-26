import { JSDOM } from 'jsdom'

/**
 * Утилита для тестирования Astro компонентов
 * Поскольку Astro компилируется в HTML, мы тестируем результат рендера
 */

export function parseAstroHTML(html: string) {
  const dom = new JSDOM(html)
  return dom.window.document
}

export function createMockImage(src: string, alt: string) {
  return `<img src="${src}" alt="${alt}" />`
}

export function createMockButton(onClick: string, content: string) {
  return `<button x-on:click="${onClick}">${content}</button>`
}

// Мок данные для тестирования
export const mockProject = {
  id: 'test-project',
  title: 'Тестовый проект',
  description: 'Описание тестового проекта',
  audience: 'Тестовая аудитория',
  slides: [
    {
      image: { src: '/test-image.png', width: 400, height: 300 },
      task: 'Тестовая задача',
      solution: 'Тестовое решение',
    },
  ],
}

export const mockPortfolioItem = {
  id: 'test-item',
  image: { src: '/test-portfolio.png', width: 400, height: 300 },
  alt: 'Тестовый элемент портфолио',
}
