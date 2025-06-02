import type { PortfolioItem } from '../types';
import threadsImage from '../assets/images/threads.png';
import codeImage from '../assets/images/code.png';
import dayImage from '../assets/images/day.png';
import presentationImage from '../assets/images/presentation.png';

export const portfolioData: PortfolioItem[] = [
  { id: 'project1', image: threadsImage, alt: "НИТИ" },
  { id: 'project2', image: codeImage, alt: "КОДИИМ" },
  { id: 'project3', image: dayImage, alt: "День физики" },
  { id: 'project4', image: presentationImage, alt: "Дизайн презентаций" },
];