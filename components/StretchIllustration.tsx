import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const ACCENT = '#C9A96E';
const BODY = '#2C2416';
const LIGHT = '#EDE5D8';

const figures: Record<string, React.ReactElement> = {

  neck: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Body */}
      <Line x1="80" y1="75" x2="80" y2="120" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms */}
      <Line x1="80" y1="85" x2="55" y2="105" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="85" x2="105" y2="105" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Legs */}
      <Line x1="80" y1="120" x2="60" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="120" x2="100" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head tilted */}
      <Circle cx="90" cy="55" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Neck stretch line */}
      <Line x1="80" y1="72" x2="90" y2="73" stroke={BODY} strokeWidth="3" strokeLinecap="round"/>
      {/* Highlight arc showing stretch */}
      <Path d="M 105 42 Q 118 55 105 68" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3"/>
    </Svg>
  ),

  shoulders: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Body */}
      <Line x1="80" y1="75" x2="80" y2="120" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Shoulders raised */}
      <Line x1="80" y1="80" x2="48" y2="72" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="80" x2="112" y2="72" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Legs */}
      <Line x1="80" y1="120" x2="60" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="120" x2="100" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="80" cy="55" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Arrows showing shrug */}
      <Path d="M 44 80 L 44 68 L 40 74" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M 116 80 L 116 68 L 120 74" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  chest: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Body */}
      <Line x1="80" y1="75" x2="80" y2="120" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms behind back */}
      <Path d="M 80 88 Q 55 100 60 115" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <Path d="M 80 88 Q 105 100 100 115" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <Line x1="60" y1="115" x2="100" y2="115" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Legs */}
      <Line x1="80" y1="120" x2="60" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="120" x2="100" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="80" cy="55" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Chest open arc */}
      <Path d="M 55 82 Q 80 70 105 82" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3"/>
    </Svg>
  ),

  back: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Lying figure curved */}
      <Path d="M 30 110 Q 80 70 130 90" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="28" cy="95" r="14" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Knees hugged */}
      <Path d="M 115 85 Q 125 75 130 90 Q 120 100 110 95" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Arms */}
      <Path d="M 75 82 Q 105 68 112 80" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Stretch highlight */}
      <Path d="M 60 105 Q 80 85 105 92" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3"/>
    </Svg>
  ),

  hips: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Lying figure */}
      <Line x1="25" y1="105" x2="100" y2="105" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="25" cy="91" r="14" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* One leg up */}
      <Line x1="100" y1="105" x2="100" y2="70" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Figure four position */}
      <Path d="M 85 88 Q 100 70 115 80" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <Line x1="100" y1="105" x2="130" y2="115" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Stretch highlight */}
      <Path d="M 90 80 Q 108 72 118 85" stroke={ACCENT} strokeWidth="3" fill="none" strokeDasharray="4 3" strokeLinecap="round"/>
    </Svg>
  ),

  quads: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Body standing */}
      <Line x1="80" y1="75" x2="80" y2="115" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms out for balance */}
      <Line x1="80" y1="88" x2="50" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="88" x2="110" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* One straight leg */}
      <Line x1="80" y1="115" x2="70" y2="148" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Bent leg pulled up */}
      <Path d="M 80 115 Q 95 128 88 148" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <Path d="M 88 148 Q 90 140 82 135" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="80" cy="57" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Stretch highlight */}
      <Path d="M 84 118 Q 96 130 90 148" stroke={ACCENT} strokeWidth="3" fill="none" strokeDasharray="4 3" strokeLinecap="round"/>
    </Svg>
  ),

  hamstrings: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Bent over figure */}
      <Path d="M 80 60 Q 80 90 80 105" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Torso folded forward */}
      <Path d="M 80 90 Q 60 95 40 100" stroke={BODY} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Head down */}
      <Circle cx="32" cy="108" r="14" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Legs straight */}
      <Line x1="80" y1="105" x2="65" y2="148" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="105" x2="95" y2="148" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms reaching */}
      <Line x1="42" y1="100" x2="65" y2="140" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Stretch highlight */}
      <Path d="M 68 108 Q 68 130 68 148" stroke={ACCENT} strokeWidth="3" fill="none" strokeDasharray="4 3" strokeLinecap="round"/>
    </Svg>
  ),

  calves: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Body */}
      <Line x1="80" y1="75" x2="80" y2="118" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms */}
      <Line x1="80" y1="88" x2="55" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="88" x2="105" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Legs on tiptoe */}
      <Line x1="80" y1="118" x2="65" y2="148" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="118" x2="95" y2="148" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Tiptoe feet */}
      <Line x1="65" y1="148" x2="60" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="95" y1="148" x2="100" y2="145" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="80" cy="57" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Arrows up */}
      <Path d="M 55 148 L 55 135 L 51 141" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M 105 148 L 105 135 L 109 141" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  ankles: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Seated body */}
      <Line x1="80" y1="75" x2="80" y2="110" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Arms resting */}
      <Line x1="80" y1="88" x2="55" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="88" x2="105" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Seated legs */}
      <Line x1="80" y1="110" x2="50" y2="120" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      <Line x1="80" y1="110" x2="110" y2="120" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* One leg extended, foot circling */}
      <Line x1="50" y1="120" x2="35" y2="140" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Circle around ankle */}
      <Circle cx="35" cy="148" r="10" fill="none" stroke={ACCENT} strokeWidth="3" strokeDasharray="5 3"/>
      {/* Head */}
      <Circle cx="80" cy="57" r="18" fill="none" stroke={BODY} strokeWidth="4"/>
    </Svg>
  ),

  general: (
    <Svg width="160" height="160" viewBox="0 0 160 160">
      {/* Full body stretch lying down */}
      <Line x1="20" y1="100" x2="140" y2="100" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Head */}
      <Circle cx="20" cy="86" r="14" fill="none" stroke={BODY} strokeWidth="4"/>
      {/* Arms stretched overhead */}
      <Line x1="20" y1="100" x2="20" y2="72" stroke={BODY} strokeWidth="3" strokeLinecap="round"/>
      {/* Legs stretched */}
      <Line x1="140" y1="100" x2="150" y2="112" stroke={BODY} strokeWidth="4" strokeLinecap="round"/>
      {/* Stretch arrows */}
      <Path d="M 15 68 L 8 62 M 15 68 L 22 62" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M 148 116 L 154 122 M 148 116 L 142 122" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Glow line */}
      <Line x1="20" y1="100" x2="140" y2="100" stroke={ACCENT} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round"/>
    </Svg>
  ),
};

interface Props {
  muscle: string;
}

export default function StretchIllustration({ muscle }: Props) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {figures[muscle] ?? figures['general']}
    </View>
  );
}