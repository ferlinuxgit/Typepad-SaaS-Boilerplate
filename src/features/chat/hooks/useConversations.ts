import { useState, useRef, useEffect } from 'react';
import { Conversation, ConversationsState, ViewMode, MobileView, Tag } from '../types';

interface UseConversationsProps {
  initialConversations?: ConversationsState;
}

export function useConversations({ initialConversations = { unread: [], read: [] } }: UseConversationsProps = {}) {
  // Estado para conversaciones
  const [conversations, setConversations] = useState<ConversationsState>(initialConversations);
  
  // Estado para la conversación seleccionada
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // Referencia a la conversación anterior para manejo de estado leído/no leído
  const previousConversationRef = useRef<Conversation | null>(null);
  
  // Conversaciones marcadas manualmente como no leídas
  const [manuallyMarkedAsUnread, setManuallyMarkedAsUnread] = useState<Record<string, boolean>>({});
  
  // Control para evitar marcar como leída una conversación en ciertos escenarios
  const [skipMarkAsRead, setSkipMarkAsRead] = useState<Record<string, boolean>>({});
  
  // Modo de visualización de las conversaciones
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  
  // Etiquetas seleccionadas para filtrar
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Control de vista en dispositivos móviles
  const [mobileView, setMobileView] = useState<MobileView>('list');
  
  // Seleccionar una conversación y manejar estado de lectura
  const handleSelectConversation = (conversation: Conversation) => {
    // Guardamos referencia a la conversación anterior
    previousConversationRef.current = selectedConversation;
    
    // Actualizamos la conversación seleccionada
    setSelectedConversation(conversation);
    
    // En móviles, cambiamos a la vista de chat
    setMobileView('chat');
    
    // Si no está marcada manualmente como no leída y no hay que saltar la marca de lectura
    if (!manuallyMarkedAsUnread[conversation.id] && !skipMarkAsRead[conversation.id]) {
      // Marcamos como leída después de un tiempo
      setTimeout(() => {
        markConversationAsRead(conversation);
      }, 1000);
    }
    
    // Limpiamos el skipMarkAsRead para esta conversación si existe
    if (skipMarkAsRead[conversation.id]) {
      setSkipMarkAsRead(prev => {
        const updated = { ...prev };
        delete updated[conversation.id];
        return updated;
      });
    }
  };
  
  // Marcar una conversación como leída
  const markConversationAsRead = (conversation: Conversation) => {
    // Si la conversación está en no leídas, la movemos a leídas
    const isInUnread = conversations.unread.some(c => c.id === conversation.id);
    
    if (isInUnread) {
      // Actualizar estado de conversaciones
      setConversations(prev => {
        // Eliminar de no leídas
        const updatedUnread = prev.unread.filter(c => c.id !== conversation.id);
        
        // Actualizar unreadCount y añadir a leídas
        const updatedConversation = {
          ...conversation,
          unreadCount: 0,
          messages: conversation.messages.map(msg => ({ ...msg, read: true }))
        };
        
        // Si es la seleccionada, actualizamos esa también
        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(updatedConversation);
        }
        
        return {
          unread: updatedUnread,
          read: [updatedConversation, ...prev.read]
        };
      });
      
      // Si estaba en la lista de marcadas manualmente, la quitamos
      if (manuallyMarkedAsUnread[conversation.id]) {
        setManuallyMarkedAsUnread(prev => {
          const updated = { ...prev };
          delete updated[conversation.id];
          return updated;
        });
      }
    }
  };
  
  // Marcar una conversación como no leída
  const markConversationAsUnread = (conversation: Conversation) => {
    // Añadimos a la lista de marcadas manualmente
    setManuallyMarkedAsUnread(prev => ({
      ...prev,
      [conversation.id]: true
    }));
    
    // Si la conversación está en leídas, la movemos a no leídas
    const isInRead = conversations.read.some(c => c.id === conversation.id);
    
    if (isInRead) {
      setConversations(prev => {
        // Eliminar de leídas
        const updatedRead = prev.read.filter(c => c.id !== conversation.id);
        
        // Actualizar la conversación
        const updatedConversation = {
          ...conversation,
          unreadCount: 1, // Establecemos al menos 1 mensaje no leído
        };
        
        // Añadir a no leídas
        return {
          read: updatedRead,
          unread: [updatedConversation, ...prev.unread]
        };
      });
    }
  };
  
  // Marcar como no leída y cerrar la conversación
  const markAsUnreadAndClose = (conversation: Conversation) => {
    markConversationAsUnread(conversation);
    setSelectedConversation(null);
    
    // En móviles, volver a la lista
    setMobileView('list');
  };
  
  // Volver a la lista en móviles
  const handleBackToList = () => {
    // No marcamos como leída si acabamos de seleccionarla
    if (selectedConversation) {
      setSkipMarkAsRead(prev => ({
        ...prev,
        [selectedConversation.id]: true
      }));
    }
    
    setSelectedConversation(null);
    setMobileView('list');
  };
  
  // Alternar etiqueta de una conversación
  const toggleTag = (tagId: string) => {
    if (!selectedConversation) return;
    
    // Crear una copia de la conversación seleccionada
    const updatedConversation = { ...selectedConversation };
    
    // Verificar si la etiqueta ya está aplicada
    const tagIndex = updatedConversation.tags.findIndex(tag => tag.id === tagId);
    
    if (tagIndex !== -1) {
      // Quitar la etiqueta
      updatedConversation.tags = updatedConversation.tags.filter(tag => tag.id !== tagId);
    } else {
      // Buscar la etiqueta en las disponibles y añadirla (esto requerirá tener las etiquetas disponibles)
      // Para este ejemplo, asumimos que la etiqueta se recibe completa
      updatedConversation.tags = [...updatedConversation.tags, { id: tagId, name: 'Tag', color: '#cccccc' }];
    }
    
    // Actualizar la conversación en el estado
    updateConversationInState(updatedConversation);
  };
  
  // Actualizar prioridad de una conversación
  const updatePriority = (priority: number) => {
    if (!selectedConversation) return;
    
    const updatedConversation = {
      ...selectedConversation,
      priority
    };
    
    updateConversationInState(updatedConversation);
  };
  
  // Alternar filtro de etiquetas
  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Actualizar una conversación en el estado
  const updateConversationInState = (updatedConversation: Conversation) => {
    // Actualizar la conversación seleccionada
    setSelectedConversation(updatedConversation);
    
    // Actualizar en la lista de leídas o no leídas
    setConversations(prev => {
      // Determinar si está en leídas o no leídas
      const isInUnread = prev.unread.some(c => c.id === updatedConversation.id);
      
      if (isInUnread) {
        return {
          ...prev,
          unread: prev.unread.map(c => 
            c.id === updatedConversation.id ? updatedConversation : c
          )
        };
      } else {
        return {
          ...prev,
          read: prev.read.map(c => 
            c.id === updatedConversation.id ? updatedConversation : c
          )
        };
      }
    });
  };
  
  return {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    viewMode,
    setViewMode,
    selectedTags,
    setSelectedTags,
    mobileView,
    setMobileView,
    handleSelectConversation,
    markConversationAsRead,
    markConversationAsUnread,
    markAsUnreadAndClose,
    handleBackToList,
    toggleTag,
    updatePriority,
    toggleTagFilter,
    updateConversationInState
  };
} 