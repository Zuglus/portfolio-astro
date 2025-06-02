import type { PortfolioItem } from '../types';

// --- Проект 1: НИТИ ---
// Предполагается, что изображение threads.png было скопировано в extra-ephemera/src/assets/images/threads.png
import nitiMainImage from '../assets/images/threads.png'; 
// Импорты для слайдов, если они нужны для longDescription или галереи в модальном окне
// import nitiSlide1 from "../assets/images/niti/niti1.png";
// ... другие слайды НИТИ

// --- Проект 2: КОДИИМ ---
// Предполагается, что изображение code.png было скопировано в extra-ephemera/src/assets/images/code.png
import codeMainImage from '../assets/images/code.png';
// import codeEventDesign from "../assets/images/code/code1.png";
// ... другие слайды КОДИИМ

// --- Проект 3: День физики ---
// Предполагается, что изображение day.png было скопировано в extra-ephemera/src/assets/images/day.png
import fizicsMainImage from '../assets/images/day.png';
// import fizicsPostcard from "../assets/images/fizics/fizics1.png";
// ... другие слайды День Физики

// --- Проект 4: Дизайн презентаций ---
// Предполагается, что изображение presentation.png было скопировано в extra-ephemera/src/assets/images/presentation.png
import presentationMainImage from '../assets/images/presentation.png';
// import presentationSlide0 from "../assets/images/presentations/0.png";
// ... другие слайды Презентаций

const allProjectsData: PortfolioItem[] = [
  {
    id: 'project1', // Из portfolioData и projects
    title: 'НИТИ', // Из projects
    description: 'Кластер проектов по управлению современным образованием', // Из projects.description
    // Формируем longDescription из первого слайда. Вы можете изменить эту логику.
    longDescription: `<strong>Задача:</strong> ребрендинг образовательного продукта, создание айдентики, гармонично сочетающей эстетику с глубоким смысловым содержанием. Основной акцент на женственность, лидерство и стремление к профессиональному росту.<br/><strong>Решение:</strong> цветовая палитра создает ощущение серьезного подхода к вызовам современного образования. Возраст целевой аудитории определяет использование цветов с более короткой длиной волны (выбран синий, использовался и ранее, но изменены оттенки и градиенты). Новые элементы айдентики подчеркивают глубину образовательного материала.`,
    imageUrl: nitiMainImage, // Из portfolioData (адаптированный импорт)
    imageAlt: 'НИТИ', // Из portfolioData
    tags: ['Образование', 'Ребрендинг', 'Айдентика'], // Пример, добавьте свои
    // liveLink: '', // Добавьте, если есть
    // sourceLink: '', // Добавьте, если есть
  },
  {
    id: 'project2',
    title: 'КОДИИМ',
    description: 'Проект по искусственному интеллекту, обучению программированию и созданию нейронных сетей',
    longDescription: `<strong>Задача:</strong> оформление ивента — Московского городского конкурса для школьников в области ИИ (мерча для подарков победителям и призерам).<br/><strong>Решение:</strong> современная подача, цветовые отличия в бейджах, палитра отражает технологичность бренда.`,
    imageUrl: codeMainImage,
    imageAlt: 'КОДИИМ',
    tags: ['ИИ', 'Образование', 'Дизайн', 'Мероприятия'],
  },
  {
    id: 'project3',
    title: 'День физики',
    description: 'Мероприятие состоялось 17 сентября 2023 года в день рождения Циолковского на базе вузов в 22 городах страны',
    longDescription: `<strong>Задача:</strong> разработать карточки для игры «Технообмен» в айдентике бренда, но с указанными новыми цветами. Участники получали карточки в обмен на выполнение заданий.<br/><strong>Решение:</strong> изучить биографии российских и советских учёных. Было важно показать, что теоретические открытия не самоцель, наука призвана решать конкретные практические задачи. Так родилась идея написать тексты об открытиях на обороте и добавлять надпись «НАУКА=ТЕОРИЯ+ПРАКТИКА». Цитаты учёных были подобраны для трансляции ценностей об отношении к профессии, труду и обществу.`,
    imageUrl: fizicsMainImage,
    imageAlt: 'День физики',
    tags: ['Наука', 'Мероприятия', 'Дизайн', 'Образование'],
  },
  {
    id: 'project4',
    title: 'Дизайн презентаций', // Из portfolioData, title в projects был "Презентации"
    description: 'Разработка дизайна презентаций для различных целей.', // description в projects был пустым, добавил пример
    // Для презентаций longDescription может быть списком особенностей или просто более подробным описанием
    // В старых данных для project4 description и audience были пустыми, а slides содержали только изображения без task/solution.
    // Вам нужно будет решить, как представить longDescription для этого проекта.
    longDescription: 'Создание профессиональных и визуально привлекательных презентаций для конференций, отчетов и учебных материалов. Фокус на ясности, структуре и воздействии на аудиторию.',
    imageUrl: presentationMainImage,
    imageAlt: 'Дизайн презентаций',
    tags: ['Дизайн', 'Презентации', 'Визуализация данных'],
  },
];

export default allProjectsData;