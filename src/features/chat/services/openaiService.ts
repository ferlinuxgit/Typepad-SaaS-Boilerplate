/**
 * Servicio para integración con OpenAI
 * Gestiona traducción de mensajes y detección de idiomas
 */

// Función para detectar el idioma de un texto
export async function detectLanguage(text: string): Promise<string> {
  try {
    // En un escenario real, esto sería una llamada a la API de OpenAI
    // Por ahora, implementamos una detección básica
    
    // Detección básica para español
    const spanishWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'porque', 'si', 'no', 'en', 'de', 'con', 'para', 'por'];
    const containsSpanish = spanishWords.some(word => 
      text.toLowerCase().includes(` ${word} `) || 
      text.toLowerCase().startsWith(`${word} `) || 
      text.toLowerCase().endsWith(` ${word}`)
    );
    
    // Detección básica para inglés
    const englishWords = ['the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'for', 'with', 'without', 'of', 'in', 'on', 'at', 'to', 'from', 'by'];
    const containsEnglish = englishWords.some(word => 
      text.toLowerCase().includes(` ${word} `) || 
      text.toLowerCase().startsWith(`${word} `) || 
      text.toLowerCase().endsWith(` ${word}`)
    );
    
    // Simple heurística
    if (containsSpanish && !containsEnglish) return 'es';
    if (containsEnglish && !containsSpanish) return 'en';
    
    // Detección por caracteres específicos de otros idiomas
    if (/[äöüß]/i.test(text)) return 'de';
    if (/[éèêëàâçùûïî]/i.test(text)) return 'fr';
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
    
    // Por defecto, inglés
    return 'en';
  } catch (error) {
    console.error('Error detectando idioma:', error);
    return 'en'; // Valor por defecto en caso de error
  }
}

// Función para traducir un texto
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // En un escenario real, esto sería una llamada a la API de OpenAI
    // Por ahora, simulamos una traducción básica
    
    // Para el ejemplo, simulamos traducciones básicas español-inglés
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'Hola': 'Hello',
        'Buenos días': 'Good morning',
        'Gracias': 'Thank you',
        '¿Cómo estás?': 'How are you?',
        'Adiós': 'Goodbye'
      },
      'es': {
        'Hello': 'Hola',
        'Good morning': 'Buenos días',
        'Thank you': 'Gracias',
        'How are you?': '¿Cómo estás?',
        'Goodbye': 'Adiós'
      }
    };
    
    // Verificar si tenemos una traducción directa
    if (translations[targetLanguage] && translations[targetLanguage][text]) {
      return translations[targetLanguage][text];
    }
    
    // Si no hay traducción directa, añadimos un prefijo para simular
    return `[${targetLanguage}] ${text}`;
  } catch (error) {
    console.error('Error traduciendo texto:', error);
    return text; // Devolver el texto original en caso de error
  }
}

// Función para traducir múltiples mensajes
export async function translateMessages(messages: string[], targetLanguage: string): Promise<string[]> {
  try {
    const translatedMessages = await Promise.all(
      messages.map(message => translateText(message, targetLanguage))
    );
    return translatedMessages;
  } catch (error) {
    console.error('Error traduciendo mensajes:', error);
    return messages; // Devolver los mensajes originales en caso de error
  }
} 