import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateFeedRecommendations(userId: string, limit = 20) {
    this.logger.log(`AI feed recommendation requested for user ${userId}`);
    return { recommendations: [], source: 'placeholder' };
  }

  async generateVideoRecommendations(userId: string, limit = 20) {
    this.logger.log(`AI video recommendation requested for user ${userId}`);
    return { recommendations: [], source: 'placeholder' };
  }

  async autoModerateContent(content: string) {
    this.logger.log(`AI moderation check for content: ${content.substring(0, 50)}...`);
    return {
      approved: true,
      confidence: 1.0,
      flags: [],
      action: 'allow',
    };
  }

  async detectSpam(content: string) {
    this.logger.log(`AI spam detection for content: ${content.substring(0, 50)}...`);
    return {
      isSpam: false,
      confidence: 1.0,
      score: 0,
    };
  }

  async generateCaption(imageUrl: string) {
    this.logger.log(`AI caption generation for image: ${imageUrl}`);
    return { caption: '', source: 'placeholder' };
  }

  async suggestHashtags(content: string) {
    this.logger.log(`AI hashtag suggestion for: ${content.substring(0, 50)}...`);
    const words = content.toLowerCase().match(/\b(\w+)\b/g) || [];
    const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'this', 'that', 'with', 'from', 'by']);
    const tags = [...new Set(words.filter((w) => !commonWords.has(w) && w.length > 2))].slice(0, 5);

    return { hashtags: tags.map((t) => `#${t}`) };
  }
}
