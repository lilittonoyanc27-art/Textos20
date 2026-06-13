/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Tense = 'past' | 'present' | 'future';

export interface Phrase {
  id: string;
  spanish: string;
  armenian: string;
  tense: Tense;
  explanation: string;
  clue: string; // The specific time marker or verb configuration clue
}

export interface Player {
  id: 1 | 2;
  name: string;
  score: number;
}

export type GamePhase = 'setup' | 'playing' | 'round_result' | 'game_over';

export interface RoundInfo {
  number: number;
  activePlayerId: 1 | 2;
  phrase: Phrase;
  selectedAnswer: Tense | null;
  isCorrect: boolean | null;
}
