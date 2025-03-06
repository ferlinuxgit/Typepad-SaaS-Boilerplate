'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, X, ChevronDown, Globe, Settings } from 'lucide-react';
import { Conversation, Tag, Attachment, Message } from '../../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageItem } from './MessageItem';
import { translateMessages } from '../../services/openaiService';
import { PRIORITIES, LANGUAGES } from '../../constants';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { getSourceIcon } from '../../lib/utils';

interface ChatPanelProps {
  conversation: Conversation;
  editingTags: boolean;
  setEditingTags: (value: boolean) => void;
  toggleTag: (tagId: string) => void;
  updatePriority: (priority: number) => void;
  pendingAttachments: Attachment[];
  onSendMessage: (content: string) => void;
  onBackToList: () => void;
  markAsUnread: (conversation: Conversation) => void;
  onAttachmentSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  removeAttachment: (id: string) => void;
  getAttachmentPreview: (attachment: Attachment) => any;
  fileInputRef: { current: HTMLInputElement | null };
  availableTags: Tag[];
}

export const ChatPanel = ({
  conversation,
  editingTags,
  setEditingTags,
  toggleTag,
  updatePriority,
  pendingAttachments,
  onSendMessage,
  onBackToList,
  markAsUnread,
  onAttachmentSelect,
  triggerFileInput,
  removeAttachment,
  getAttachmentPreview,
  fileInputRef,
  availableTags
}: ChatPanelProps) => {
  // Referencias
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Estados
  const [messageText, setMessageText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  
  // Generar clave única para caché de traducciones
  const getConvCacheKey = (conversationId: string, language: string) => {
    return `conv_${conversationId}_${language}`;
  };
  
  // Desplazarse al final de los mensajes cuando cambian
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, pendingAttachments]);
  
  // Ajustar altura del textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Ajustar la altura según el contenido
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [messageText]);
  
  // Función para desplazarse al final de los mensajes
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Manejar el envío de un mensaje
  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
      
      // Resetear la altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  // Manejar tecla Enter (enviar con Enter, nueva línea con Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Traducir toda la conversación
  const handleTranslateConversation = async (language: string) => {
    // Cerrar dropdown de idiomas
    setShowLanguageDropdown(false);
    
    if (!conversation.messages.length) return;
    
    // Clave para caché de traducciones
    const cacheKey = getConvCacheKey(conversation.id, language);
    
    // Si ya tenemos traducciones para este idioma, no es necesario volver a traducir
    if (translatedMessages[cacheKey]) {
      setSelectedLanguage(language);
      return;
    }
    
    try {
      setIsTranslating(true);
      
      // Extraer contenido de los mensajes
      const messageContents = conversation.messages.map(msg => msg.content);
      
      // Llamar al servicio de traducción
      const translatedContents = await translateMessages(messageContents, language);
      
      // Crear objeto de mensajes traducidos
      const translations: Record<string, string> = {};
      conversation.messages.forEach((msg, index) => {
        translations[msg.id] = translatedContents[index];
      });
      
      // Guardar traducciones en caché
      setTranslatedMessages(prev => ({
        ...prev,
        [cacheKey]: JSON.stringify(translations)
      }));
      
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Error al traducir conversación:', error);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Resetear traducción
  const resetTranslation = () => {
    setSelectedLanguage('');
  };
  
  // Obtener traducciones actuales (si existen)
  const getCurrentTranslations = () => {
    if (!selectedLanguage) return null;
    
    const cacheKey = getConvCacheKey(conversation.id, selectedLanguage);
    const cached = translatedMessages[cacheKey];
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing translations:', e);
      return null;
    }
  };
  
  // Averiguar si un mensaje es propio (enviado por el usuario)
  const isOwnMessage = (message: Message) => {
    // En un escenario real, esto dependería del ID del usuario actual
    // Por ahora, asumimos que los mensajes con source diferente al de la conversación son propios
    return message.source !== conversation.source;
  };
  
  // Obtener contenido traducido para un mensaje
  const getTranslatedContent = (message: Message) => {
    if (!selectedLanguage) return null;
    
    const translations = getCurrentTranslations();
    if (!translations) return null;
    
    return translations[message.id] || null;
  };
  
  // Obtener etiqueta de prioridad
  const getPriorityLabel = (priority: number) => {
    const priorityInfo = PRIORITIES.find(p => p.value === priority);
    return priorityInfo ? priorityInfo.label : 'Desconocida';
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Cabecera del chat */}
      <div className="border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBackToList}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.contact}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: `hsl(${conversation.contact.charCodeAt(0) % 360}, 70%, 50%)`
                }}
              >
                {conversation.contact.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{conversation.contact}</div>
              {conversation.account && (
                <div className="text-xs text-muted-foreground">{conversation.account}</div>
              )}
            </div>
          </div>
          
          {conversation.source && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <img
                src={getSourceIcon(conversation.source)}
                alt={conversation.source}
                className="w-3 h-3"
              />
              <span className="capitalize">{conversation.source}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Traductor */}
          <Popover open={showLanguageDropdown} onOpenChange={setShowLanguageDropdown}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                disabled={isTranslating || conversation.messages.length === 0}
              >
                <Globe className="h-4 w-4" />
                {isTranslating ? 'Traduciendo...' : selectedLanguage ? 'Traducido' : 'Traducir'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="py-1">
                {selectedLanguage && (
                  <button
                    className="w-full text-left px-4 py-1.5 text-sm hover:bg-muted transition-colors border-b"
                    onClick={resetTranslation}
                  >
                    Mostrar original
                  </button>
                )}
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className="w-full text-left px-4 py-1.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => handleTranslateConversation(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Configuración */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Configuración de la conversación</SheetTitle>
              </SheetHeader>
              
              <div className="py-4">
                {/* Sección de prioridad */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Prioridad</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {getPriorityLabel(conversation.priority)} ({conversation.priority})
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup 
                        value={conversation.priority.toString()} 
                        onValueChange={(value) => updatePriority(parseInt(value))}
                      >
                        {PRIORITIES.map((priority) => (
                          <DropdownMenuRadioItem key={priority.value} value={priority.value.toString()}>
                            {priority.label} ({priority.value})
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Sección de etiquetas */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {conversation.tags.map((tag) => (
                      <div
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                        className="text-white text-xs px-1.5 py-0.5 rounded-full"
                      >
                        {tag.name}
                      </div>
                    ))}
                    {conversation.tags.length === 0 && (
                      <span className="text-sm text-muted-foreground italic">Sin etiquetas</span>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="text-xs font-medium mb-2">Editar etiquetas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((tag) => {
                        const isSelected = conversation.tags.some(t => t.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            style={{
                              backgroundColor: isSelected ? tag.color : 'transparent',
                              borderColor: tag.color,
                              color: isSelected ? 'white' : tag.color
                            }}
                            className="text-xs px-1.5 py-0.5 rounded-full border"
                            onClick={() => toggleTag(tag.id)}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Sección de acciones */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Acciones</h3>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => markAsUnread(conversation)}
                  >
                    Marcar como no leído
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Contenido del chat */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground italic">
            No hay mensajes en esta conversación
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={{
                ...message,
                content: getTranslatedContent(message) || message.content
              }}
              isOwnMessage={isOwnMessage(message)}
            />
          ))
        )}
        
        {/* Elemento para hacer autoscroll */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Archivos adjuntos pendientes */}
      {pendingAttachments.length > 0 && (
        <div className="p-2 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium">Archivos adjuntos ({pendingAttachments.length})</div>
            <Button variant="ghost" size="sm" onClick={() => pendingAttachments.length > 0 && clearAttachments()}>
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingAttachments.map(attachment => {
              const { icon, formattedSize } = getAttachmentPreview(attachment);
              return (
                <div key={attachment.id} className="relative group">
                  <div className="bg-muted border border-border rounded p-1.5 flex items-center gap-1.5">
                    {icon === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : icon === 'fileText' ? (
                      <FileText className="h-5 w-5 text-amber-500" />
                    ) : (
                      <File className="h-5 w-5 text-blue-500" />
                    )}
                    <div className="max-w-[100px]">
                      <div className="text-xs truncate font-medium">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">{formattedSize}</div>
                    </div>
                  </div>
                  <button
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Input de mensajes */}
      <div className="p-3 border-t border-border flex">
        <div className="w-full flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={triggerFileInput}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="resize-none pr-10 min-h-[40px] max-h-[200px]"
              style={{ height: textareaHeight }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 h-6 w-6"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 