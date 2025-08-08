import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import axios from 'axios';

// Match MessageProps from Message.tsx
interface MessageProps {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateUniqueId = () => Date.now().toString();

  const handleSendMessage = async (message: string) => {
    const userMessage: MessageProps = {
      id: generateUniqueId(),
      content: message,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        
        }
      );
      console.log('API Key:', process.env.REACT_APP_OPENAI_API_KEY);
      const botMessage: MessageProps = {
        id: generateUniqueId(),
        content: response.data.choices[0].message.content.trim(),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage: MessageProps = {
        id: generateUniqueId(),
        content: 'Sorry, I couldn’t get a response. Please check your API key or try again later.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatWindow messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatPage;