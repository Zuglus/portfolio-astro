import Alpine from 'alpinejs';
import '../stores/loadingStore.js';
import scrollAnimations from '../utils/scrollAnimations.js';
import modalAnimations from '../utils/modalAnimations.js';
import errorHandler from '../utils/errorHandler.js';

window.Alpine = Alpine;

// Инициализируем все системы после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  scrollAnimations.adaptiveInit();
  modalAnimations.init();
  // errorHandler уже автоматически инициализируется при импорте
});

Alpine.start();