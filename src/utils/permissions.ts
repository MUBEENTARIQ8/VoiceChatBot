import {Platform, Alert, Linking} from 'react-native';
import {
  request,
  check,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

export const requestPermissions = async (): Promise<boolean> => {
  try {
    const microphonePermission = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    }) as Permission;

    // Check current permission status
    const microphoneStatus = await check(microphonePermission);
    
    if (microphoneStatus === RESULTS.GRANTED) {
      return true;
    }

    if (microphoneStatus === RESULTS.DENIED) {
      // Request permission
      const result = await request(microphonePermission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        showPermissionAlert();
        return false;
      }
    }

    if (microphoneStatus === RESULTS.BLOCKED) {
      showPermissionAlert();
      return false;
    }

    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

const showPermissionAlert = () => {
  Alert.alert(
    'Microphone Permission Required',
    'This app needs access to your microphone to enable voice chat functionality. Please enable microphone permission in your device settings.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ]
  );
};

export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    const microphonePermission = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    }) as Permission;

    const status = await check(microphonePermission);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};