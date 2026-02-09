"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, X, MessageCircle, Heart, AlertCircle } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm HealthPulse AI, your personal health advisor. I'm here to answer your health questions, provide wellness tips, and help you understand symptoms. What health concerns or questions do you have today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    { text: "What causes common cold?", icon: "🤧" },
    { text: "How to prevent flu?", icon: "💪" },
    { text: "What are signs of good health?", icon: "✅" },
    { text: "How to manage stress?", icon: "🧘" },
    { text: "Tips for better sleep quality", icon: "😴" },
    { text: "What are COVID-19 symptoms?", icon: "🦠" },
  ];

  const handleSendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/chat", {
        message,
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.reply, // ✅ FIXED
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-125 hover:shadow-3xl active:scale-95"
          title="Open HealthPulse AI Health Assistant"
        >
          <Heart className="w-6 h-6 fill-current animate-pulse" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[650px] max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 flex-shrink-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white px-6 py-5 flex justify-between items-center flex-shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2.5 backdrop-blur-sm">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="font-bold text-lg">HealthPulse AI</h2>
                <p className="text-xs text-emerald-100">
                  Health & Wellness Advisor
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex gap-3 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900">
              <strong>Medical Disclaimer:</strong> This AI provides general
              health information only. For serious symptoms, fever, or
              emergencies, please consult a healthcare professional.
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-emerald-50 via-white to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
              >
                {msg.sender === "bot" ? (
                  <div className="text-sm leading-relaxed break-words prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-in fade-in items-end gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  AI
                </div>
                <div className="bg-gray-100 text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions - Only show if message count is low */}
          {messages.length <= 2 && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 max-h-48 overflow-y-auto flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                💡 Common Health Questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.text)}
                    className="text-left text-xs font-medium text-gray-700 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 p-2.5 rounded-xl transition-all duration-200 transform hover:translate-x-0.5 hover:shadow-sm line-clamp-2"
                  >
                    <span className="text-sm mr-1">{q.icon}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !loading && handleSendMessage()
                }
                placeholder="Ask your health question..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-gray-50"
                disabled={loading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              💬 Ask me about symptoms, prevention, wellness, or any health
              concern
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
