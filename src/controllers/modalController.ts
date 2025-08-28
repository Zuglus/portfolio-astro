import { delay } from '../utils/delay';
import { OPEN_MODAL_EVENT } from '../utils/events';
import type { Project, Slide } from '../types';

/* global Alpine */

// Helper types
export type RuntimeSlide = Omit<Slide, 'image'> & {
  image?: { src?: string; width?: number; height?: number };
};
export type RuntimeProject = Omit<Project, 'slides'> & { slides: RuntimeSlide[] };

// Helper functions for body scroll lock
function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
}

export class ModalController {
  // --- State Properties from ModalStore ---
  isModalOpen = false;
  currentProject: RuntimeProject | null = null;
  currentSlideIndex = 0;
  isTransitioning = false;
  isContentVisible = true;
  isImageLoading = false;
  isInitialLoad = false;
  currentImageAspectRatio: number | null = null;
  isImageZoomed = false;

  // --- Initialization and Event Handling ---
  init() {
    // From eventSubscriptions.ts
    document.addEventListener(OPEN_MODAL_EVENT, (e: Event) => {
      const ce = e as CustomEvent<{ projectId?: string }>;
      if (ce.detail?.projectId) {
        this.openModal(ce.detail.projectId);
      }
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isModalOpen) return;

      if (e.key === 'Escape') {
        if (this.isImageZoomed) {
          this.closeZoom();
        } else {
          this.closeModal();
        }
      } else if (e.key === 'ArrowRight' && !this.isImageZoomed) {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' && !this.isImageZoomed) {
        this.prevSlide();
      }
    });

    // From modal-ui.ts (simplified)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hintElement = document.getElementById('close-hint');
    if (hintElement) {
      hintElement.textContent = isTouchDevice
        ? 'тап для закрытия'
        : 'ESC или клик для закрытия';
    }
  }

  // --- Core Methods ---
  async openModal(projectId: string) {
    if (this.isModalOpen) return;

    const projects = Alpine.store('projects') as RuntimeProject[] | undefined;
    if (!projects) return;

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      this.currentProject = project;
      this.currentSlideIndex = 0;
      this.isContentVisible = false;
      this.isInitialLoad = true;
      this.isModalOpen = true;
      lockBodyScroll();

      try {
        const firstSlide = project.slides?.[0];
        if (firstSlide?.image?.src) {
          await this.preloadImage(firstSlide.image.src);
        }
      } catch {
        // Ignore preload errors, content will still show
      } finally {
        this.isInitialLoad = false;
        this.isContentVisible = true;
      }
    }
  }

  closeModal() {
    this.isModalOpen = false;
    unlockBodyScroll();

    // Reset state after a delay to allow for animations
    setTimeout(() => {
      this.currentProject = null;
      this.currentSlideIndex = 0;
      this.isTransitioning = false;
      this.isContentVisible = true;
      this.isImageLoading = false;
      this.isInitialLoad = false;
      this.currentImageAspectRatio = null;
      this.isImageZoomed = false;
    }, 300); // Animation duration
  }

  async changeSlide(newIndex: number) {
    if (this.isTransitioning || !this.currentProject?.slides) return;
    if (newIndex < 0 || newIndex >= this.currentProject.slides.length) return;

    this.isTransitioning = true;
    this.isContentVisible = false;

    await delay(150);

    let imageLoaded = false;
    const skeletonTimeout = window.setTimeout(() => {
      if (!imageLoaded) {
        this.isImageLoading = true;
      }
    }, 150);

    try {
      const newSlide = this.currentProject.slides[newIndex];
      if (newSlide?.image?.src) {
        await this.preloadImage(newSlide.image.src);
      }
    } catch {
      // ignore preload errors
    } finally {
      imageLoaded = true;
      clearTimeout(skeletonTimeout);
      this.isImageLoading = false;
      this.currentSlideIndex = newIndex;
      this.isContentVisible = true;
      await delay(150);
      this.isTransitioning = false;
    }
  }

  nextSlide() {
    if (!this.currentProject?.slides) return;
    const totalSlides = this.currentProject.slides.length;
    const newIndex = (this.currentSlideIndex + 1) % totalSlides;
    this.changeSlide(newIndex);
  }

  prevSlide() {
    if (!this.currentProject?.slides) return;
    const totalSlides = this.currentProject.slides.length;
    const newIndex = (this.currentSlideIndex - 1 + totalSlides) % totalSlides;
    this.changeSlide(newIndex);
  }

  goToSlide(index: number) {
    if (index === this.currentSlideIndex) return;
    this.changeSlide(index);
  }

  zoomImage() {
    if (this.isTransitioning || this.isImageLoading || this.isInitialLoad) return;
    this.isImageZoomed = true;
  }

  closeZoom() {
    this.isImageZoomed = false;
  }

  // --- Utility Methods ---
  preloadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.currentImageAspectRatio = img.width / img.height;
        resolve(img);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = src;
    });
  }

  // --- Getters ---
  get currentSlide(): RuntimeSlide | null {
    return this.currentProject?.slides?.[this.currentSlideIndex] || null;
  }

  get isLandscapeImage(): boolean {
    return this.currentImageAspectRatio !== null && this.currentImageAspectRatio > 1.5;
  }
}

// The default export for Alpine.js
export default function createModalController() {
  return new ModalController();
}
