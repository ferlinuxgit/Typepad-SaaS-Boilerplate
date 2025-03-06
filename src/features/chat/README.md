# Módulo de Chat

Este módulo proporciona una interfaz completa para gestionar conversaciones de diferentes canales de comunicación (WhatsApp, Email, Telegram, etc.) en una única interfaz unificada.

## Características

- **Interfaz unificada**: Gestiona conversaciones de múltiples canales en un solo lugar
- **Conversaciones organizadas**: Separación de conversaciones leídas y no leídas
- **Etiquetas personalizables**: Organiza las conversaciones con etiquetas de colores
- **Prioridades**: Asigna niveles de prioridad a las conversaciones
- **Traducción automática**: Traduce mensajes individuales o conversaciones completas
- **Adjuntos**: Soporte para enviar y recibir archivos adjuntos
- **Interfaz responsiva**: Adaptada a dispositivos móviles y de escritorio

## Estructura del módulo

```
src/features/chat/
├── components/                    # Componentes React del módulo
│   ├── ChatModule.tsx             # Componente principal que orquesta todo el módulo
│   ├── conversations/             # Componentes relacionados con la lista de conversaciones
│   │   ├── ConversationItem.tsx   # Item individual de una conversación 
│   │   └── ConversationList.tsx   # Lista de conversaciones con filtros
│   ├── messages/                  # Componentes relacionados con los mensajes
│   │   ├── ChatPanel.tsx          # Panel de chat con mensajes y controles
│   │   └── MessageItem.tsx        # Item individual de un mensaje
│   └── shared/                    # Componentes compartidos
├── constants.ts                   # Constantes utilizadas en el módulo
├── data/                          # Datos de ejemplo para desarrollo
│   └── sampleData.ts              # Conversaciones y etiquetas de ejemplo
├── hooks/                         # Hooks personalizados
│   ├── useAttachments.ts          # Hook para gestionar archivos adjuntos
│   └── useConversations.ts        # Hook para gestionar conversaciones
├── lib/                           # Utilitarios y funciones auxiliares
│   └── utils.ts                   # Funciones de utilidad
├── services/                      # Servicios para integración con APIs
│   └── openaiService.ts           # Servicio para traducción y detección de idioma
├── types/                         # Definiciones de tipos TypeScript
│   └── index.ts                   # Tipos para el módulo de chat
└── README.md                      # Documentación del módulo
```

## Instalación

El módulo está integrado dentro del boilerplate. No se requieren pasos adicionales de instalación.

## Configuración

Para personalizar el módulo, puedes modificar:

1. `constants.ts`: Cambia idiomas disponibles, prioridades y otras constantes
2. `types/index.ts`: Extiende los tipos para añadir campos adicionales según necesites
3. `data/sampleData.ts`: Reemplaza con datos reales de tu API

## Uso

El módulo de Chat se integra como una página dentro del boilerplate:

```tsx
// src/app/[locale]/(auth)/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { ChatModule } from '@/features/chat/components/ChatModule';
import { initialConversations, availableTags } from '@/features/chat/data/sampleData';

export default function ChatPage() {
  const t = useTranslations('Chat');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <>
      <DashboardHeader heading={t('title')} text={t('description')} />
      
      <DashboardSection>
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
```

## Integración con APIs externas

Para integrar el módulo con tus propias APIs:

1. Reemplaza las funciones en `openaiService.ts` con llamadas a tu propio servicio de traducción
2. Implementa un repositorio en `repositories/` que gestione la comunicación con tu backend
3. Añade servicios en `services/` para manejar la lógica de negocio específica

Ejemplo de integración con una API real:

```typescript
// src/features/chat/repositories/chatRepository.ts
import { Conversation, Message } from '../types';

export const chatRepository = {
  // Obtener todas las conversaciones
  getConversations: async () => {
    const response = await fetch('/api/chat/conversations');
    const data = await response.json();
    
    return {
      unread: data.unread || [],
      read: data.read || []
    };
  },
  
  // Enviar un mensaje
  sendMessage: async (conversationId: string, content: string, attachments: any[] = []) => {
    const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, attachments })
    });
    
    return response.json();
  },
  
  // Marcar conversación como leída
  markAsRead: async (conversationId: string) => {
    await fetch(`/api/chat/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
  },
  
  // Añadir más métodos según necesidades...
};
```

## Personalización

### Añadir nuevos canales de comunicación

Para añadir un nuevo canal (por ejemplo, "slack"):

1. Actualiza el tipo `MessageSource` en `types/index.ts`:
   ```typescript
   export type MessageSource = 'whatsapp' | 'instagram' | 'telegram' | 'email' | 'facebook' | 'slack';
   ```

2. Añade un icono en `lib/utils.ts`:
   ```typescript
   export const getSourceIcon = (source: MessageSource) => {
     switch (source) {
       // ... otros casos existentes
       case 'slack':
         return '/images/logos/slack.svg';
       default:
         return '/images/logos/message.svg';
     }
   };
   ```

3. Asegúrate de añadir el icono correspondiente en la carpeta `public/images/logos/`

### Traducciones

Los textos estáticos del módulo deben añadirse a las traducciones del boilerplate:

```json
{
  "Chat": {
    "title": "Centro de Mensajes",
    "description": "Gestiona todas tus conversaciones desde un solo lugar",
    "noMessages": "No hay mensajes en esta conversación",
    "translate": "Traducir",
    "showOriginal": "Mostrar original",
    "priority": "Prioridad",
    "tags": "Etiquetas",
    "markAsUnread": "Marcar como no leído",
    "typeMessage": "Escribe un mensaje..."
  }
}
``` 