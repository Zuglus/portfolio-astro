import { describe, it, expect } from 'vitest';
import type { Slide, Project, PortfolioItem } from './types';

describe('Types', () => {
  describe('Slide interface', () => {
    it('должен соответствовать структуре слайда', () => {
      const mockSlide: Slide = {
        image: mockImageMetadata('/test.png'),
        task: 'Тестовая задача',
        solution: 'Тестовое решение'
      };

      expect(mockSlide).toHaveProperty('image');
      expect(mockSlide).toHaveProperty('task');
      expect(mockSlide).toHaveProperty('solution');
      expect(typeof mockSlide.task).toBe('string');
      expect(typeof mockSlide.solution).toBe('string');
    });

    it('должен работать без необязательных полей', () => {
      const minimalSlide: Slide = {
        image: mockImageMetadata('/test.png')
      };

      expect(minimalSlide).toHaveProperty('image');
      expect(minimalSlide.task).toBeUndefined();
      expect(minimalSlide.solution).toBeUndefined();
    });
  });

  describe('Project interface', () => {
    it('должен соответствовать структуре проекта', () => {
      const mockProject: Project = {
        id: 'test-project',
        title: 'Тестовый проект',
        description: 'Описание тестового проекта',
        audience: 'Тестовая аудитория',
        slides: [
          {
            image: mockImageMetadata('/slide1.png'),
            task: 'Задача 1',
            solution: 'Решение 1'
          }
        ]
      };

      expect(mockProject).toHaveProperty('id');
      expect(mockProject).toHaveProperty('title');
      expect(mockProject).toHaveProperty('description');
      expect(mockProject).toHaveProperty('audience');
      expect(mockProject).toHaveProperty('slides');
      expect(Array.isArray(mockProject.slides)).toBe(true);
      expect(mockProject.slides.length).toBeGreaterThan(0);
    });
  });

  describe('PortfolioItem interface', () => {
    it('должен соответствовать структуре элемента портфолио', () => {
      const mockPortfolioItem: PortfolioItem = {
        id: 'portfolio-item-1',
        image: mockImageMetadata('/portfolio.png'),
        alt: 'Альтернативный текст'
      };

      expect(mockPortfolioItem).toHaveProperty('id');
      expect(mockPortfolioItem).toHaveProperty('image');
      expect(mockPortfolioItem).toHaveProperty('alt');
      expect(typeof mockPortfolioItem.id).toBe('string');
      expect(typeof mockPortfolioItem.alt).toBe('string');
    });
  });
});