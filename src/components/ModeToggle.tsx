import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';

export type ChatMode = 'text' | 'voice';

interface Props {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const ModeToggle: React.FC<Props> = ({ mode, onModeChange }) => {
  const slideAnimation = new Animated.Value(mode === 'text' ? 0 : 1);

  React.useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: mode === 'text' ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [mode]);

  const handleToggle = () => {
    const newMode = mode === 'text' ? 'voice' : 'text';
    onModeChange(newMode);
  };

  const slideInterpolation = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 42],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.thumb,
              {
                left: slideInterpolation,
                backgroundColor: mode === 'text' ? '#007bff' : '#28a745',
              },
            ]}
          />

          <View style={styles.optionsContainer}>
            <View style={[
              styles.option,
              mode === 'text' && styles.activeOption,
            ]}>
              <Icon
                name="keyboard"
                size={16}
                color={mode === 'text' ? '#ffffff' : '#6c757d'}
              />
              <Text style={[
                styles.optionText,
                mode === 'text' && styles.activeOptionText,
              ]}>
                Text
              </Text>
            </View>

            <View style={[
              styles.option,
              mode === 'voice' && styles.activeOption,
            ]}>
              <Icon
                name="mic"
                size={16}
                color={mode === 'voice' ? '#ffffff' : '#6c757d'}
              />
              <Text style={[
                styles.optionText,
                mode === 'voice' && styles.activeOptionText,
              ]}>
                Voice
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleContainer: {
    position: 'relative',
  },
  track: {
    width: 100,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    top: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeOption: {
    zIndex: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#6c757d',
  },
  activeOptionText: {
    color: '#ffffff',
  },
});

export default ModeToggle;