import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  ActivityIndicator,
} from 'react-native';
// import {
//   useLocalParticipant,
//   useParticipants,
//   AudioSession,
//   useTracks,
// } from '@livekit/react-native';
// import { Track } from 'livekit-client';
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Props {
  messages: Message[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const VoiceInterface: React.FC<Props> = ({
  messages,
  isConnected,
  onSendMessage,
  isLoading,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  // const { localParticipant } = useLocalParticipant();
  // const participants = useParticipants();
  // const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false });

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopAnimations();
    }
  }, [isRecording]);

  useEffect(() => {
    // AudioSession.configureAudio({
    //   android: {
    //     audioTypeOptions: {
    //       manageAudioFocus: true,
    //     },
    //   },
    //   ios: {
    //     defaultOutput: 'speaker',
    //   },
    // });
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnimation.stopAnimation();
    waveAnimation.stopAnimation();
    pulseAnimation.setValue(1);
    waveAnimation.setValue(0);
  };

  const handleVoicePress = async () => {
    try {
      if (!isRecording) {
        // Start recording simulation
        setIsRecording(true);

        // Simulate voice recognition - replace with actual implementation
        setTimeout(() => {
          setIsRecording(false);
          onSendMessage('This is a voice message transcription');
        }, 3000);
      } else {
        // Stop recording
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Voice recording error:', error);
      setIsRecording(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <View style={styles.messageHeader}>
        <Icon
          name={item.isUser ? 'person' : 'smart-toy'}
          size={20}
          color={item.isUser ? '#007bff' : '#28a745'}
        />
        <Text style={styles.senderText}>
          {item.isUser ? 'You' : 'AI Assistant'}
        </Text>
        <Text style={styles.timeText}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      <Text style={styles.messageText}>
        {item.text}
      </Text>
    </View>
  );

  const renderConnectionStatus = () => (
    <View style={styles.statusContainer}>
      <View style={[
        styles.statusDot,
        { backgroundColor: isConnected ? '#28a745' : '#dc3545' }
      ]} />
      <Text style={styles.statusText}>
        {isConnected ? 'Connected' : 'Connecting...'}
      </Text>
    </View>
  );

  const renderVoiceVisualizer = () => {
    const waves = [0, 1, 2, 3, 4];

    return (
      <View style={styles.visualizerContainer}>
        {waves.map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                transform: [
                  {
                    scaleY: waveAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, Math.random() * 1.5 + 0.5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderLoadingMessage = () => {
    if (!isLoading) return null;

    return (
      <View style={[styles.messageContainer, styles.botMessage]}>
        <View style={styles.messageHeader}>
          <Icon name="smart-toy" size={20} color="#28a745" />
          <Text style={styles.senderText}>AI Assistant</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#28a745" />
          <Text style={[styles.messageText, styles.loadingText]}>
            Processing your voice...
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderConnectionStatus()}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderLoadingMessage}
      />

      <View style={styles.voiceContainer}>
        {isRecording && renderVoiceVisualizer()}

        <View style={styles.recordingInfo}>
          <Text style={styles.instructionText}>
            {isRecording ? 'Listening... Tap to stop' : 'Tap to speak'}
          </Text>
          {isRecording && (
            <Text style={styles.recordingText}>
              🔴 Recording
            </Text>
          )}
        </View>

        <Animated.View
          style={[
            styles.voiceButtonContainer,
            { transform: [{ scale: pulseAnimation }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
            ]}
            onPress={handleVoicePress}
            disabled={!isConnected}
          >
            <LinearGradient
              colors={isRecording ? ['#dc3545', '#c82333'] : ['#007bff', '#0056b3']}
              style={styles.voiceButtonGradient}
            >
              <Icon
                name={isRecording ? 'stop' : 'mic'}
                size={40}
                color="#ffffff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6c757d',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  botMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageText: {
    fontSize: 16,
    color: '#343a40',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontStyle: 'italic',
    color: '#6c757d',
  },
  voiceContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 40,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#007bff',
    marginHorizontal: 2,
    borderRadius: 2,
    height: 40,
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 5,
  },
  recordingText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  voiceButtonContainer: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  voiceButtonActive: {
    elevation: 8,
    shadowOpacity: 0.4,
  },
  voiceButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceInterface;