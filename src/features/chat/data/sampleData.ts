import { Tag, Conversation, ConversationsState } from '../types';

// Etiquetas disponibles
export const availableTags: Tag[] = [
  { id: 'tag1', name: 'Importante', color: '#ef4444' },
  { id: 'tag2', name: 'Urgente', color: '#f97316' },
  { id: 'tag3', name: 'Seguimiento', color: '#3b82f6' },
  { id: 'tag4', name: 'Cliente VIP', color: '#8b5cf6' },
  { id: 'tag5', name: 'Soporte', color: '#10b981' },
  { id: 'tag6', name: 'Ventas', color: '#f59e0b' },
  { id: 'tag7', name: 'Consulta', color: '#6366f1' },
  { id: 'tag8', name: 'Facturación', color: '#0ea5e9' }
];

// Función auxiliar para crear fechas relativas
const getRelativeDate = (days: number, hours: number = 0, minutes: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return date;
};

// Conversaciones de ejemplo
export const initialConversations: ConversationsState = {
  unread: [
    {
      id: 'conv1',
      contact: 'María Rodríguez',
      avatar: 'https://i.pravatar.cc/300?img=29',
      lastMessage: 'Hola, tengo una duda sobre el servicio premium',
      timestamp: getRelativeDate(0, 1, 30),
      unreadCount: 3,
      source: 'whatsapp',
      account: '+34600123456',
      priority: 8,
      tags: [availableTags[0], availableTags[3]],
      messages: [
        {
          id: 'msg1-1',
          sender: 'María Rodríguez',
          avatar: 'https://i.pravatar.cc/300?img=29',
          content: 'Hola, buenos días. Quería consultar sobre el servicio premium.',
          timestamp: getRelativeDate(0, 2, 10),
          read: false,
          source: 'whatsapp',
          attachments: []
        },
        {
          id: 'msg1-2',
          sender: 'María Rodríguez',
          avatar: 'https://i.pravatar.cc/300?img=29',
          content: '¿Cuáles son las ventajas respecto al servicio básico?',
          timestamp: getRelativeDate(0, 1, 45),
          read: false,
          source: 'whatsapp',
          attachments: []
        },
        {
          id: 'msg1-3',
          sender: 'María Rodríguez',
          avatar: 'https://i.pravatar.cc/300?img=29',
          content: 'Me interesa especialmente la característica de soporte 24/7',
          timestamp: getRelativeDate(0, 1, 30),
          read: false,
          source: 'whatsapp',
          attachments: []
        }
      ]
    },
    {
      id: 'conv2',
      contact: 'Carlos Sánchez',
      avatar: 'https://i.pravatar.cc/300?img=12',
      lastMessage: 'Adjunto el comprobante de pago de la factura',
      timestamp: getRelativeDate(0, 3, 15),
      unreadCount: 1,
      source: 'email',
      account: 'carlos.sanchez@example.com',
      priority: 5,
      tags: [availableTags[7]],
      emailSubject: 'Pago de factura #F-2023-0589',
      emailThreadId: 'thread-2023-05',
      messages: [
        {
          id: 'msg2-1',
          sender: 'Carlos Sánchez',
          avatar: 'https://i.pravatar.cc/300?img=12',
          content: 'Buenas tardes,\n\nAdjunto el comprobante de pago de la factura #F-2023-0589.\n\nSaludos cordiales,\nCarlos Sánchez',
          timestamp: getRelativeDate(0, 3, 15),
          read: false,
          source: 'email',
          subject: 'Pago de factura #F-2023-0589',
          recipients: [
            { type: 'to', name: 'Soporte', email: 'soporte@empresa.com' },
            { type: 'cc', name: 'Administración', email: 'admin@empresa.com' }
          ],
          attachments: [
            {
              id: 'attach1',
              name: 'comprobante-pago.pdf',
              type: 'application/pdf',
              size: 1250000,
              url: '/mock-files/comprobante-pago.pdf'
            }
          ]
        }
      ]
    },
    {
      id: 'conv3',
      contact: 'Ana Martínez',
      lastMessage: 'Necesito ayuda con mi cuenta, no puedo acceder',
      timestamp: getRelativeDate(0, 5, 20),
      unreadCount: 2,
      source: 'telegram',
      account: '@anamartinez',
      priority: 9,
      tags: [availableTags[1], availableTags[4]],
      messages: [
        {
          id: 'msg3-1',
          sender: 'Ana Martínez',
          content: 'Hola, estoy intentando acceder a mi cuenta pero me dice que la contraseña es incorrecta',
          timestamp: getRelativeDate(0, 5, 50),
          read: false,
          source: 'telegram',
          attachments: []
        },
        {
          id: 'msg3-2',
          sender: 'Ana Martínez',
          content: 'Ya he intentado recuperar la contraseña pero no recibo ningún email',
          timestamp: getRelativeDate(0, 5, 20),
          read: false,
          source: 'telegram',
          attachments: []
        }
      ]
    }
  ],
  read: [
    {
      id: 'conv4',
      contact: 'Pedro López',
      avatar: 'https://i.pravatar.cc/300?img=5',
      lastMessage: 'Gracias por la información, lo revisaré',
      timestamp: getRelativeDate(1, 2, 30),
      unreadCount: 0,
      source: 'whatsapp',
      account: '+34611987654',
      priority: 3,
      tags: [availableTags[6]],
      messages: [
        {
          id: 'msg4-1',
          sender: 'Pedro López',
          avatar: 'https://i.pravatar.cc/300?img=5',
          content: 'Buenos días, estoy interesado en vuestros servicios',
          timestamp: getRelativeDate(1, 4, 30),
          read: true,
          source: 'whatsapp',
          attachments: []
        },
        {
          id: 'msg4-2',
          sender: 'Soporte',
          content: 'Hola Pedro, encantados de atenderte. Te adjunto nuestro catálogo de servicios con todos los detalles.',
          timestamp: getRelativeDate(1, 3, 45),
          read: true,
          source: 'dashboard',
          attachments: [
            {
              id: 'attach2',
              name: 'catalogo-servicios.pdf',
              type: 'application/pdf',
              size: 3500000,
              url: '/mock-files/catalogo-servicios.pdf'
            }
          ]
        },
        {
          id: 'msg4-3',
          sender: 'Pedro López',
          avatar: 'https://i.pravatar.cc/300?img=5',
          content: 'Gracias por la información, lo revisaré',
          timestamp: getRelativeDate(1, 2, 30),
          read: true,
          source: 'whatsapp',
          attachments: []
        }
      ]
    },
    {
      id: 'conv5',
      contact: 'Laura Fernández',
      avatar: 'https://i.pravatar.cc/300?img=21',
      lastMessage: 'He subido las fotos del producto en el enlace compartido',
      timestamp: getRelativeDate(2, 8, 15),
      unreadCount: 0,
      source: 'email',
      account: 'laura.fernandez@example.com',
      priority: 4,
      tags: [availableTags[5]],
      emailSubject: 'Fotos del nuevo producto',
      emailThreadId: 'thread-2023-06',
      messages: [
        {
          id: 'msg5-1',
          sender: 'Laura Fernández',
          avatar: 'https://i.pravatar.cc/300?img=21',
          content: 'Hola equipo,\n\nHe subido las fotos del nuevo producto en el enlace compartido. Son 10 imágenes en alta resolución, listas para usar en la web.\n\nSaludos,\nLaura',
          timestamp: getRelativeDate(2, 8, 15),
          read: true,
          source: 'email',
          subject: 'Fotos del nuevo producto',
          recipients: [
            { type: 'to', name: 'Marketing', email: 'marketing@empresa.com' },
            { type: 'cc', name: 'Diseño', email: 'diseno@empresa.com' }
          ],
          attachments: [
            {
              id: 'attach3',
              name: 'producto1.jpg',
              type: 'image/jpeg',
              size: 2500000,
              url: 'https://via.placeholder.com/800x600'
            },
            {
              id: 'attach4',
              name: 'producto2.jpg',
              type: 'image/jpeg',
              size: 2300000,
              url: 'https://via.placeholder.com/800x600'
            }
          ]
        }
      ]
    }
  ]
}; 