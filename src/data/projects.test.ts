import { describe, it, expect } from 'vitest'
import { projects } from './projects'
import type { Project } from '../types'

describe('Projects Data', () => {
  it('должен экспортировать массив проектов', () => {
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })

  it('каждый проект должен иметь правильную структуру', () => {
    projects.forEach((project: Project) => {
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('audience')
      expect(project).toHaveProperty('slides')

      expect(typeof project.id).toBe('string')
      expect(typeof project.title).toBe('string')
      expect(typeof project.description).toBe('string')
      expect(typeof project.audience).toBe('string')
      expect(Array.isArray(project.slides)).toBe(true)
    })
  })

  it('все проекты должны иметь уникальные ID', () => {
    const ids = projects.map((project) => project.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('каждый проект должен иметь хотя бы один слайд', () => {
    projects.forEach((project: Project) => {
      expect(project.slides.length).toBeGreaterThan(0)
    })
  })

  it('каждый слайд должен иметь изображение', () => {
    projects.forEach((project: Project) => {
      project.slides.forEach((slide) => {
        expect(slide).toHaveProperty('image')
        // В Astro ImageMetadata может быть строкой или объектом
        expect(slide.image).toBeDefined()
        expect(slide.image).toBeTruthy()
      })
    })
  })

  describe('Конкретные проекты', () => {
    it('должен содержать проект НИТИ', () => {
      const nitiProject = projects.find((p) => p.id === 'project1')
      expect(nitiProject).toBeDefined()
      expect(nitiProject?.title).toBe('НИТИ')
      expect(nitiProject?.slides.length).toBe(5)
    })

    it('должен содержать проект КОДИИМ', () => {
      const codiimProject = projects.find((p) => p.id === 'project2')
      expect(codiimProject).toBeDefined()
      expect(codiimProject?.title).toBe('КОДИИМ')
      expect(codiimProject?.slides.length).toBe(4)
    })

    it('должен содержать проект День физики', () => {
      const physicsProject = projects.find((p) => p.id === 'project3')
      expect(physicsProject).toBeDefined()
      expect(physicsProject?.title).toBe('День физики')
      expect(physicsProject?.slides.length).toBe(3)
    })

    it('должен содержать проект Презентации', () => {
      const presentationsProject = projects.find((p) => p.id === 'project4')
      expect(presentationsProject).toBeDefined()
      expect(presentationsProject?.title).toBe('Презентации')
      expect(presentationsProject?.slides.length).toBe(9)
    })
  })
})
