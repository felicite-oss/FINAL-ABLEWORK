import { useState, useRef, useEffect } from 'react';
import abbyVideo from '../assets/Abby.mp4';

export default function AbbyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'abby', text: 'Hi there! I am Abby, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);


  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');

    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    const formattedHistory = messages
      .filter((_, index) => index !== 0) 
      .map(msg => ({
        sender: msg.sender === 'abby' ? 'model' : 'user',
        text: msg.text
      }));

    const storedUserStr = localStorage.getItem('user');
    let userId = null;
    let role = null;
    
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      userId = storedUser.id;
      role = storedUser.role;
    }

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userText, 
          userId: userId, 
          role: role,
          conversationHistory: formattedHistory 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { sender: 'abby', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'abby', text: 'Oops, I encountered an error connecting to my server.' }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { sender: 'abby', text: 'I am offline right now! Please make sure the backend is running.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatText = (text) => {
    return text.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-1.5 last:mb-0">
        {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex} className="font-bold text-[#03045E]">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div 
          className="bg-[#f4f4f4] w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-3xl shadow-2xl border-2 border-[#03045E]/20 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{ height: 'min(500px, 70vh)' }}
          role="dialog"
          aria-label="Chat with Abby AI Assistant"
        >
        
          <div className="bg-[#03045E] text-[#f4f4f4] px-5 py-4 flex justify-between items-center shrink-0 shadow-md z-10">
            <h2 tabIndex="0" className="font-black text-[16px] tracking-tight flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#2C7FFF] flex items-center justify-center bg-[#f4f4f4] shrink-0 pointer-events-none shadow-sm" aria-hidden="true">
                <video 
                  src={abbyVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  disablePictureInPicture
                  controlsList="nodisablepictureinpicture nofullscreen noremoteplayback"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              Abby 
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
              className="text-[#f4f4f4] hover:bg-[#2C7FFF]/30 rounded-full w-8 h-8 flex items-center justify-center font-black transition-colors cursor-pointer text-lg"
            >
              ✕
            </button>
          </div>

        
          <div 
            className="flex-1 p-4 min-h-0 overflow-y-auto flex flex-col gap-4 bg-[#f4f4f4]"
            aria-live="polite"
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                tabIndex="0" 
                className={`max-w-[88%] px-4 py-3 text-[14px] font-semibold leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#2C7FFF] text-[#f4f4f4] self-end rounded-2xl rounded-br-sm' 
                    : 'bg-white border-2 border-[#03045E]/10 text-[#03045E] self-start rounded-2xl rounded-bl-sm'
                }`}
              >
                {msg.sender === 'abby' ? formatText(msg.text) : msg.text}
              </div>
            ))}

          
            {isTyping && (
              <div tabIndex="0" className="bg-white border-2 border-[#03045E]/10 text-[#03045E] self-start px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 animate-pulse">
                <span className="text-xs font-bold text-[#03045E]/70 mr-1">Abby is thinking</span>
                <div className="w-1.5 h-1.5 bg-[#2C7FFF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-[#2C7FFF] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[#2C7FFF] rounded-full animate-bounce"></div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

       
          <form 
            onSubmit={handleSend} 
            className="p-3 border-t-2 border-[#03045E]/10 bg-white flex gap-2 shrink-0 items-center shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder={isTyping ? "Abby is generating response..." : "Ask Abby something..."}
              aria-label="Type your message to Abby"
              className="flex-1 min-w-0 px-4 py-2.5 border-2 border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:ring-1 focus:ring-[#2C7FFF] outline-none text-[#03045E] bg-[#f4f4f4] font-semibold text-sm transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isTyping}
              className="bg-[#2C7FFF] text-[#f4f4f4] px-5 py-2.5 rounded-xl font-bold hover:bg-[#03045E] transition-colors cursor-pointer text-sm whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-[#2C7FFF] hover:border-[#03045E]"
            >
              Send
            </button>
          </form>
        </div>
      )}

      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat with Abby AI Assistant"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="bg-[#2C7FFF] text-[#f4f4f4] w-16 h-16 rounded-full shadow-[0_8px_16px_rgba(44,127,255,0.4)] hover:shadow-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer border-[3px] border-[#03045E] relative p-0 pointer-events-auto"
          style={{ animation: 'sideToSideBounce 2.5s infinite ease-in-out' }}
        >
          <style>{`
            @keyframes sideToSideBounce {
              0%, 100% { transform: translateX(0) translateY(0); }
              25% { transform: translateX(-4px) translateY(-6px); }
              50% { transform: translateX(0) translateY(0); }
              75% { transform: translateX(4px) translateY(-6px); }
            }
          `}</style>
          <video 
            src={abbyVideo} 
            autoPlay 
            loop 
            muted 
            playsInline 
            disablePictureInPicture
            controlsList="nodisablepictureinpicture nofullscreen noremoteplayback"
            className="w-full h-full object-cover pointer-events-none"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}