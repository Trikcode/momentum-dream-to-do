import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/src/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPieceProps {
  index: number;
  color: string;
  onComplete?: () => void;
  isLast?: boolean;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, color, onComplete, isLast }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const startX = Math.random() * SCREEN_WIDTH;
  const drift = (Math.random() - 0.5) * 200;

  useEffect(() => {
    const delay = index * 20;

    scale.value = withDelay(delay, withTiming(1, { duration: 100 }));

    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );

    translateX.value = withDelay(
      delay,
      withTiming(drift, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.inOut(Easing.sin),
      })
    );

    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()), {
        duration: 2000,
      })
    );

    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished && isLast && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const size = 8 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          width: size,
          height: isCircle ? size : size * 2,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  colors.accent.purple,
  colors.accent.pink,
  colors.accent.gold,
  colors.accent.teal,
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
];

const CONFETTI_COUNT = 50;

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  trigger,
  onComplete,
}) => {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setKey((prev) => prev + 1);
    }
  }, [trigger]);

  const handleComplete = () => {
    setShow(false);
    onComplete?.();
  };

  if (!show) return null;

  return (
    <View style={styles.container} pointerEvents="none" key={key}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
        <ConfettiPiece
          key={index}
          index={index}
          color={CONFETTI_COLORS[index % CONFETTI_COLORS.length]}
          onComplete={handleComplete}
          isLast={index === CONFETTI_COUNT - 1}
        />
      ))}
    </View>
  );
};

// Starburst effect for smaller celebrations
interface StarburstProps {
  trigger: boolean;
  x?: number;
  y?: number;
}

export const Starburst: React.FC<StarburstProps> = ({ trigger, x = 0, y = 0 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => setShow(false), 600);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <View style={[styles.starburstContainer, { left: x - 30, top: y - 30 }]} pointerEvents="none">
      {Array.from({ length: 8 }).map((_, index) => (
        <StarburstRay key={index} index={index} />
      ))}
    </View>
  );
};

const StarburstRay: React.FC<{ index: number }> = ({ index }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );
    opacity.value = withDelay(
      200,
      withTiming(0, { duration: 400 })
    );
  }, []);

  const angle = (index * 45) * (Math.PI / 180);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${index * 45}deg` },
      { translateY: -20 * scale.value },
      { scaleY: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.ray, animatedStyle]}>
      <View style={styles.rayInner} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  starburstContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 30,
    alignItems: 'center',
  },
  rayInner: {
    width: 4,
    height: 20,
    backgroundColor: colors.accent.gold,
    borderRadius: 2,
  },
});
