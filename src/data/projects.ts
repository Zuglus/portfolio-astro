import type { Project } from '../types'

// Импорты изображений для НИТИ
import nitiSlide1 from '../assets/images/niti/niti1.png'
import nitiSlide2 from '../assets/images/niti/niti2.png'
import nitiSlide3 from '../assets/images/niti/niti3.png'
import nitiSlide4 from '../assets/images/niti/niti4.png'
import nitiSlide5 from '../assets/images/niti/niti5.png'

// Импорты изображений для КОДИИМ
import codeSlide1 from '../assets/images/code/code1.png'
import codeSlide2 from '../assets/images/code/code2.png'
import codeSlide3 from '../assets/images/code/code3.png'
import codeSlide4 from '../assets/images/code/code4.png'

// Импорты изображений для День физики
import fizicsSlide1 from '../assets/images/fizics/fizics1.png'
import fizicsSlide2 from '../assets/images/fizics/fizics2.png'
import fizicsSlide3 from '../assets/images/fizics/fizics3.png'

// Импорты изображений для Презентаций
import presentationSlide0 from '../assets/images/presentations/0.png'
import presentationSlide1 from '../assets/images/presentations/1.png'
import presentationSlide2 from '../assets/images/presentations/2.png'
import presentationSlide3 from '../assets/images/presentations/3.png'
import presentationSlide4 from '../assets/images/presentations/4.png'
import presentationSlide5 from '../assets/images/presentations/5.png'
import presentationSlide6 from '../assets/images/presentations/6.png'
import presentationSlide7 from '../assets/images/presentations/7.png'
import presentationSlide8 from '../assets/images/presentations/8.png'

export const projects: Project[] = [
  {
    id: 'project1',
    title: 'НИТИ',
    description: 'Кластер проектов по управлению современным образованием',
    audience:
      'менеджеры образования, управленцы, преимущественно женщины старше 40',
    slides: [
      {
        image: nitiSlide1,
        task: 'ребрендинг образовательного продукта, создание айдентики, гармонично сочетающей эстетику с глубоким смысловым содержанием. Основной акцент на женственность, лидерство и стремление к профессиональному росту',
        solution:
          'цветовая палитра создает ощущение серьезного подхода к вызовам современного образования. Возраст целевой аудитории определяет использование цветов с более короткой длиной волны (выбран синий, использовался и ранее, но изменены оттенки и градиенты). Новые элементы айдентики подчеркивают глубину образовательного материала',
      },
      {
        image: nitiSlide2,
        task: 'создание системы визуальной идентификации для образовательной платформы',
        solution:
          'разработка фирменного стиля с акцентом на профессионализм и доступность образования. Использование синей палитры для создания ощущения надежности и экспертности в образовательной сфере',
      },
      {
        image: nitiSlide3,
        task: 'разработка мерча для мероприятия',
        solution:
          'создание сувенирной продукции в соответствии с фирменным стилем проекта, используя основные цвета и элементы айдентики для создания единого визуального образа образовательного события',
      },
      {
        image: nitiSlide4,
        task: 'создание SMM-материалов (карточек)',
        solution:
          'разработка основных элементов фирменного стиля (сохранение общих моментов и введение разнообразия для привлечения внимания), расстановка акцентов для выделения существенной информации',
      },
      {
        image: nitiSlide5,
        task: 'создание SMM-материалов (карточек)',
        solution:
          'разработка основных элементов фирменного стиля (сохранение общих моментов и введение разнообразия для привлечения внимания), расстановка акцентов для выделения существенной информации',
      },
    ],
  },
  {
    id: 'project2',
    title: 'КОДИИМ',
    description:
      'Проект по искусственному интеллекту, обучению программированию и созданию нейронных сетей',
    audience: 'учащиеся 6-11 классов, интересующиеся программированию и ИИ',
    slides: [
      {
        image: codeSlide1,
        task: 'оформление ивента — Московского городского конкурса для школьников в области ИИ (мерча для подарков победителям и призерам)',
        solution:
          'современная подача, цветовые отличия в бейджах, палитра отражает технологичность бренда',
      },
      {
        image: codeSlide2,
        task: 'создать уникальный и запоминающийся мерч для буткемпа по ИИ',
        solution:
          'в разработке мерча реализован уникальный подход: смыслы мероприятия представлены как код в программировании',
      },
      {
        image: codeSlide3,
        task: 'редизайн SMM-материалов',
        solution:
          'разнообразие цветов, активное использование нейросетей для генерации иллюстраций и персонажей',
      },
      {
        image: codeSlide4,
        task: 'редизайн SMM-материалов',
        solution:
          'разнообразие цветов, активное использование нейросетей для генерации иллюстраций и персонажей',
      },
    ],
  },
  {
    id: 'project3',
    title: 'День физики',
    description:
      'Мероприятие состоялось 17 сентября 2023 года в день рождения Циолковского на базе вузов в 22 городах страны',
    audience:
      'старшеклассники, интересующиеся наукой, выбирают будущую профессию',
    slides: [
      {
        image: fizicsSlide1,
        task: 'разработать карточки для игры «Технообмен» в айдентике бренда, но с указанными новыми цветами. Участники получали карточки в обмен на выполнение заданий',
        solution:
          'изучить биографии российских и советских учёных. Было важно показать, что теоретические открытия не самоцель, наука призвана решать конкретные практические задачи. Так родилась идея написать тексты об открытиях на обороте и добавлять надпись «НАУКА=ТЕОРИЯ+ПРАКТИКА». Цитаты учёных были подобраны для трансляции ценностей об отношении к профессии, труду и обществу',
      },
      {
        image: fizicsSlide2,
        task: 'разработать макет открыток с российскими физиками, используя айдентику мероприятия',
        solution:
          'разработка дизайна открыток с портретами российских физиков с учетом фирменного стиля мероприятия. Макеты включают биографическую информацию и достижения ученых для образовательной ценности',
      },
      {
        image: fizicsSlide3,
        task: 'разработать карточки для игры «Технообмен» в айдентике бренда, но с указанными новыми цветами. Участники получали карточки в обмен на выполнение заданий',
        solution:
          'создание легко читаемых макетов с указанием темы, года, ранжирования и категории по цвету',
      },
    ],
  },
  {
    id: 'project4',
    title: 'Презентации',
    description: '',
    audience: '',
    slides: [
      { image: presentationSlide0 },
      { image: presentationSlide1 },
      { image: presentationSlide2 },
      { image: presentationSlide3 },
      { image: presentationSlide4 },
      { image: presentationSlide5 },
      { image: presentationSlide6 },
      { image: presentationSlide7 },
      { image: presentationSlide8 },
    ],
  },
]
