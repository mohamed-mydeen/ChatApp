/**
 * Basic Extractive Summarizer
 * In a production app, you would send the text to OpenAI/Anthropic.
 * For this demo, we extract the most "important" sentences based on keyword frequency.
 */

const STOP_WORDS = new Set([
  'the','is','in','and','to','a','of','for','it','that','on','with','i','you',
  'my','this','but','have','be','we','are','not','so','was','if','me','what',
  'do','just','like','about','can','get','your','how','why','when','where',
  'they','them','he','she','his','hers','their','there','here','then','than'
]);

export function generateSummary(messages: { content: string; isOwn: boolean }[]): string {
  // Only consider messages with text content
  const textMessages = messages
    .map(m => m.content.trim())
    .filter(text => text.length > 5 && !text.startsWith('📞 Contact:'));

  if (textMessages.length === 0) {
    return "Not enough conversation history to generate a summary. Start chatting!";
  }
  if (textMessages.length <= 2) {
    return "The conversation just started! Here's the gist: " + textMessages.join(' ');
  }

  // 1. Calculate word frequency across all recent messages
  const wordCounts: Record<string, number> = {};
  textMessages.forEach(msg => {
    const words = msg.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    words.forEach(w => {
      if (!STOP_WORDS.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });

  // 2. Score each message based on how many frequent words it contains
  const scoredSentences = textMessages.map(sentence => {
    const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;
    words.forEach(w => {
      if (wordCounts[w]) score += wordCounts[w];
    });
    // Normalize score by sentence length to prevent long sentences from always winning
    const normalizedScore = words.length > 0 ? score / words.length : 0;
    return { sentence, score: normalizedScore };
  });

  // 3. Pick the top 2 highest scoring messages to form the summary
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Deduplicate sentences (sometimes exact same message is sent twice)
  const uniqueSentences = Array.from(new Set(scoredSentences.map(s => s.sentence)));
  const topSentences = uniqueSentences.slice(0, 2);

  return "Based on the recent messages, the key focus was: \n\"" + 
         topSentences.join("\"\n\nAnd also touched upon:\n\"") + "\"";
}
