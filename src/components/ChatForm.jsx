// src/components/ChatForm.jsx

import { useRef, useState, useEffect } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, isLoading }) => {
  const inputRef = useRef();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        inputRef.current.value = spokenText;
        
        // Simula um evento de submit para reusar a lógica existente
        const form = inputRef.current.closest('form');
        if (form) {
          form.requestSubmit();
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    } else if (isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage || isLoading) return;
    
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);
    
    // Instrução traduzida e com comando de idioma
    const prompt = `Responda sempre em português do Brasil (PT-BR). Usando os detalhes fornecidos acima, responda a esta pergunta: ${userMessage}`;
    
    generateBotResponse([...chatHistory, { role: "user", text: prompt }]);
    
    inputRef.current.value = "";
  };

  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <div className="input-mic-container">
      <input 
        ref={inputRef} 
        placeholder={isListening ? "Ouvindo..." : (isLoading ? "Aguarde..." : "Message...")} 
        className="message-input" 
        required 
        disabled={isLoading || isListening} 
      />
      {recognitionRef.current && (
        <button type="button" onClick={handleMicClick} id="mic-btn" className="material-symbols-rounded">
          {isListening ? 'mic_off' : 'mic'}
        </button>
      )}
      </div>
      <button type="submit" id="send-message" className="material-symbols-rounded" disabled={isLoading}>
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;