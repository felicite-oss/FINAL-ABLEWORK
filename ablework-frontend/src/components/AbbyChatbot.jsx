import { useState, useRef, useEffect } from 'react';
import abbyVideo from '../assets/Abby.mp4';

export default function AbbyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'abby', text: 'Hi there! I am Abby, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');

    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);

    const formattedHistory = messages
      .filter((_, index) => index !== 0) 
      .map(msg => ({
        role: msg.sender === 'abby' ? 'assistant' : 'user',
        content: msg.text
      }));

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userText, 
          chatHistory: formattedHistory 
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
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div 
          className="bg-white w-[calc(100vw-2rem)] max-w-80 sm:w-96 rounded-2xl shadow-2xl border-2 border-[var(--border-accent)] flex flex-col overflow-hidden mb-3"
          style={{ height: 'min(380px, 55vh)' }}
          role="dialog"
          aria-label="Chat with Abby AI Assistant"
        >
          {/* Header */}
          <div className="bg-[var(--border-accent)] text-white px-3 py-2 flex justify-between items-center shrink-0">
            <h2 className="font-extrabold text-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/40 flex items-center justify-center bg-[#48cae4] shrink-0 pointer-events-none shadow-md">
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
              Abby AI
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
              className="text-white hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center font-bold transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>

          {/* Chat History */}
          <div 
            className="flex-1 px-3 py-2 min-h-0 overflow-y-auto flex flex-col gap-2 bg-gray-50"
            aria-live="polite"
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area - fully visible */}
          <form 
            onSubmit={handleSend} 
            className="px-2 py-2 border-t border-gray-200 bg-white flex gap-1.5 shrink-0 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Abby something..."
              aria-label="Type your message to Abby"
              className="flex-1 min-w-0 px-2.5 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-600 outline-none text-black bg-white text-sm"
            />
            <button 
              type="submit"
              aria-label="Send message"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer text-sm whitespace-nowrap shrink-0"
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
          className="bg-[var(--border-accent)] text-white w-16 h-16 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer border-4 border-white relative p-0 pointer-events-auto bg-[#48cae4]"
          style={{ animation: 'sideToSideBounce 2s infinite ease-in-out' }}
        >
          <style>{`
            @keyframes sideToSideBounce {
              0%, 100% {
                transform: translateX(0) translateY(0);
              }
              25% {
                transform: translateX(-8px) translateY(-10px);
              }
              50% {
                transform: translateX(0) translateY(0);
              }
              75% {
                transform: translateX(8px) translateY(-10px);
              }
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