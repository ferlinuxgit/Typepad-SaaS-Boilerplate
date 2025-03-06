'use client';

import { FC } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Paperclip, Edit } from 'lucide-react';
import { Conversation } from '../../types';
import { getSourceIcon, getPriorityColor } from '../../lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  hasAttachmentsInLastMessage: (conversation: Conversation) => boolean;
  getLastMessageAttachments?: (conversation: Conversation) => any[];
  isUnread?: boolean;
  hasDraft?: boolean;
}

/**
 * Componente que muestra un ítem individual de conversación en la lista
 * Incluye avatar, información de contacto, último mensaje, etiquetas y metadatos
 */
export const ConversationItem: FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  hasAttachmentsInLastMessage,
  getLastMessageAttachments,
  isUnread = false,
  hasDraft = false
}) => {
  if (!conversation) return null;
  
  // Asegurarse de que las etiquetas son un array
  const safeTags = Array.isArray(conversation.tags) ? conversation.tags : [];
  
  /**
   * Formatea la fecha según si es hoy, ayer o más antigua
   */
  const formatDate = (date: Date) => {
    try {
      if (isToday(date)) {
        // Si es hoy, mostrar solo la hora (HH:MM)
        return format(date, 'HH:mm', { locale: es });
      } else if (isYesterday(date)) {
        // Si fue ayer, mostrar "Ayer"
        return 'Ayer';
      } else {
        // Para otros días, mostrar formato DD/MM/YYYY
        return format(date, 'dd/MM/yyyy', { locale: es });
      }
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  };
  
  // Verificar si hay adjuntos en el último mensaje
  const hasAttachments = hasAttachmentsInLastMessage(conversation);

  // Estilos según si es leído o no leído
  let itemBackground = isUnread 
    ? 'bg-muted/50'
    : 'bg-background';
  
  // Estilos específicos para el item seleccionado
  if (isSelected) {
    itemBackground = 'bg-muted';
  }
  
  const textColor = isSelected
    ? 'text-foreground'
    : (isUnread ? 'text-foreground' : 'text-muted-foreground');
  
  const lastMessageColor = isSelected
    ? 'text-foreground'
    : (isUnread ? 'text-foreground' : 'text-muted-foreground');

  // Borde izquierdo para indicar no leídos o seleccionados
  let borderClass = 'border-l-4 border-l-transparent';
  
  if (isSelected) {
    borderClass = 'border-l-4 border-l-primary';
  } else if (isUnread) {
    borderClass = 'border-l-4 border-l-secondary';
  }

  const selectionClass = isSelected 
    ? 'shadow-sm border-t border-b border-primary/30' 
    : 'border-b border-border';

  return (
    <div
      className={`p-3 hover:bg-muted/70 cursor-pointer transition-colors duration-150 ${
        itemBackground
      } ${borderClass} ${selectionClass}`}
      onClick={() => onSelect(conversation)}
      data-testid="conversation-item"
    >
      <div className="flex items-start gap-3">
        {/* Avatar con z-index controlado para que no se superponga a los encabezados */}
        <div className="relative z-0">
          <img
            src={conversation.avatar || '/images/default-avatar.png'}
            alt={conversation.contact}
            className={`w-12 h-12 rounded-full object-cover border-2 ${
              isSelected 
                ? 'border-primary/50' 
                : (isUnread ? 'border-secondary/70' : 'border-muted')
            }`}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              // Si falla la carga, usamos las iniciales como fallback
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling;
              if (nextElement) {
                (nextElement as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div
            className="w-12 h-12 rounded-full text-background items-center justify-center text-sm font-semibold hidden"
            style={{
              backgroundColor: `hsl(${conversation.contact.charCodeAt(0) % 360}, 70%, 50%)`
            }}
          >
            {conversation.contact.substring(0, 2).toUpperCase()}
          </div>
          
          {/* Indicador de origen con z-index controlado */}
          <div className="absolute -bottom-1 -right-1 p-0.5 bg-background rounded-full border border-border shadow-sm z-0">
            <img 
              src={getSourceIcon(conversation.source)} 
              alt={conversation.source}
              className="w-4 h-4"
            />
          </div>
        </div>
        
        {/* Información principal */}
        <div className="flex-1 min-w-0">
          {/* Primera fila con nombre y fecha */}
          <div className="flex justify-between items-start mb-1">
            <div className={`truncate flex items-center gap-1.5 ${textColor} ${isUnread || isSelected ? 'font-bold' : 'font-normal'}`}>
              {/* Indicador de prioridad */}
              <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(conversation.priority)}`} 
                  title={`Prioridad: ${conversation.priority}/10`}></div>
              {/* Nombre del contacto */}
              <span>{conversation.contact}</span>
            </div>
            
            {/* Fecha y hora - Ubicada a la derecha de la primera línea */}
            <div className={`text-xs whitespace-nowrap ml-2 ${
              isSelected 
                ? 'text-foreground/80' 
                : (isUnread ? 'text-foreground/80' : 'text-muted-foreground')
            }`}>
              {formatDate(conversation.timestamp)}
            </div>
          </div>
          
          {/* Asunto del email */}
          {conversation.source === 'email' && conversation.emailSubject && (
            <div className={`text-sm mb-1 truncate ${
              isSelected 
                ? 'font-semibold text-foreground' 
                : (isUnread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')
            }`}>
              Asunto: {conversation.emailSubject}
            </div>
          )}
          
          {/* Cuenta específica (email o teléfono) */}
          {conversation.account && (
            <div className="text-xs text-muted-foreground mb-1 truncate">
              {conversation.account}
            </div>
          )}
          
          {/* Último mensaje con indicador de borrador */}
          <div className="flex items-center gap-1">
            <div className={`text-sm truncate flex-1 ${lastMessageColor} ${isUnread || isSelected ? 'font-medium' : 'font-normal'}`}>
              {hasDraft ? (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Edit size={14} className="inline-block" />
                  <span>Borrador</span>
                </div>
              ) : (
                conversation.lastMessage
              )}
            </div>
            
            {/* Indicadores a la derecha del mensaje */}
            <div className="flex items-center gap-1">
              {/* Indicador de adjuntos */}
              {hasAttachments && (
                <Paperclip size={14} className={
                  isSelected 
                    ? "text-foreground/80" 
                    : (isUnread ? "text-foreground/70" : "text-muted-foreground")
                } />
              )}
              
              {/* Contador de no leídos */}
              {conversation.unreadCount > 0 && (
                <div className={`${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                } text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm`}>
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
          
          {/* Etiquetas */}
          {safeTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {safeTags.map((tag) => (
                <div
                  key={tag.id}
                  style={{ backgroundColor: tag.color }}
                  className="text-white text-xs px-1.5 py-0.5 rounded-full truncate max-w-[100px] shadow-sm"
                  title={tag.name}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 