import * as Haptics from 'expo-haptics';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
}

export default function HapticButton({ onPress, haptic = 'light', ...props }: Props) {
  const handlePress = async (e: any) => {
    switch (haptic) {
      case 'light':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   break;
      case 'medium':  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  break;
      case 'heavy':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);   break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'error':   await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   break;
    }
    onPress?.(e);
  };

  return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} {...props} />;
}