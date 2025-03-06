'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { ChatModule } from '@/features/chat/components/ChatModule';
import { initialConversations, availableTags } from '@/features/chat/data/sampleData';

/**
 * Página principal del módulo de chat
 */
export default function ChatPage() {
  const t = useTranslations('Chat');
  
  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  
  // Detectar si estamos en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <>
      <DashboardHeader heading={t('title')} text={t('description')} />
      
      <DashboardSection>
        {/* 
          Renderizar el módulo de chat solo en el cliente para evitar
          problemas de hidratación con componentes que usan localStorage,
          animaciones, etc.
        */}
        {isClient && (
          <div className="h-[calc(100vh-12rem)]">
            <ChatModule 
              availableTags={availableTags} 
              initialConversations={initialConversations}
            />
          </div>
        )}
      </DashboardSection>
    </>
  );
} 