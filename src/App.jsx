import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";
import logo from "./img/img.png";

const App = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // =======================================================
  // NOSSO "PAINEL DE CONTROLE" DE CORES
  // =======================================================
  const [siteColors, setSiteColors] = useState({
    background: '#f4f1ea', // Cor de fundo inicial
    text: '#4b3f35',       // Cor de texto inicial
  });

  // Reinicia o histórico do chat a cada atualização da página
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  // =======================================================
  // O "EXECUTOR" ATUALIZADO PARA ENTENDER COMANDOS
  // =======================================================
    const generateBotResponse = async (history) => {
    setIsTyping(true);

    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text, isError },
      ]);
    };
    
    const cleanHistory = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: cleanHistory }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Something went wrong!");
      }
      const data = await response.json();
      
      const apiResponseText = data.candidates[0].content.parts[0].text.trim();
      
      // --- LÓGICA ATUALIZADA E MAIS INTELIGENTE ---

      // 1. Usa uma expressão regular para encontrar um objeto JSON na resposta.
      const jsonMatch = apiResponseText.match(/{.*}/s);

      if (jsonMatch) {
        // 2. Se encontrou um JSON, tenta processá-lo.
        try {
          const command = JSON.parse(jsonMatch[0]);
          if (command.action === 'change_color' && command.target && command.color) {
            // 3. Se for um comando de cor válido, EXECUTA a mudança de cor.
            setSiteColors(prevColors => ({
              ...prevColors,
              [command.target]: command.color
            }));
            
            // E envia uma mensagem de confirmação para o chat.
            updateHistory(`Pronto! A cor foi alterada. Quer tentar outra?`);
          } else {
            // É um JSON, mas não um comando que conhecemos. Apenas exibe o texto.
            updateHistory(apiResponseText);
          }
        } catch (e) {
          // Parecia um JSON, mas deu erro. Exibe o texto original.
          updateHistory(apiResponseText);
        }
      } else {
        // 4. Se não encontrou JSON, é uma resposta de texto normal.
        updateHistory(apiResponseText.replace(/\*\*(.*?)\*\*/g, "$1"));
      }

    } catch (error) {
      updateHistory(error.message, true);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory, isTyping]);
  
  // =======================================================
  // APLICANDO AS CORES NO SITE DINAMICAMENTE
  // =======================================================
  return (
    <div 
      className="main-layout" 
      style={{
        '--background-color': siteColors.background,
        '--text-color': siteColors.text,
      }}
    >
      <div className="top-bar">
        <img src={logo} alt="Logo da Cafeteria" className="logo-image" />
      </div>
      <div className="about-section">
        {/* Mantive o texto original que você tinha */}
        <p>
        Welcome to Aroma Beans Coffee! ☕  
        Here, every cup is prepared with carefully selected beans and a true love for coffee.  
        Our mission is to offer you a unique experience, filled with aromas and flavors that awaken the senses.  
        Step inside and feel the warm embrace of freshly brewed coffee, crafted with care from bean to cup.

        We take pride in working with trusted farmers who grow their coffee in the finest regions,  
        harvesting each bean at its peak for maximum flavor and freshness.  
        Every batch is roasted to perfection, bringing out its natural sweetness, depth, and aroma.  
        From a smooth latte to a strong espresso, each sip tells a story — a story of passion, quality, and tradition.
        </p>
      </div>

      <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
        <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
          <span className="material-symbols-rounded">mode_comment</span>
          <span className="material-symbols-rounded">close</span>
        </button>

        <div className="chatbot-popup">
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h2 className="logo-text">Chatbot</h2>
            </div>
            <button
              onClick={() => setShowChatbot((prev) => !prev)}
              className="material-symbols-rounded"
            >
              keyboard_arrow_down
            </button>
          </div>

          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">Olá! 👋 <br /> Como posso te ajudar hoje?</p>
            </div>
            {chatHistory.map((chat, index) => (
              !chat.hideInChat && <ChatMessage key={index} chat={chat} />
            ))}
            {isTyping && (
                <div className="message bot-message">
                    <ChatbotIcon />
                    <p className="message-text">Digitando...</p>
                </div>
            )}
          </div>

          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
              isLoading={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;