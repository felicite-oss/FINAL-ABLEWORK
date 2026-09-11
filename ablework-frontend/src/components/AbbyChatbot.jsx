import { useState, useRef, useEffect } from 'react';
import abbyVideo from '../assets/Abby.mp4';

export default function AbbyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'abby', text: 'Hi there! I am Abby, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); // <-- 1. Loading state added here
  const chatEndRef = useRef(null);

  // Auto-scroll to the newest message (includes isTyping so it scrolls when thinking bubble appears)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return; // Prevent sending while already loading

    const userText = input;
    setInput('');

    // Add user's message to the UI instantly
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setIsTyping(true); // <-- 2. Turn on loading indicator before fetch starts

    // 1. Format history for Gemini
    const formattedHistory = messages
      .filter((_, index) => index !== 0) 
      .map(msg => ({
        sender: msg.sender === 'abby' ? 'model' : 'user',
        text: msg.text
      }));

    // 2. Grab the current user's ID and Role from local storage
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
        // 3. Send the message, history, AND the user credentials to the backend
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
      setIsTyping(false); // <-- 3. Turn off loading indicator when complete
    }
  };

  // Helper function to format AI Markdown (Bolding and Line Breaks)
  const formatText = (text) => {
    return text.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-1.5 last:mb-0">
        {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex} className="font-bold text-black">{part.slice(2, -2)}</strong>;
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
          className="bg-white w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{ height: 'min(500px, 70vh)' }}
          role="dialog"
          aria-label="Chat with Abby AI Assistant"
        >
          {/* Header */}
          <div className="bg-[#48cae4] text-white px-4 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
            <h2 className="font-extrabold text-[15px] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 flex items-center justify-center bg-white shrink-0 pointer-events-none shadow-md">
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
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors cursor-pointer text-lg"
            >
              ✕
            </button>
          </div>

          {/* Chat History */}
          <div 
            className="flex-1 p-4 min-h-0 overflow-y-auto flex flex-col gap-4 bg-gray-50/50"
            aria-live="polite"
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[88%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-2xl rounded-br-sm' 
                    : 'bg-white border border-gray-200 text-gray-700 self-start rounded-2xl rounded-bl-sm'
                }`}
              >
                {/* Check if it's the bot, if so, apply the formatting function */}
                {msg.sender === 'abby' ? formatText(msg.text) : msg.text}
              </div>
            ))}

            {/* --- 4. GEMINI-STYLE THINKING / TYPING INDICATOR --- */}
            {isTyping && (
              <div className="bg-white border border-gray-200 text-gray-500 self-start px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 animate-pulse">
                <span className="text-xs font-semibold text-gray-400 mr-1">Abby is thinking</span>
                <div className="w-1.5 h-1.5 bg-[#48cae4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-[#48cae4] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[#48cae4] rounded-full animate-bounce"></div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend} 
            className="p-3 border-t border-gray-100 bg-white flex gap-2 shrink-0 items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping} // Disable input while processing
              placeholder={isTyping ? "Abby is generating response..." : "Ask Abby something..."}
              aria-label="Type your message to Abby"
              className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-gray-800 bg-gray-50 text-sm transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isTyping} // Disable button while loading or empty
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer text-sm whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat with Abby AI Assistant"
          className="bg-[#48cae4] text-white w-16 h-16 rounded-full shadow-[0_8px_16px_rgba(72,202,228,0.4)] hover:shadow-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer border-[3px] border-white relative p-0 pointer-events-auto"
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
          />
        </button>
      )}
    </div>
  );
}