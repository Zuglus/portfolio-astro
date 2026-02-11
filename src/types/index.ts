import type { ImageMetadata } from 'astro'

export interface Slide {
  image: ImageMetadata
  task?: string
  solution?: string
}

export interface Project {
  id: string
  title: string
  description: string
  audience: string
  slides: Slide[]
}

export interface PortfolioItem {
  id: string
  image: ImageMetadata
  alt: string
}
