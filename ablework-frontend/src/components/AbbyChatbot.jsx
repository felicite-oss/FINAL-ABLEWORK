import { useState, useRef, useEffect } from 'react';

export default function AbbyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'abby', text: 'Hi there! I am Abby, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // Clear input instantly for better UX

    // 1. Add user's message to the UI instantly
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);

    // 2. Format history for OpenAI (OpenAI expects 'user' or 'assistant' roles)
    const formattedHistory = messages
      // Skip Abby's initial greeting so we don't send it to OpenAI every time
      .filter((_, index) => index !== 0) 
      .map(msg => ({
        role: msg.sender === 'abby' ? 'assistant' : 'user',
        content: msg.text
      }));

    try {
      // 3. Send data to your Express backend
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
        // Add Abby's real reply to the UI
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* The Chat Window */}
      {isOpen && (
        <div 
          className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border-2 border-[var(--border-accent)] mb-4 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Chat with Abby AI Assistant"
        >
          {/* Header */}
          <div className="bg-[var(--border-accent)] text-white p-4 flex justify-between items-center">
            <h2 className="font-extrabold text-lg flex items-center gap-2">
              🤖 Abby AI
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat History */}
          <div 
            className="flex-1 p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-gray-50"
            aria-live="polite" // TalkBack will read new messages as they appear
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] p-3 rounded-xl text-base ${
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

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t-2 border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Abby something..."
              aria-label="Type your message to Abby"
              className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 outline-none text-black bg-white"
            />
            <button 
              type="submit"
              aria-label="Send message"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* The Toggle Button (Floating Action Button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat with Abby AI Assistant"
          className="bg-[var(--border-accent)] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform cursor-pointer border-4 border-white"
        >
          🤖
        </button>
      )}
    </div>
  );
}