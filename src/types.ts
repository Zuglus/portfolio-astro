import type { ImageMetadata } from 'astro';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string; 
  imageUrl: ImageMetadata; // Изменено для astro:assets
  // или используйте string, если будете импортировать изображения иначе:
  // imageUrl: string;
  imageAlt: string; // Хорошая практика для доступности
  tags?: string[];
  liveLink?: string;
  sourceLink?: string;
  // Добавьте другие релевантные поля
}

// Сюда же можно будет добавлять другие общие типы для вашего проекта.