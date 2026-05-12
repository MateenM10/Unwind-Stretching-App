import { useEffect, useRef, useState } from 'react';
import { Text, TextProps } from 'react-native';

interface Props extends TextProps {
  value: number;
  duration?: number;
}

export default function AnimatedNumber({ value, duration = 1000, style, ...props }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef  = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? 0);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplay(newValue);
      if (progress >= 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  return <Text style={style} {...props}>{display}</Text>;
}