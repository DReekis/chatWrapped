export type EPSConfidence = 'clear' | 'mixed' | 'insufficient';

export interface EPSDirectionalInsight {
  direction?: string;
  trend?: string;
  level?: string;
  explanation: string;
}

export interface EPSResult {
  EPS: number;
  band: string;
  confidence: EPSConfidence;
  supportingInsights: {
    investmentBalance: {
      direction: string;
      explanation: string;
    };
    connectionDirection: {
      trend: string;
      explanation: string;
    };
    reliability: {
      level: string;
      explanation: string;
    };
  };
  anchorInsight: string;
  capsTriggered: string[];
}
