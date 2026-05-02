export type Mood = 'neutral' | 'happy' | 'angry' | 'calm';

const HAPPY_WORDS = new Set([
  'happy', 'great', 'awesome', 'love', 'good', 'yay', 'haha', 'lol', 
  'amazing', 'best', 'excellent', 'fantastic', 'joy', 'smile', 'beautiful',
  'excited', 'perfect', 'sweet', 'thanks', 'thank'
]);

const ANGRY_WORDS = new Set([
  'angry', 'hate', 'mad', 'bad', 'worst', 'stupid', 'annoying', 
  'terrible', 'pissed', 'furious', 'upset', 'damn', 'awful', 'horrible',
  'sucks', 'crap', 'bullshit', 'fuck', 'shit'
]);

const CALM_WORDS = new Set([
  'calm', 'relax', 'chill', 'peace', 'okay', 'fine', 'cool', 'sure', 
  'breathe', 'sleep', 'rest', 'quiet', 'smooth', 'whatever', 'alright',
  'soft', 'gentle'
]);

/**
 * Basic NLP: Returns the dominant mood of a given text.
 */
export function analyzeMood(text: string): Mood {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  const scores = { happy: 0, angry: 0, calm: 0 };
  
  for (const word of words) {
    if (HAPPY_WORDS.has(word)) scores.happy++;
    if (ANGRY_WORDS.has(word)) scores.angry++;
    if (CALM_WORDS.has(word)) scores.calm++;
  }
  
  const max = Math.max(scores.happy, scores.angry, scores.calm);
  if (max === 0) return 'neutral';
  
  if (scores.happy === max) return 'happy';
  if (scores.angry === max) return 'angry';
  return 'calm';
}
