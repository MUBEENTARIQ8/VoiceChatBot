import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LiveKitRoom } from '@livekit/react-native';
import { Track } from 'livekit-client';
import ChatInterface from './ChatInterface';
import VoiceInterface from './VoiceInterface';
import ModeToggle from './ModeToggle';
import { requestPermissions } from '../utils/permissions';
import { LiveKitService } from '../services/LiveKitService';

export type ChatMode = 'text' | 'voice';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBotApp: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [participantIdentity, setParticipantIdentity] = useState<string>('');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request necessary permissions
      await requestPermissions();

      // Add welcome message first
      addMessage('Welcome! I\'m your AI assistant. You can chat with me using text or voice.', false);

      // Try to get LiveKit token (but don't fail if it doesn't work)
      try {
        const tokenData = await LiveKitService.getToken();
        setToken(tokenData.token);
        setRoomName(tokenData.room_name);
        setParticipantIdentity(tokenData.participant_identity);
        addMessage('Voice chat is ready! Switch to voice mode to start talking.', false);
      } catch (tokenError) {
        console.warn('LiveKit token fetch failed, voice features may not work:', tokenError);
        addMessage('Text chat is ready! Voice features may be unavailable.', false);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      addMessage('Welcome! I\'m your AI assistant. Some features may be limited.', false);
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    addMessage(message, true);
    setIsLoading(true);

    try {
      // Simulate bot response - replace with actual API call
      setTimeout(() => {
        const responses = [
          'I understand your message. How can I help you further?',
          'That\'s interesting! Tell me more about that.',
          'I\'m here to assist you with any questions you have.',
          'Thanks for sharing that with me. What else would you like to know?',
          'I see what you mean. Is there anything specific I can help you with?'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, false);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', false);
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    if (newMode === 'voice') {
      addMessage('Voice mode activated. You can now speak to me!', false);
    } else {
      addMessage('Text mode activated. You can type your messages.', false);
    }
  };

  const renderContent = () => {
    if (mode === 'voice' && token) {
      return (
        <VoiceInterface
          messages={messages}
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      );
    }

    return (
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI ChatBot</Text>
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
      </View>

      {renderContent()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default ChatBotApp;