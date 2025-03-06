'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ConversationList } from './conversations/ConversationList';
import { Tag, ViewMode, Conversation } from '../types';
import { useConversations } from '../hooks/useConversations';
import { useAttachments } from '../hooks/useAttachments';
import { ANIMATIONS } from '../constants';
import { ChatPanel } from './messages/ChatPanel';

interface ChatModuleProps {
  /**
   * Etiquetas disponibles para filtrar conversaciones
   */
  availableTags: Tag[];
  /**
   * Conversaciones iniciales para cargar
   */
  initialConversations?: {
    unread: Conversation[];
    read: Conversation[];
  };
}

/**
 * Componente principal del módulo de chat
 * Orquesta la lista de conversaciones y el panel de chat
 */
export const ChatModule = ({
  availableTags = [],
  initialConversations
}: ChatModuleProps) => {
  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  
  // Hook para gestionar las conversaciones
  const {
    conversations,
    selectedConversation,
    viewMode,
    setViewMode,
    selectedTags,
    mobileView,
    handleSelectConversation,
    markAsUnreadAndClose,
    handleBackToList,
    toggleTag,
    updatePriority,
    toggleTagFilter,
  } = useConversations({
    initialConversations
  });
  
  // Hook para gestionar los archivos adjuntos
  const {
    pendingAttachments,
    fileInputRef,
    handleFileSelect,
    triggerFileInput,
    clearAttachments,
    removeAttachment,
    getAttachmentPreview
  } = useAttachments();
  
  // Estado para controlar si estamos editando etiquetas
  const [editingTags, setEditingTags] = useState(false);
  
  // Efecto para detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Manejar el envío de un mensaje
  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;
    
    // En una implementación real, aquí enviaríamos el mensaje al backend
    console.log('Enviando mensaje:', content, 'a:', selectedConversation.contact);
    console.log('Adjuntos:', pendingAttachments);
    
    // Limpiar adjuntos después de enviar el mensaje
    clearAttachments();
  };
  
  // Si no estamos en el cliente, mostrar un componente de carga
  if (!isClient) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="loading-indicator">
          <div className="simple-loader"></div>
          <div className="text-muted-foreground">Cargando chat...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {/* Vista móvil: lista de conversaciones */}
          {(mobileView === 'list' || !selectedConversation) && (
            <motion.div
              key="conversation-list"
              variants={ANIMATIONS.list}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full md:w-1/3 md:block flex-shrink-0 h-full overflow-hidden"
            >
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedTags={selectedTags}
                onToggleTag={toggleTagFilter}
                availableTags={availableTags}
              />
            </motion.div>
          )}
          
          {/* Vista móvil o escritorio: panel de chat */}
          {selectedConversation && (mobileView === 'chat' || true) && (
            <motion.div
              key="chat-panel"
              variants={ANIMATIONS.chat}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full md:flex-1 h-full overflow-hidden"
            >
              <ChatPanel
                conversation={selectedConversation}
                editingTags={editingTags}
                setEditingTags={setEditingTags}
                toggleTag={toggleTag}
                updatePriority={updatePriority}
                pendingAttachments={pendingAttachments}
                onSendMessage={handleSendMessage}
                onBackToList={handleBackToList}
                markAsUnread={markAsUnreadAndClose}
                onAttachmentSelect={handleFileSelect}
                triggerFileInput={triggerFileInput}
                removeAttachment={removeAttachment}
                getAttachmentPreview={getAttachmentPreview}
                fileInputRef={fileInputRef}
                availableTags={availableTags}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Input invisible para selección de archivos */}
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        ref={(el) => { fileInputRef.current = el; }}
      />
    </div>
  );
}; 