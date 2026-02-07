// src/components/celebrations/CelebrationOrchestrator.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useCelebrationStore } from '@/src/store/celebrationStore'
import { PowerMoveComplete } from './PowerMoveComplete'
import { VictoryModal } from './VictoryModal'
import { LevelUpModal } from './LevelUpModal'
import { SparkBurst } from './SparkBurst'
import { Confetti } from './Confetti'

export function CelebrationOrchestrator() {
  const {
    showPowerMoveComplete,
    completedMoveTitle,
    sparksEarned,
    showSparkBurst,
    sparkBurstAmount,
    sparkBurstPosition,
    showVictory,
    currentVictory,
    showLevelUp,
    levelUpData,
    showConfetti,
    dismissPowerMoveComplete,
    dismissVictory,
    dismissLevelUp,
  } = useCelebrationStore()

  return (
    <View style={styles.container} pointerEvents='box-none'>
      {showPowerMoveComplete && (
        <PowerMoveComplete
          title={completedMoveTitle}
          sparksEarned={sparksEarned}
          onComplete={dismissPowerMoveComplete}
        />
      )}

      {showVictory && currentVictory && (
        <VictoryModal victory={currentVictory} onDismiss={dismissVictory} />
      )}

      {showLevelUp && levelUpData && (
        <LevelUpModal data={levelUpData} onDismiss={dismissLevelUp} />
      )}

      {showSparkBurst && (
        <SparkBurst amount={sparkBurstAmount} position={sparkBurstPosition} />
      )}

      {showConfetti &&
        !showPowerMoveComplete &&
        !showVictory &&
        !showLevelUp && <Confetti count={60} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
})
