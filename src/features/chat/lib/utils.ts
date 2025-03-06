import { MessageSource, Conversation, Message, Attachment } from '../types';
import { FILE_TYPES } from '../constants';
import { Paperclip, Image, FileText, File } from 'lucide-react';

/**
 * Obtiene el icono correspondiente a la fuente del mensaje
 */
export const getSourceIcon = (source: MessageSource) => {
  switch (source) {
    case 'whatsapp':
      return '/images/logos/whatsapp.svg';
    case 'instagram':
      return '/images/logos/instagram.svg';
    case 'facebook':
      return '/images/logos/facebook.svg';
    case 'telegram':
      return '/images/logos/telegram.svg';
    case 'email':
      return '/images/logos/email.svg';
    default:
      return '/images/logos/message.svg';
  }
};

/**
 * Obtiene el color correspondiente a la prioridad
 */
export const getPriorityColor = (priority: number) => {
  if (priority >= 9) return 'bg-red-500';
  if (priority >= 7) return 'bg-orange-500';
  if (priority >= 4) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * Detecta si un mensaje tiene archivos adjuntos
 */
export const hasAttachments = (message: Message): boolean => {
  return message.attachments && message.attachments.length > 0;
};

/**
 * Formatea el tamaño de un archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene el tipo de archivo basado en su extensión
 */
export const getFileType = (fileName: string): 'image' | 'document' | 'text' | 'other' => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (FILE_TYPES.image.includes(extension)) return 'image';
  if (FILE_TYPES.document.includes(extension)) return 'document';
  if (FILE_TYPES.text.includes(extension)) return 'text';
  
  return 'other';
};

/**
 * Filtra arrays de manera segura, evitando errores si no es un array
 */
export const safeFilter = <T>(possibleArray: any, filterFn: (item: T) => boolean): T[] => {
  if (!possibleArray || !Array.isArray(possibleArray)) return [];
  return possibleArray.filter(filterFn);
};

/**
 * Genera una clave de caché única para traducciones
 */
export const getTranslationCacheKey = (text: string, targetLanguage: string): string => {
  return `${text.substring(0, 50)}_${targetLanguage}`;
}; 