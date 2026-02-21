import type { EPSResult } from './types';

export function analyzeChatFileWithEPS(file: File): Promise<EPSResult>;
export function analyzeChatTextWithEPS(text: string): Promise<EPSResult>;
