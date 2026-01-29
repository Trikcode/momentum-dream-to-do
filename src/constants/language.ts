export const LANGUAGE = {
  // Instead of "Streak"
  momentum: {
    name: 'Momentum',
    singular: 'day of momentum',
    plural: 'days of momentum',
    fire: 'Your fire is burning bright',
    growing: 'Building unstoppable momentum',
  },

  // Instead of "Actions/Tasks"
  powerMoves: {
    name: 'Power Moves',
    singular: 'Power Move',
    complete: 'Crushed it',
    pending: 'Ready to crush',
    skip: 'Not today',
  },

  // Instead of "XP/Points"
  spark: {
    name: 'Spark',
    singular: 'spark',
    plural: 'sparks',
    earned: 'sparked',
  },

  // Instead of "Level"
  chapter: {
    name: 'Chapter',
    current: 'Your Chapter',
  },

  // Instead of "Achievements"
  victories: {
    name: 'Victories',
    singular: 'Victory',
    unlocked: 'Victory Unlocked',
  },

  // Instead of "Progress"
  journey: {
    name: 'Journey',
    progress: 'Journey Progress',
  },

  // Instead of "Goals/Milestones"
  horizons: {
    name: 'Horizons',
    singular: 'Horizon',
    reached: 'Horizon Reached',
  },

  // Time-based mantras (instead of "Good morning")
  mantras: {
    morning: [
      'Rise and make it happen',
      'Today is yours to conquer',
      'New day, new power moves',
      'The world awaits your magic',
      'Wake up and be legendary',
    ],
    afternoon: [
      'Keep that momentum going',
      'Halfway there, fully powerful',
      'Your afternoon glow is showing',
      "Push through, you've got this",
      "Power moves don't pause",
    ],
    evening: [
      'Finish strong, queen',
      'Evening hustle hits different',
      'Wrap up with grace',
      'One more push before rest',
      'End the day victorious',
    ],
    night: [
      'Rest well, rise stronger',
      "Dreams fuel tomorrow's wins",
      'You did amazing today',
      "Recharge for tomorrow's power",
      'Sleep tight, dream big',
    ],
  },
}

// Get contextual mantra based on time
export function getMantra(): string {
  const hour = new Date().getHours()
  let timeOfDay: keyof typeof LANGUAGE.mantras

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon'
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening'
  } else {
    timeOfDay = 'night'
  }

  const mantras = LANGUAGE.mantras[timeOfDay]
  return mantras[Math.floor(Math.random() * mantras.length)]
}

// Celebration messages
export const CELEBRATIONS = {
  powerMoveComplete: [
    'Absolutely crushed it! 💪',
    "That's how it's done!",
    'Unstoppable energy!',
    'Power move complete!',
    "You're on fire!",
  ],
  momentumGain: [
    'Momentum building!',
    'The fire grows stronger!',
    "You're unstoppable!",
    'Keep this energy going!',
  ],
  horizonReached: [
    'Horizon reached! 🌅',
    'Major milestone unlocked!',
    "Look how far you've come!",
    'This is just the beginning!',
  ],
  dreamComplete: [
    'DREAM ACHIEVED! 🎉',
    'You made it happen!',
    'From dream to reality!',
    'Absolutely legendary!',
  ],
}

export function getRandomCelebration(type: keyof typeof CELEBRATIONS): string {
  const messages = CELEBRATIONS[type]
  return messages[Math.floor(Math.random() * messages.length)]
}
