import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors } from '../utils/theme';

interface Props extends TouchableOpacityProps {
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  children?: React.ReactNode;
}

export default function HapticButton({ onPress, haptic = 'light', children, style, ...props }: Props) {
  const flash = useRef(new Animated.Value(0)).current;

  const handlePress = async (e: any) => {
    flash.setValue(0.6);
    Animated.timing(flash, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();

    switch (haptic) {
      case 'light':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);            break;
      case 'medium':  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);           break;
      case 'heavy':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);            break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'error':   await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   break;
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[{ overflow: 'hidden' }, style]}
      {...props}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.accentLight, opacity: flash }]}
      />
    </TouchableOpacity>
  );
}