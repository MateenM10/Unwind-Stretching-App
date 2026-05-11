import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  haptic?: 'light' | 'medium' | 'success';
  style?: ViewStyle;
  textStyle?: any;
  variant?: 'primary' | 'success';
}

export default function GradientButton({
  label,
  onPress,
  haptic = 'medium',
  style,
  textStyle,
  variant = 'primary',
  ...props
}: Props) {

  const gradients = {
    primary: ['#D4B483', '#C9A96E', '#B8864E'] as const,
    success: ['#8DB87A', '#6EA85D', '#539142'] as const,
  };

  const handlePress = async (e: any) => {
    switch (haptic) {
      case 'light':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   break;
      case 'medium':  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={[styles.wrapper, style]}
      {...props}
    >
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.label, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper:  { borderRadius: 16, overflow: 'hidden', shadowColor: '#C9A96E', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  gradient: { paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  label:    { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});