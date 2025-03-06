'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Paperclip, Download, FileText, Image, File, Globe, ChevronDown } from 'lucide-react';
import { Message, Attachment } from '../../types';
import { cn } from '@/lib/utils';
import { translateText, detectLanguage } from '../../services/openaiService';
import { getTranslationCacheKey, formatFileSize, getFileType } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LANGUAGES } from '../../constants';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  // Estado para la traducción
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [translationHistory, setTranslationHistory] = useState<Record<string, string>>({});
  
  // Formatear fecha con date-fns
  const formatDate = (date: Date) => {
    try {
      return format(date, 'HH:mm | d MMM yyyy', { locale: es });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };
  
  // Obtener una clave para el caché local de traducciones
  const getLocalCacheKey = (text: string, targetLang: string) => {
    return getTranslationCacheKey(text, targetLang);
  };
  
  // Manejar la traducción de un mensaje
  const handleTranslate = async (targetLanguage: string) => {
    if (!message.content) return;
    
    // Ocultar el dropdown de idiomas
    setShowLanguageDropdown(false);
    
    // Comprobar si ya tenemos esta traducción en caché
    const cacheKey = getLocalCacheKey(message.content, targetLanguage);
    if (translationHistory[cacheKey]) {
      setTranslatedContent(translationHistory[cacheKey]);
      return;
    }
    
    try {
      setIsTranslating(true);
      const translated = await translateText(message.content, targetLanguage);
      
      // Guardar en caché local
      setTranslationHistory(prev => ({
        ...prev,
        [cacheKey]: translated
      }));
      
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Error traduciendo mensaje:', error);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Resetear la traducción y mostrar el contenido original
  const resetTranslation = () => {
    setTranslatedContent(null);
  };
  
  // Renderizar un adjunto según su tipo
  const renderAttachment = (attachment: Attachment) => {
    const fileType = getFileType(attachment.name);
    const formattedSize = typeof attachment.size === 'number' 
      ? formatFileSize(attachment.size) 
      : attachment.size.toString();
    
    // Contenido específico según el tipo de archivo
    let preview = null;
    let icon = <File className="h-6 w-6 text-blue-500" />;
    
    switch (fileType) {
      case 'image':
        preview = (
          <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden mb-2">
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="w-full h-full object-cover"
            />
          </div>
        );
        icon = <Image className="h-6 w-6 text-green-500" />;
        break;
        
      case 'document':
      case 'text':
        icon = <FileText className="h-6 w-6 text-amber-500" />;
        break;
    }
    
    return (
      <div 
        key={attachment.id} 
        className="bg-muted/40 rounded-lg p-3 mb-2 border border-border"
      >
        {preview}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            {icon}
            <div className="overflow-hidden">
              <div className="truncate text-sm font-medium">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{formattedSize}</div>
            </div>
          </div>
          <a 
            href={attachment.url} 
            download={attachment.name}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    );
  };
  
  // Determinar si hay metadatos de email para mostrar
  const hasEmailMetadata = message.subject || (message.recipients && message.recipients.length > 0);
  
  return (
    <div 
      className={cn(
        "mb-4 p-3 max-w-[85%]",
        isOwnMessage 
          ? "ml-auto bg-primary text-primary-foreground rounded-lg rounded-tr-none" 
          : "mr-auto bg-muted rounded-lg rounded-tl-none"
      )}
    >
      {/* Cabecera del mensaje */}
      <div className="flex items-center space-x-2 mb-1">
        {!isOwnMessage && (
          <Avatar className="h-6 w-6">
            <div 
              className="h-full w-full rounded-full"
              style={{
                backgroundColor: `hsl(${message.sender.charCodeAt(0) % 360}, 70%, 50%)`
              }}
            >
              {message.avatar ? (
                <img 
                  src={message.avatar} 
                  alt={message.sender} 
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-white">
                  {message.sender.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </Avatar>
        )}
        <span className={cn(
          "text-sm font-medium",
          isOwnMessage ? "text-primary-foreground" : "text-foreground"
        )}>
          {isOwnMessage ? 'Tú' : message.sender}
        </span>
        <span className={cn(
          "text-xs",
          isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {formatDate(message.timestamp)}
        </span>
      </div>
      
      {/* Metadatos de email si existen */}
      {hasEmailMetadata && (
        <div className={cn(
          "p-2 mb-2 rounded text-sm",
          isOwnMessage ? "bg-primary-foreground/10" : "bg-background"
        )}>
          {message.subject && (
            <div className="mb-1">
              <span className="font-semibold">Asunto:</span> {message.subject}
            </div>
          )}
          {message.recipients && message.recipients.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Destinatarios:</div>
              {message.recipients.map((recipient, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{recipient.type === 'to' ? 'Para' : recipient.type === 'cc' ? 'CC' : 'BCC'}:</span> {recipient.name} &lt;{recipient.email}&gt;
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Contenido del mensaje */}
      <div className={cn(
        "mb-1 whitespace-pre-wrap text-sm",
        isOwnMessage ? "text-primary-foreground" : "text-foreground"
      )}>
        {translatedContent !== null ? translatedContent : message.content}
        
        {/* Indicador de traducción */}
        {translatedContent !== null && (
          <div 
            className={cn(
              "text-xs mt-1 cursor-pointer",
              isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
            onClick={resetTranslation}
          >
            (Traducido - Haz clic para ver original)
          </div>
        )}
      </div>
      
      {/* Archivos adjuntos */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2">
          {message.attachments.map((attachment) => renderAttachment(attachment))}
        </div>
      )}
      
      {/* Opciones de traducción */}
      <div className="mt-2 flex justify-end">
        <Popover open={showLanguageDropdown} onOpenChange={setShowLanguageDropdown}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs flex items-center",
                isOwnMessage ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isTranslating}
            >
              <Globe className="h-3 w-3 mr-1" />
              {isTranslating ? 'Traduciendo...' : (translatedContent ? 'Traducido' : 'Traducir')}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className="w-full text-left px-4 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    handleTranslate(lang.code);
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}; 