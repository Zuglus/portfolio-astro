import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projects } from '../data/projects';
import { portfolioData } from '../data/portfolio';

describe('Integration Tests', () => {
  describe('Данные портфолио и проекты', () => {
    it('каждый элемент портфолио должен иметь соответствующий проект', () => {
      portfolioData.forEach(portfolioItem => {
        const correspondingProject = projects.find(project => project.id === portfolioItem.id);
        expect(correspondingProject).toBeDefined();
        expect(correspondingProject?.id).toBe(portfolioItem.id);
      });
    });

    it('количество элементов портфолио должно соответствовать количеству проектов', () => {
      expect(portfolioData.length).toBe(projects.length);
    });

    it('все ID должны быть уникальными во всех данных', () => {
      const allIds = [
        ...portfolioData.map(item => item.id),
        ...projects.map(project => project.id)
      ];
      
      const portfolioIds = portfolioData.map(item => item.id);
      const projectIds = projects.map(project => project.id);
      
      // Проверяем уникальность в рамках каждого массива
      expect(new Set(portfolioIds).size).toBe(portfolioIds.length);
      expect(new Set(projectIds).size).toBe(projectIds.length);
      
      // Проверяем соответствие между массивами
      portfolioIds.forEach(id => {
        expect(projectIds).toContain(id);
      });
    });
  });

  describe('Структура проекта', () => {
    it('все изображения в проектах должны быть валидными', () => {
      projects.forEach(project => {
        project.slides.forEach((slide, slideIndex) => {
          expect(slide.image).toBeDefined();
          expect(slide.image).toBeTruthy();
          // В тестовой среде изображения импортируются как строки
          if (typeof slide.image === 'string') {
            expect(slide.image.length).toBeGreaterThan(0);
          } else if (typeof slide.image === 'object' && slide.image.src) {
            expect(typeof slide.image.src).toBe('string');
          }
        });
      });
    });

    it('проекты с описанием должны иметь непустую аудиторию', () => {
      projects.forEach(project => {
        if (project.description && project.description.length > 0) {
          expect(project.audience).toBeTruthy();
          expect(project.audience.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Событийная система', () => {
    let eventListeners: { [key: string]: Function[] };

    beforeEach(() => {
      eventListeners = {};
      
      // Мокаем document.addEventListener
      global.document.addEventListener = vi.fn((event: string, listener: Function) => {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(listener);
      });

      // Мокаем document.dispatchEvent
      global.document.dispatchEvent = vi.fn((event: any) => {
        const listeners = eventListeners[event.type] || [];
        listeners.forEach(listener => listener(event));
        return true;
      });

      // Мокаем CustomEvent
      global.CustomEvent = vi.fn((type: string, options: any) => ({
        type,
        detail: options?.detail
      })) as any;
    });

    it('должен корректно обрабатывать событие открытия модального окна', () => {
      const mockHandler = vi.fn();
      
      // Регистрируем обработчик
      document.addEventListener('open-modal', mockHandler);
      
      // Диспатчим событие
      const event = new CustomEvent('open-modal', { 
        detail: { projectId: 'project1' } 
      });
      document.dispatchEvent(event);
      
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'open-modal',
          detail: { projectId: 'project1' }
        })
      );
    });

    it('должен корректно обрабатывать клавиатурные события', () => {
      const mockHandler = vi.fn();
      
      document.addEventListener('keydown', mockHandler);
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      
      document.dispatchEvent(escapeEvent);
      document.dispatchEvent(rightArrowEvent);
      document.dispatchEvent(leftArrowEvent);
      
      expect(mockHandler).toHaveBeenCalledTimes(3);
    });
  });

  describe('Доступность', () => {
    it('все изображения должны иметь alt текст', () => {
      portfolioData.forEach(item => {
        expect(item.alt).toBeTruthy();
        expect(typeof item.alt).toBe('string');
        expect(item.alt.length).toBeGreaterThan(0);
      });
    });

    it('все проекты должны иметь заголовки', () => {
      projects.forEach(project => {
        expect(project.title).toBeTruthy();
        expect(typeof project.title).toBe('string');
        expect(project.title.length).toBeGreaterThan(0);
      });
    });
  });
});