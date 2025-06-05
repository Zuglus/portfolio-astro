import { describe, it, expect, beforeEach } from 'vitest';

// Мок для тестирования логики модальных окон из index.astro
describe('Modal Logic', () => {
  let mockModalState: {
    isModalOpen: boolean;
    currentProject: any;
    currentSlideIndex: number;
    openModal: (projectId: string) => void;
    closeModal: () => void;
    nextSlide: () => void;
    prevSlide: () => void;
    get currentSlide(): any;
  };

  const mockProjects = [
    {
      id: 'project1',
      title: 'Test Project 1',
      slides: [
        { image: { src: '/slide1.png' }, task: 'Task 1' },
        { image: { src: '/slide2.png' }, task: 'Task 2' },
        { image: { src: '/slide3.png' }, task: 'Task 3' }
      ]
    },
    {
      id: 'project2',
      title: 'Test Project 2',
      slides: [
        { image: { src: '/slide4.png' }, task: 'Task 4' }
      ]
    }
  ];

  beforeEach(() => {
    // Мокаем глобальную переменную
    global.window = {
      portfolioProjects: mockProjects
    } as any;

    // Воссоздаем логику из Alpine.js компонента
    mockModalState = {
      isModalOpen: false,
      currentProject: null,
      currentSlideIndex: 0,

      openModal(projectId: string) {
        if (this.isModalOpen) return;
        
        const project = global.window.portfolioProjects?.find((p: any) => p.id === projectId);
        if (project) {
          this.currentProject = project;
          this.currentSlideIndex = 0;
          this.isModalOpen = true;
          document.body.style.overflow = 'hidden';
        }
      },

      closeModal() {
        this.isModalOpen = false;
        this.currentProject = null;
        this.currentSlideIndex = 0;
        document.body.style.overflow = '';
      },

      nextSlide() {
        if (this.currentProject && this.currentProject.slides) {
          const totalSlides = this.currentProject.slides.length;
          this.currentSlideIndex = (this.currentSlideIndex + 1) % totalSlides;
        }
      },

      prevSlide() {
        if (this.currentProject && this.currentProject.slides) {
          const totalSlides = this.currentProject.slides.length;
          this.currentSlideIndex = this.currentSlideIndex === 0 
            ? totalSlides - 1 
            : this.currentSlideIndex - 1;
        }
      },

      get currentSlide() {
        return this.currentProject?.slides?.[this.currentSlideIndex] || null;
      }
    };
  });

  describe('openModal', () => {
    it('должен открыть модальное окно с правильным проектом', () => {
      mockModalState.openModal('project1');
      
      expect(mockModalState.isModalOpen).toBe(true);
      expect(mockModalState.currentProject).toEqual(mockProjects[0]);
      expect(mockModalState.currentSlideIndex).toBe(0);
    });

    it('не должен открыть модальное окно если оно уже открыто', () => {
      mockModalState.isModalOpen = true;
      mockModalState.currentProject = mockProjects[0];
      
      mockModalState.openModal('project2');
      
      expect(mockModalState.currentProject).toEqual(mockProjects[0]);
    });

    it('не должен открыть модальное окно для несуществующего проекта', () => {
      mockModalState.openModal('nonexistent');
      
      expect(mockModalState.isModalOpen).toBe(false);
      expect(mockModalState.currentProject).toBe(null);
    });
  });

  describe('closeModal', () => {
    it('должен закрыть модальное окно и сбросить состояние', () => {
      mockModalState.isModalOpen = true;
      mockModalState.currentProject = mockProjects[0];
      mockModalState.currentSlideIndex = 2;
      
      mockModalState.closeModal();
      
      expect(mockModalState.isModalOpen).toBe(false);
      expect(mockModalState.currentProject).toBe(null);
      expect(mockModalState.currentSlideIndex).toBe(0);
    });
  });

  describe('nextSlide', () => {
    beforeEach(() => {
      mockModalState.openModal('project1');
    });

    it('должен переключиться на следующий слайд', () => {
      mockModalState.nextSlide();
      expect(mockModalState.currentSlideIndex).toBe(1);
      
      mockModalState.nextSlide();
      expect(mockModalState.currentSlideIndex).toBe(2);
    });

    it('должен вернуться к первому слайду после последнего', () => {
      mockModalState.currentSlideIndex = 2;
      mockModalState.nextSlide();
      expect(mockModalState.currentSlideIndex).toBe(0);
    });
  });

  describe('prevSlide', () => {
    beforeEach(() => {
      mockModalState.openModal('project1');
    });

    it('должен переключиться на предыдущий слайд', () => {
      mockModalState.currentSlideIndex = 2;
      mockModalState.prevSlide();
      expect(mockModalState.currentSlideIndex).toBe(1);
      
      mockModalState.prevSlide();
      expect(mockModalState.currentSlideIndex).toBe(0);
    });

    it('должен перейти к последнему слайду с первого', () => {
      mockModalState.currentSlideIndex = 0;
      mockModalState.prevSlide();
      expect(mockModalState.currentSlideIndex).toBe(2);
    });
  });

  describe('currentSlide', () => {
    it('должен вернуть текущий слайд', () => {
      mockModalState.openModal('project1');
      mockModalState.currentSlideIndex = 1;
      
      const currentSlide = mockModalState.currentSlide;
      expect(currentSlide).toEqual(mockProjects[0].slides[1]);
    });

    it('должен вернуть null если проект не выбран', () => {
      const currentSlide = mockModalState.currentSlide;
      expect(currentSlide).toBe(null);
    });
  });
});