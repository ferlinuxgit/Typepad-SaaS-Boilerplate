/**
 * Constantes utilizadas en el módulo de chat
 */

// Variantes para animaciones
export const ANIMATIONS = {
  list: {
    enter: { x: "-100%", opacity: 0.5 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0.5 }
  },
  chat: {
    enter: { x: "100%", opacity: 0.5 },
    center: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0.5 }
  }
};

// Prioridades para conversaciones
export const PRIORITIES = [
  { value: 1, label: 'Baja' },
  { value: 2, label: 'Baja' },
  { value: 3, label: 'Baja' },
  { value: 4, label: 'Media' },
  { value: 5, label: 'Media' },
  { value: 6, label: 'Media' },
  { value: 7, label: 'Alta' },
  { value: 8, label: 'Alta' },
  { value: 9, label: 'Urgente' },
  { value: 10, label: 'Urgente' }
];

// Idiomas disponibles para traducción
export const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Portugués' },
  { code: 'ru', name: 'Ruso' },
  { code: 'zh', name: 'Chino' },
  { code: 'ja', name: 'Japonés' },
  { code: 'ko', name: 'Coreano' }
];

// Tipos de archivos y sus iconos
export const FILE_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  text: ['txt', 'md', 'rtf']
}; 