'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { Tag, Conversation, ConversationsState, ViewMode } from '../../types';
import { ConversationItem } from './ConversationItem';
import { safeFilter } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Animaciones para las transiciones
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2
    }
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

interface ConversationListProps {
  conversations: ConversationsState;
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
  availableTags: Tag[];
}

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  viewMode,
  onViewModeChange,
  selectedTags,
  onToggleTag,
  availableTags
}: ConversationListProps) => {
  // Estado para el texto de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para mostrar/ocultar el selector de etiquetas
  const [showTagSelector, setShowTagSelector] = useState(false);
  
  // Aplicar filtros a las conversaciones
  const applyFilters = (convsArray: Conversation[]) => {
    let filteredConvs = convsArray;
    
    // Filtrar por texto de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredConvs = safeFilter(filteredConvs, (conv: Conversation) => {
        return (
          conv.contact.toLowerCase().includes(term) ||
          conv.lastMessage.toLowerCase().includes(term) ||
          (conv.emailSubject && conv.emailSubject.toLowerCase().includes(term)) ||
          (conv.account && conv.account.toLowerCase().includes(term))
        );
      });
    }
    
    // Filtrar por etiquetas seleccionadas
    if (selectedTags.length > 0) {
      filteredConvs = safeFilter(filteredConvs, (conv: Conversation) => {
        return conv.tags.some(tag => selectedTags.includes(tag.id));
      });
    }
    
    return filteredConvs;
  };
  
  // Función auxiliar para verificar si un mensaje tiene archivos adjuntos
  const hasAttachmentsInLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return false;
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.attachments && lastMessage.attachments.length > 0;
  };
  
  // Función auxiliar para obtener los adjuntos del último mensaje
  const getLastMessageAttachments = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return [];
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.attachments || [];
  };
  
  // Filtrar todas las conversaciones según los criterios
  const unreadFiltered = applyFilters(conversations.unread);
  const readFiltered = applyFilters(conversations.read);
  
  // Determinar qué conversaciones mostrar según el modo de vista
  const shouldShowUnread = viewMode === 'all' || viewMode === 'unread';
  const shouldShowRead = viewMode === 'all' || viewMode === 'read';
  
  // Verificar si hay conversaciones para mostrar
  const hasUnreadToShow = shouldShowUnread && unreadFiltered.length > 0;
  const hasReadToShow = shouldShowRead && readFiltered.length > 0;
  const hasConversationsToShow = hasUnreadToShow || hasReadToShow;
  
  // Renderizar selector de etiquetas
  const renderTagSelector = () => {
    return (
      <AnimatePresence>
        {showTagSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted/30 border-t border-b border-border">
              <h3 className="font-medium text-sm mb-2">Filtrar por etiquetas:</h3>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      selectedTags.includes(tag.id) 
                        ? { backgroundColor: tag.color } 
                        : { borderColor: tag.color, color: tag.color }
                    }
                    onClick={() => onToggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  return (
    <div className="flex flex-col h-full max-h-full border-r border-border">
      {/* Cabecera con búsqueda y filtros */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 py-2 h-9"
            />
            {searchTerm && (
              <button 
                className="absolute right-2.5 top-2.5"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowTagSelector(!showTagSelector)}
          >
            Etiquetas
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${showTagSelector ? 'rotate-180' : ''}`} 
            />
          </Button>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as ViewMode)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas</TabsTrigger>
            <TabsTrigger value="read">Leídas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Selector de etiquetas */}
      {renderTagSelector()}
      
      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {!hasConversationsToShow ? (
          <div className="flex items-center justify-center h-full text-muted-foreground italic">
            No hay conversaciones que coincidan con los filtros
          </div>
        ) : (
          <>
            {/* Sección de no leídos */}
            {hasUnreadToShow && (
              <div className="mb-2">
                <div className="px-3 py-1.5 bg-muted/30 font-medium text-xs uppercase tracking-wider">
                  No leídas ({unreadFiltered.length})
                </div>
                <AnimatePresence>
                  {unreadFiltered.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <ConversationItem
                        conversation={conversation}
                        isSelected={selectedConversation?.id === conversation.id}
                        onSelect={onSelectConversation}
                        hasAttachmentsInLastMessage={hasAttachmentsInLastMessage}
                        getLastMessageAttachments={getLastMessageAttachments}
                        isUnread={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Sección de leídos */}
            {hasReadToShow && (
              <div>
                <div className="px-3 py-1.5 bg-muted/30 font-medium text-xs uppercase tracking-wider">
                  Leídas ({readFiltered.length})
                </div>
                <AnimatePresence>
                  {readFiltered.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <ConversationItem
                        conversation={conversation}
                        isSelected={selectedConversation?.id === conversation.id}
                        onSelect={onSelectConversation}
                        hasAttachmentsInLastMessage={hasAttachmentsInLastMessage}
                        getLastMessageAttachments={getLastMessageAttachments}
                        isUnread={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 