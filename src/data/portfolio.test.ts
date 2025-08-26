import { describe, it, expect } from 'vitest'
import { portfolioData } from './portfolio'
import type { PortfolioItem } from '../types'

describe('Portfolio Data', () => {
  it('должен экспортировать массив элементов портфолио', () => {
    expect(Array.isArray(portfolioData)).toBe(true)
    expect(portfolioData.length).toBe(4)
  })

  it('каждый элемент портфолио должен иметь правильную структуру', () => {
    portfolioData.forEach((item: PortfolioItem) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('image')
      expect(item).toHaveProperty('alt')

      expect(typeof item.id).toBe('string')
      expect(typeof item.alt).toBe('string')
      expect(item.image).toBeDefined()
      expect(item.image).toBeTruthy()
    })
  })

  it('все элементы портфолио должны иметь уникальные ID', () => {
    const ids = portfolioData.map((item) => item.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('должен содержать правильные проекты', () => {
    const expectedProjects = [
      { id: 'project1', alt: 'НИТИ' },
      { id: 'project2', alt: 'КОДИИМ' },
      { id: 'project3', alt: 'День физики' },
      { id: 'project4', alt: 'Дизайн презентаций' },
    ]

    expectedProjects.forEach((expected) => {
      const found = portfolioData.find((item) => item.id === expected.id)
      expect(found).toBeDefined()
      expect(found?.alt).toBe(expected.alt)
    })
  })

  it('все изображения должны иметь корректные метаданные', () => {
    portfolioData.forEach((item) => {
      expect(item.image).toBeDefined()
      expect(item.image).toBeTruthy()
      // В тестовой среде image может быть строкой пути к файлу
      if (typeof item.image === 'string') {
        expect((item.image as string).endsWith('.png')).toBe(true)
      } else if (typeof item.image === 'object' && item.image.src) {
        expect(typeof item.image.src).toBe('string')
        expect(item.image.src.endsWith('.png')).toBe(true)
      }
    })
  })
})
