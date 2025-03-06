import { useState } from 'react';
import { Attachment } from '../types';
import { formatFileSize, getFileType } from '../lib/utils';

export function useAttachments() {
  // Archivos adjuntos pendientes que se añadirán al mensaje
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  // Referencia al input de archivos
  const fileInputRef = { current: null as HTMLInputElement | null };
  
  // Procesar la selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convertir los archivos a nuestro formato de adjuntos
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachment: Attachment = {
        id: `attachment-${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        originalFile: file
      };
      
      newAttachments.push(attachment);
    }
    
    // Añadir los nuevos adjuntos a los pendientes
    setPendingAttachments(prev => [...prev, ...newAttachments]);
    
    // Limpiar el input para permitir subir el mismo archivo varias veces
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Activar el diálogo de selección de archivos
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Limpiar todos los adjuntos pendientes
  const clearAttachments = () => {
    // Liberar URLs creadas con createObjectURL
    pendingAttachments.forEach(attachment => {
      if (attachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
    });
    setPendingAttachments([]);
  };
  
  // Eliminar un adjunto específico
  const removeAttachment = (attachmentId: string) => {
    const attachment = pendingAttachments.find(a => a.id === attachmentId);
    
    // Liberar URL si es un blob
    if (attachment && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    
    // Actualizar lista de adjuntos
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };
  
  // Obtener información visual para una vista previa de adjunto
  const getAttachmentPreview = (attachment: Attachment) => {
    const fileType = getFileType(attachment.name);
    
    let icon;
    let previewContent = null;
    
    // Determinar el icono y la vista previa según el tipo de archivo
    switch (fileType) {
      case 'image':
        icon = 'image';
        if (attachment.url) {
          previewContent = (
            <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
              <img 
                src={attachment.url} 
                alt={attachment.name} 
                className="w-full h-full object-cover"
              />
            </div>
          );
        }
        break;
        
      case 'document':
        icon = 'fileText';
        break;
        
      case 'text':
        icon = 'fileText';
        break;
        
      default:
        icon = 'file';
    }
    
    return {
      icon,
      previewContent,
      fileType,
      formattedSize: typeof attachment.size === 'number' ? formatFileSize(attachment.size) : attachment.size
    };
  };
  
  return {
    pendingAttachments,
    fileInputRef,
    handleFileSelect,
    triggerFileInput,
    clearAttachments,
    removeAttachment,
    getAttachmentPreview
  };
} 