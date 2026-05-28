/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Paper {
  id: string; // arXiv ID or link
  title: string;
  summary: string;
  authors: string[];
  categories: string[];
  published: string;
  updated: string;
  pdfUrl?: string;
  htmlUrl?: string;
  relevanceScore?: number; // For semantic search
  matchReason?: string; // For semantic search explanation
}

export interface SavedPaper {
  id: string;
  paper: Paper;
  savedAt: string;
  notes?: string;
}

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'hasini';
  text: string;
  textTelugu?: string;
  timestamp: string;
  isProcessing?: boolean;
}

export interface DailyTrendsBrief {
  summary: string;
  trends: {
    theme: string;
    description: string;
    relevance: string;
  }[];
  teluguSummary: string;
}

export interface HybridBlueprint {
  hybridTitle: string;
  breakthroughOverview: string;
  mathematicalConvergence: string;
  stepByStepImplementation: string;
  teluguExposition: string;
  jarvisAudioSpeech: string;
}
