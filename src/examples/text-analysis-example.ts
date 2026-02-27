/**
 * Example: Using the Text Analysis Skill
 */

import { TextAnalysisSkill } from '../skills/TextAnalysisSkill';

async function main() {
  const skill = new TextAnalysisSkill();

  console.log('=== Text Analysis Skill Demo ===\n');

  // Example 1: Basic text analysis
  const text1 = `
    Artificial intelligence is transforming the world. 
    It enables machines to learn from experience and perform tasks that typically require human intelligence.
    This technology is amazing and has wonderful applications across many industries.
  `;

  console.log('Example 1: Basic Analysis');
  const result1 = await skill.execute({ text: text1 });
  console.log(JSON.stringify(result1, null, 2));

  // Example 2: With keyword extraction
  console.log('\n\nExample 2: With Keyword Extraction');
  const result2 = await skill.execute({
    text: text1,
    includeKeywords: true,
  });
  console.log(JSON.stringify(result2, null, 2));

  // Example 3: Sentiment analysis
  const positiveText = 'This is great! I love this amazing product. It works wonderfully!';
  const negativeText = 'This is terrible. I hate this awful product. It is the worst.';
  const neutralText = 'The product exists. It has features. People use it.';

  console.log('\n\nExample 3: Sentiment Analysis');
  const pos = await skill.execute({ text: positiveText });
  const neg = await skill.execute({ text: negativeText });
  const neu = await skill.execute({ text: neutralText });

  console.log('Positive text sentiment:', pos.data.sentiment);
  console.log('Negative text sentiment:', neg.data.sentiment);
  console.log('Neutral text sentiment:', neu.data.sentiment);
}

main().catch(console.error);
