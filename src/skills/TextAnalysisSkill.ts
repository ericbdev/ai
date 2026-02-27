import { BaseSkill } from './BaseSkill';
import { SkillInput, SkillOutput } from '../types/skill';

/**
 * TextAnalysisSkill - Analyzes text and provides insights
 * 
 * This skill can:
 * - Count words, sentences, and characters
 * - Calculate reading time
 * - Extract keywords
 * - Analyze sentiment (basic)
 */
export class TextAnalysisSkill extends BaseSkill {
  constructor() {
    super({
      id: 'text-analysis',
      name: 'Text Analysis',
      description: 'Analyzes text and provides insights such as word count, reading time, and basic statistics',
      version: '1.0.0',
      tags: ['text', 'analysis', 'nlp', 'statistics'],
      inputSchema: {
        text: {
          type: 'string',
          description: 'The text to analyze',
          required: true,
        },
        includeKeywords: {
          type: 'boolean',
          description: 'Whether to extract keywords from the text',
          required: false,
          default: false,
        },
      },
    });
  }

  protected async run(input: SkillInput): Promise<SkillOutput> {
    const text = input.text as string;
    const includeKeywords = input.includeKeywords !== undefined ? input.includeKeywords : false;

    // Basic text analysis
    const analysis = {
      characterCount: text.length,
      characterCountNoSpaces: text.replace(/\s/g, '').length,
      wordCount: this.countWords(text),
      sentenceCount: this.countSentences(text),
      paragraphCount: this.countParagraphs(text),
      averageWordLength: this.calculateAverageWordLength(text),
      readingTimeMinutes: this.calculateReadingTime(text),
      sentiment: this.analyzeSentiment(text),
    };

    // Optional keyword extraction
    if (includeKeywords) {
      (analysis as any).keywords = this.extractKeywords(text);
    }

    return {
      success: true,
      data: analysis,
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSentences(text: string): number {
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    return sentences ? sentences.length : 0;
  }

  private countParagraphs(text: string): number {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }

  private calculateAverageWordLength(text: string): number {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return Math.round((totalLength / words.length) * 100) / 100;
  }

  private calculateReadingTime(text: string): number {
    const words = this.countWords(text);
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(words / wordsPerMinute);
  }

  private analyzeSentiment(text: string): string {
    // Very basic sentiment analysis based on positive/negative words
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'wonderful', 'amazing', 'fantastic', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'poor', 'sad', 'disappointing', 'negative'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractKeywords(text: string, topN: number = 5): string[] {
    // Simple keyword extraction based on word frequency
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter short words

    // Common stop words to exclude
    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'have', 'been', 'they', 'their',
      'would', 'there', 'could', 'which', 'these', 'about', 'other',
    ]);

    // Count word frequencies
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Sort by frequency and return top N
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(entry => entry[0]);
  }
}
