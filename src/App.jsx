// src/App.jsx

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
  const initialColors = {
    background: '#f4f1ea',
    text: '#4b3f35',
    aboutBackground: 'rgba(255, 255, 255, 0.7)',
    aboutText: '#4b3f35', // Cor para o texto da div "Sobre"
  };
  const [siteColors, setSiteColors] = useState(initialColors);

  // Reinicia o histórico do chat a cada atualização da página
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  // =======================================================
  // O "EXECUTOR" ATUALIZADO PARA ENTENDER MÚLTIPLOS COMANDOS
  // =======================================================
  const generateBotResponse = async (history) => {
    setIsTyping(true);

    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev, { role: "model", text, isError }]);
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

      // Procura por um JSON (objeto ou array) na resposta
      const jsonMatch = apiResponseText.match(/(\[.*\]|\{.*\})/s);

      if (jsonMatch) {
        try {
          const parsedJson = JSON.parse(jsonMatch[0]);
          // Garante que estamos trabalhando com um array de comandos
          const commands = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

          let colorsToUpdate = {};
          let needsReset = false;
          let hasChange = false;

          // Itera sobre todos os comandos recebidos
          for (const command of commands) {
            if (command.action === 'change_color' && command.target && command.color) {
              // Verifica se o alvo do comando é válido
              if (initialColors.hasOwnProperty(command.target)) {
                colorsToUpdate[command.target] = command.color;
                hasChange = true;
              }
            } else if (command.action === 'reset_color') {
              needsReset = true;
              break; // Se encontrar um reset, para o loop
            }
          }

          if (needsReset) {
            setSiteColors(initialColors);
            updateHistory("As cores voltaram ao original!");
          } else if (hasChange) {
            setSiteColors(prevColors => ({ ...prevColors, ...colorsToUpdate }));
            updateHistory("Pronto! As cores foram alteradas.");
          } else {
            // Se o JSON não for um comando conhecido, mostra o texto
            updateHistory(apiResponseText);
          }
        } catch (e) {
          // Se o JSON for inválido, mostra o texto original
          updateHistory(apiResponseText);
        }
      } else {
        // Se não for um JSON, é uma resposta normal
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
        '--about-background-color': siteColors.aboutBackground,
        '--about-text-color': siteColors.aboutText, // Passa a nova cor de texto para o CSS
      }}
    >
      <div className="top-bar">
        <img src={logo} alt="Logo da Cafeteria" className="logo-image" />
      </div>
      <div className="about-section">
        <p>
          Olá! Eu sou o assistente virtual da Aroma Beans Coffee. ☕
        </p>
        <p>
          Fui criado para tornar sua experiência mais interativa. Comigo, você pode tirar dúvidas sobre a cafeteria ou personalizar a aparência do site.
        </p>
        <p>
          <strong>Minhas funções:</strong>
          <br />
          - Responder perguntas sobre nosso cardápio, preços e horários.
          <br />
          - Alterar as cores do site! Tente me pedir algo como:
          <br />
          <em>"Mude o fundo para preto e o texto para branco"</em>
          <br />
          <em>"Altere a cor do texto do 'sobre' para azul"</em>
          <br />
          - Você também pode pedir para <em>"Voltar às cores originais"</em>.
        </p>
        <p>
          Abra o chat no canto inferior direito para começar!
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