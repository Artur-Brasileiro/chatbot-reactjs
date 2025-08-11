import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";
import logo from "./img/img.png";


const App = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
	{
  	hideInChat: true,
  	role: "model",
  	text: companyInfo,
	},
  ]);

  const generateBotResponse = async (history) => {
	const updateHistory = (text, isError = false) => {
  	setChatHistory((prev) => [
    	...prev.filter((msg) => msg.text !== "Thinking..."),
    	{ role: "model", text, isError },
  	]);
	};

	history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

	const requestOptions = {
  	method: "POST",
  	headers: { "Content-Type": "application/json" },
  	body: JSON.stringify({ contents: history }),
	};

	try {
  	const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
  	const data = await response.json();
  	if (!response.ok) throw new Error(data?.error.message || "Something went wrong!");

  	const apiResponseText = data.candidates[0].content.parts[0].text
    	.replace(/\*\*(.*?)\*\*/g, "$1")
    	.trim();
  	updateHistory(apiResponseText);
	} catch (error) {
  	updateHistory(error.message, true);
	}
  };

  useEffect(() => {
	chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
	<div className="main-layout">
  	{/* Barra com logo */}
  	<div className="top-bar">
    	<img src={logo} alt="Logo da Cafeteria" className="logo-image" />
  	</div>
          {/* Texto de apresentação */}
      <div className="about-section">
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

  	{/* Botão e janela do chatbot */}
  	<div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
    	<button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
      	<span className="material-symbols-rounded">mode_comment</span>
      	<span className="material-symbols-rounded">close</span>
    	</button>

    	<div className="chatbot-popup">
      	{/* Cabeçalho do chatbot */}
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

      	{/* Corpo do chatbot */}
      	<div ref={chatBodyRef} className="chat-body">
        	<div className="message bot-message">
          	<ChatbotIcon />
          	<p className="message-text">
            	Hey there 👋 <br /> How can I help you today?
          	</p>
        	</div>
        	{chatHistory.map((chat, index) => (
          	<ChatMessage key={index} chat={chat} />
        	))}
      	</div>

      	{/* Rodapé do chatbot */}
      	<div className="chat-footer">
        	<ChatForm
          	chatHistory={chatHistory}
          	setChatHistory={setChatHistory}
          	generateBotResponse={generateBotResponse}
        	/>
      	</div>
    	</div>
  	</div>
	</div>
  );
};

export default App;
