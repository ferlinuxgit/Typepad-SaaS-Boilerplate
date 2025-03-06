// Enumeración de fuentes de mensajes
export type MessageSource = 'whatsapp' | 'instagram' | 'telegram' | 'email' | 'facebook';

// Definición de un archivo adjunto
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number | string;
  url: string;
  originalFile?: File;
}

// Definición de un destinatario (para correos)
export interface Recipient {
  type: 'to' | 'cc' | 'bcc';
  name: string;
  email: string;
}

// Definición de una etiqueta
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Definición de un mensaje
export interface Message {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  source: MessageSource;
  subject?: string;
  recipients?: Recipient[];
  attachments: Attachment[]; // Siempre es un array, puede estar vacío
}

// Definición de una conversación
export interface Conversation {
  id: string;
  contact: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  source: MessageSource;
  account?: string; // Cuenta específica (ej. email1@gmail.com, +34600000000)
  priority: number; // Del 1 al 10
  tags: Tag[]; // Siempre es un array, puede estar vacío
  messages: Message[]; // Siempre es un array, puede estar vacío
  
  // Campos específicos para emails
  emailSubject?: string; // Asunto del email para conversaciones de tipo email
  emailThreadId?: string; // Identificador único del hilo de email para agrupar respuestas
}

// Estructura para las conversaciones agrupadas
export interface ConversationsState {
  unread: Conversation[];
  read: Conversation[];
}

// Modos de visualización de conversaciones
export type ViewMode = 'all' | 'unread' | 'read';

// Definimos un tipo para nuestra función de filtro segura
export type GuardedFilter = <T>(possibleArray: any, filterFn: (item: T) => boolean) => T[]; 

// Vista móvil
export type MobileView = 'list' | 'chat'; 