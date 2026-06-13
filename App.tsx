/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, RefreshCw, User, Play, ArrowRight, CheckCircle2, 
  XCircle, Award, Volume1, HelpCircle, ShieldAlert, Sparkles, Key, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tense, Phrase, Player, GamePhase, RoundInfo } from './types';
import { SPANISH_PHRASES } from './phrases';
import { synth } from './audio-synth';

const AVATARS = [
  { emoji: '🐂', name: 'El Toro', color: 'from-rose-500 to-red-600' },
  { emoji: '🎸', name: 'La Guitarra', color: 'from-amber-500 to-orange-600' },
  { emoji: '🤠', name: 'El Sombrero', color: 'from-yellow-500 to-amber-600' },
  { emoji: '☀️', name: 'El Sol', color: 'from-amber-400 to-yellow-500' },
  { emoji: '🌶️', name: 'El Chile', color: 'from-red-500 to-orange-500' },
  { emoji: '💃', name: 'La Bailarina', color: 'from-pink-500 to-rose-600' },
  { emoji: '🌵', name: 'El Cactus', color: 'from-emerald-500 to-green-600' },
  { emoji: '⚽', name: 'El Balón', color: 'from-sky-500 to-blue-600' },
];

export default function App() {
  // Sound controls
  const [isMuted, setIsMuted] = useState(false);
  
  // Game Setup State
  const [player1Name, setPlayer1Name] = useState('Дон Педро');
  const [player2Name, setPlayer2Name] = useState('Донья Мария');
  const [player1Avatar, setPlayer1Avatar] = useState(0);
  const [player2Avatar, setPlayer2Avatar] = useState(1);
  const [roundsPerPlayer, setRoundsPerPlayer] = useState(5); // 5 rounds each by default
  const [textCluesEnabled, setTextCluesEnabled] = useState(false); // Text helper mode
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Core Game State
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Дон Педро', score: 0 },
    { id: 2, name: 'Донья Мария', score: 0 }
  ]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [gamePhrases, setGamePhrases] = useState<Phrase[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Tense | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [history, setHistory] = useState<RoundInfo[]>([]);

  // 3D Card flipper state
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);

  // Floating score trigger animate
  const [floatingScore, setFloatingScore] = useState<{ show: boolean, value: number, playerId: 1 | 2 } | null>(null);

  // Initialize Speech Synthesis and check voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setHasVoiceSupport(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      const spanishVoice = voices.find(v => v.lang.startsWith('es-') || v.lang === 'es');
      if (!spanishVoice && voices.length > 0) {
        setSpeechError('Իսպաներենի SpeechSynthesis ձայնը չգտնվեց: Աուդիոն կհնչի ստանդարտ ձայնով, սակայն խորհուրդ ենք տալիս ամեն դեպքում խաղալ միացված «Տեքստի հուշումների ռեժիմով»!');
      } else {
        setSpeechError(null);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Update original synthesizer mute on state change
  useEffect(() => {
    synth.setMute(isMuted);
  }, [isMuted]);

  // Audio synthesis helper wrapper
  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    synth.setMute(nextMute);
    synth.playClick();
  };

  // Speaks out the current Spanish phrase
  const speakCurrentPhrase = (phraseText: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(phraseText);
    
    // Attempt Spanish voice selection
    const spanishVoice = availableVoices.find(v => v.lang.startsWith('es-') || v.lang === 'es');
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-ES'; // Force Spanish locale fallback
    }

    utterance.pitch = 1.0;
    utterance.rate = 0.82; // Slightly slow rate for absolute beginners and ease of understanding

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error(e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    synth.playClick();
  };

  // Keyboard accessibility helper: Guess tense using 1, 2, 3 or space to hear
  useEffect(() => {
    if (phase !== 'playing' || selectedAnswer !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activePhrase = gamePhrases[currentPhraseIndex];
      if (!activePhrase) return;

      if (e.key === '1') {
        handleGuess('past');
      } else if (e.key === '2') {
        handleGuess('present');
      } else if (e.key === '3') {
        handleGuess('future');
      } else if (e.code === 'Space') {
        e.preventDefault();
        speakCurrentPhrase(activePhrase.spanish);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gamePhrases, currentPhraseIndex, selectedAnswer]);

  // Start the structured game
  const startGame = () => {
    // Generate a randomized sample of phrases for the game
    // Shuffle the array and slice needed amount of rounds
    const shuffled = [...SPANISH_PHRASES].sort(() => 0.5 - Math.random());
    const neededCount = roundsPerPlayer * 2;
    const selected = shuffled.slice(0, Math.min(neededCount, shuffled.length));

    setGamePhrases(selected);
    setCurrentPhraseIndex(0);
    setPlayers([
      { id: 1, name: player1Name.trim() || 'Дон Педро', score: 0 },
      { id: 2, name: player2Name.trim() || 'Донья Мария', score: 0 }
    ]);
    setActivePlayerIndex(0);
    setCurrentRound(1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsFlipped(false);
    setHistory([]);
    setPhase('playing');
    
    synth.playVictoryTheme();

    // Auto speak the first phrase with a small latency so players prepare
    setTimeout(() => {
      if (selected[0]) {
        speakCurrentPhrase(selected[0].spanish);
      }
    }, 850);
  };

  // Handle a tense selection guess
  const handleGuess = (tenseGuessed: Tense) => {
    if (selectedAnswer !== null) return; // Prevent double select

    const activePhrase = gamePhrases[currentPhraseIndex];
    if (!activePhrase) return;

    const isAnswerCorrect = activePhrase.tense === tenseGuessed;
    setSelectedAnswer(tenseGuessed);
    setIsCorrect(isAnswerCorrect);
    setIsFlipped(true); // Flip card to show solution details immediately

    const activePlayer = players[activePlayerIndex];

    if (isAnswerCorrect) {
      synth.playCorrect();
      
      // Update score with visual points effect
      const pointEarned = 100;
      setPlayers(prev => prev.map((p, idx) => 
        idx === activePlayerIndex ? { ...p, score: p.score + pointEarned } : p
      ));

      // Trigger floating point feedback
      setFloatingScore({
        show: true,
        value: pointEarned,
        playerId: activePlayer.id
      });
      setTimeout(() => setFloatingScore(null), 1500);
    } else {
      synth.playIncorrect();
    }
  };

  // Proceed to the next round / player turn
  const nextTurn = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Add current round to history
    const activePhrase = gamePhrases[currentPhraseIndex];
    const activePlayer = players[activePlayerIndex];
    
    const roundRecord: RoundInfo = {
      number: currentRound,
      activePlayerId: activePlayer.id,
      phrase: activePhrase,
      selectedAnswer: selectedAnswer,
      isCorrect: isCorrect
    };

    setHistory(prev => [...prev, roundRecord]);

    // Check if game is completely finished
    const totalPhrasesCount = gamePhrases.length;
    const nextPhraseIdx = currentPhraseIndex + 1;

    if (nextPhraseIdx >= totalPhrasesCount) {
      setPhase('game_over');
      synth.playVictoryTheme();
      return;
    }

    // Switch player index and round calculations
    setCurrentPhraseIndex(nextPhraseIdx);
    const nextPlayerIdx = activePlayerIndex === 0 ? 1 : 0;
    setActivePlayerIndex(nextPlayerIdx);
    
    if (nextPlayerIdx === 0) {
      // Completed a full rotation round
      setCurrentRound(prev => prev + 1);
    }

    // Reset round interactive states
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsFlipped(false);
    synth.playTurnChime();

    // Auto-speak new phrase with small delay
    setTimeout(() => {
      const newPhrase = gamePhrases[nextPhraseIdx];
      if (newPhrase) {
        speakCurrentPhrase(newPhrase.spanish);
      }
    }, 700);
  };

  const resetGameToSetup = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    synth.playClick();
    setPhase('setup');
  };

  // Extract winning player calculations
  const leaderboard = [...players].sort((a, b) => b.score - a.score);
  const isDraw = players[0].score === players[1].score;
  const winner = isDraw ? null : leaderboard[0];

  const activePlayer = players[activePlayerIndex];
  const activeAvatar = activePlayerIndex === 0 ? AVATARS[player1Avatar] : AVATARS[player2Avatar];
  const nextPhrase = gamePhrases[currentPhraseIndex];

  return (
    <div id="main-container" className="min-h-screen bg-[#050510] text-[#f1f5f9] flex flex-col justify-between font-sans overflow-x-hidden relative selection:bg-cyan-500 selection:text-white">
      
      {/* 3D-Like Perspective Grid Floor background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.14] transition-opacity duration-1000"
        style={{
          backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(240px) scale(2.5)',
          transformOrigin: '50% 100%'
        }}
      />

      {/* HEADER BAR */}
      <header id="game-header" className="border-b border-white/10 bg-gradient-to-b from-[#0a0a1f]/90 via-[#050510]/80 to-transparent backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl animate-bounce filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">🎵</span>
            <div>
              <h1 className="font-extrabold tracking-tight text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-sans flex items-center gap-2">
                Adivina el Tiempo 
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20 tracking-normal font-medium">Իսպաներենը լսողությամբ</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block font-medium">3D խաղ. Գուշակեք իսպաներեն նախադասությունների քերականական ժամանակը լսողությամբ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {/* Clue Toggle Button */}
            <button
              id="clue-toggle-btn"
              onClick={() => {
                setTextCluesEnabled(!textCluesEnabled);
                synth.playClick();
               }}
              title={textCluesEnabled ? "Թաքցնել տեքստի հուշումները" : "Ցուցադրել իսպաներեն տեքստը"}
              className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 font-bold ${
                textCluesEnabled 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Տեքստի ռեժիմ. {textCluesEnabled ? "Միացվ." : "Անջատվ."}</span>
            </button>

            {/* Sound Toggle Icon Button */}
            <button
              id="sound-control-btn"
              onClick={handleMuteToggle}
              className={`p-2 rounded-xl border transition-all ${
                isMuted 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
              } hover:scale-105 active:scale-95`}
              title={isMuted ? "Միացնել ձայնը" : "Անջատել ձայնը"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* SPEECH AND SETUP WARNING BAR */}
      {speechError && phase === 'playing' && (
        <div id="speech-warning" className="bg-amber-950/30 border-b border-amber-500/10 text-amber-300 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 animate-pulse relative z-10">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{speechError} Միացված է նախադասությունների այլընտրանքային թարգմանությունը էկրանին։</span>
        </div>
      )}

      {/* CORE FRAMEWORK STAGE */}
      <main id="game-playground" className="flex-grow max-w-6xl w-full mx-auto p-4 flex flex-col justify-center relative z-10">

        <AnimatePresence mode="wait">
          
          {/* ================= PHASE 1: GAME SETUP ================= */}
          {phase === 'setup' && (
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 lg:grid-cols-12 py-4 relative z-10"
            >
              {/* Introduction Card */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-[#0a0a23]/60 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
                
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold mb-4 border border-cyan-500/20">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                    Լեզվական մենամարտ • Ուղեղների ճակատամարտ
                  </span>
                  
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    Գուշակիր <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-black">իսպաներեն նախադասության ժամանակը:</span>
                  </h2>
                  
                  <p className="text-slate-350 text-sm leading-relaxed mb-4 font-medium">
                    Կանոնները պարզ են. խաղը ստեղծված է լեգենդար <strong className="text-amber-400 font-semibold">«Գուշակիր մեղեդին»</strong> հեռուստաշոուի ոգով, բայց երգերի փոխարեն դուք լսում եք գեղեցիկ իսպաներեն խոսք։
                  </p>
                  
                  <ul className="space-y-3 text-xs text-slate-400 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold font-mono">1.</span>
                      <span>Երկու խաղացող տեղեր են զբաղեցնում եռաչափ խաղասեղանի շուրջ և մրցում հերթով։</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-fuchsia-400 font-bold font-mono">2.</span>
                      <span>Լսեք արտասանված աուդիո նախադասությունը և ընտրեք ճիշտ քերականական ժամանակը։</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-450 font-bold font-mono">3.</span>
                      <span>Յուրաքանչյուր ճիշտ պատասխան բերում է 100 միավոր։ Հաղթում է առավելագույն միավորներ հավաքած մասնակիցը։</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#050515]/80 p-3.5 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed shadow-inner">
                  <span className="font-extrabold text-cyan-300 block mb-1">💡 Օգտակար խորհուրդ.</span>
                  Ուշադրություն դարձրեք ժամանակային ցուցիչներին՝ <span className="text-fuchsia-350 font-mono font-semibold">ayer</span> (երեկ), <span className="text-cyan-350 font-mono font-semibold font-medium">mañana</span> (վաղը), <span className="text-amber-350 font-mono font-semibold">ahora</span> (հիմա) կամ բայերի վերջավորություններին։
                </div>
              </div>

              {/* Settings and Players Panels */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Visual Player Configuration Card */}
                <div className="bg-[#0a0a23]/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl relative">
                  <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    Խաղացողների կարգավորում սեղանի շուրջ
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 relative">
                    
                    {/* PLAYER 1 SETUP */}
                    <div className="p-4 rounded-2xl bg-[#090d22]/80 border-2 border-cyan-500/20 relative group hover:border-cyan-400/50 transition-all duration-300 shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
                      <div className="absolute top-3 right-3 text-xs font-black text-cyan-300 font-mono tracking-widest bg-cyan-950/50 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                        ԽԱՂԱՑՈՂ 1
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Խաղացողի անունը</label>
                        <input
                          id="player1-name-input"
                          type="text"
                          maxLength={16}
                          value={player1Name}
                          onChange={(e) => setPlayer1Name(e.target.value)}
                          placeholder="Մուտքագրեք անունը..."
                          className="w-full px-3 py-2.5 bg-[#030712]/90 border border-cyan-500/20 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 ring-2 ring-cyan-500/0 focus:ring-cyan-500/20 transition-all font-semibold shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Ընտրեք ավատար</label>
                        <div className="grid grid-cols-4 gap-2">
                          {AVATARS.map((avatar, idx) => (
                            <button
                              key={`p1-avatar-${idx}`}
                              id={`p1-avatar-btn-${idx}`}
                              onClick={() => { setPlayer1Avatar(idx); synth.playClick(); }}
                              className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-xl transition-all ${
                                player1Avatar === idx 
                                  ? 'border-cyan-400 bg-cyan-500/15 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.25)]' 
                                  : 'border-white/5 bg-[#050515]/40 hover:border-white/10 hover:bg-white/5'
                              }`}
                              title={avatar.name}
                            >
                              <span className="text-2xl filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">{avatar.emoji}</span>
                              <span className="text-[9px] text-slate-400 mt-1 font-mono hover:text-cyan-300 truncate max-w-full px-1">{avatar.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PLAYER 2 SETUP */}
                    <div className="p-4 rounded-2xl bg-[#140b25]/80 border-2 border-fuchsia-500/20 relative group hover:border-fuchsia-400/50 transition-all duration-300 shadow-[0_4px_20px_rgba(217,70,239,0.05)]">
                      <div className="absolute top-3 right-3 text-xs font-black text-fuchsia-300 font-mono tracking-widest bg-fuchsia-950/50 px-2.5 py-0.5 rounded-lg border border-fuchsia-500/20">
                        ԽԱՂԱՑՈՂ 2
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Խաղացողի անունը</label>
                        <input
                          id="player2-name-input"
                          type="text"
                          maxLength={16}
                          value={player2Name}
                          onChange={(e) => setPlayer2Name(e.target.value)}
                          placeholder="Մուտքագրեք անունը..."
                          className="w-full px-3 py-2.5 bg-[#030712]/90 border border-fuchsia-500/20 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-fuchsia-400 ring-2 ring-fuchsia-500/0 focus:ring-fuchsia-500/20 transition-all font-semibold shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Ընտրեք ավատար</label>
                        <div className="grid grid-cols-4 gap-2">
                          {AVATARS.map((avatar, idx) => (
                            <button
                              key={`p2-avatar-${idx}`}
                              id={`p2-avatar-btn-${idx}`}
                              onClick={() => { setPlayer2Avatar(idx); synth.playClick(); }}
                              className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-xl transition-all ${
                                player2Avatar === idx 
                                  ? 'border-fuchsia-500 bg-fuchsia-500/15 scale-105 shadow-[0_0_15px_rgba(232,121,249,0.25)]' 
                                  : 'border-white/5 bg-[#050515]/40 hover:border-white/10 hover:bg-white/5'
                              }`}
                              title={avatar.name}
                            >
                              <span className="text-2xl filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">{avatar.emoji}</span>
                              <span className="text-[9px] text-slate-400 mt-1 font-mono hover:text-fuchsia-300 truncate max-w-full px-1">{avatar.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Match Parameters & Launch Board */}
                <div className="bg-[#0a0a23]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Round selection */}
                  <div className="w-full md:w-auto">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Ռաունդներից յուրաքանչյուր խաղացողի համար</span>
                    <div className="flex gap-2">
                      {[3, 5, 8, 10].map((num) => (
                        <button
                          key={`rounds-opt-${num}`}
                          id={`rounds-opt-btn-${num}`}
                          onClick={() => {
                            setRoundsPerPlayer(num);
                            synth.playClick();
                          }}
                          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                            roundsPerPlayer === num
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                              : 'bg-[#050515]/80 text-slate-300 border-white/5 hover:border-slate-700'
                          }`}
                        >
                          {num} ռաունդ ({num * 2} նախադասություն)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* START BIG 3D BUTTON */}
                  <div className="w-full md:w-auto self-end">
                    <button
                      id="launch-game-btn"
                      onClick={startGame}
                      className="w-full md:w-auto relative group flex items-center justify-center cursor-pointer transition-all duration-300 active:translate-y-1 hover:scale-[1.02]"
                    >
                      {/* Ambient outer blur glow */}
                      <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
                      
                      {/* 3D raised button layers */}
                      <span className="absolute inset-0 bg-cyan-800 rounded-xl translate-y-1 shadow-[0_4px_20px_rgba(6,182,212,0.5)]"></span>
                      <span className="relative w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-base font-black tracking-wide rounded-xl border border-cyan-300 flex items-center justify-center gap-2.5 [transform:translateY(0)] group-active:[transform:translateY(4px)] transition-all uppercase">
                        <Play className="w-5 h-5 fill-current text-white animate-pulse" />
                        ՍԿՍԵԼ 3D ՄԵՆԱՄԱՐՏԸ
                        <ArrowRight className="w-4 h-4 text-cyan-200" />
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PHASE 2: ACTIVE GAMEPLAY ================= */}
          {phase === 'playing' && nextPhrase && (
            <motion.div
              key="gameplay-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 py-2"
            >
              
              {/* HEADING SCOREBOARD PANEL */}
              <div id="game-scoreboard-board" className="grid grid-cols-2 md:grid-cols-3 items-center gap-4 bg-[#0a0a23]/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl relative z-10">
                
                {/* Player 1 Box */}
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 relative ${
                    activePlayerIndex === 0 
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]' 
                      : 'bg-[#050515]/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${AVATARS[player1Avatar].color} flex items-center justify-center text-2xl shadow-md border border-white/10`}>
                      {AVATARS[player1Avatar].emoji}
                    </div>
                    {activePlayerIndex === 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                      </span>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate text-white">{players[0].name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono font-bold">Խ1</span>
                    </div>
                    <div className="text-xl font-extrabold text-cyan-400 font-mono flex items-center gap-1">
                      {players[0].score} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">միավոր</span>
                    </div>
                  </div>

                  {/* Floating Score effect */}
                  {floatingScore?.playerId === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -20, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white font-mono font-black px-2.5 py-1 rounded-full text-xs shadow-lg"
                    >
                      +{floatingScore.value}
                    </motion.div>
                  )}
                </div>

                {/* Round Info & Hotkeys (Center Column, hidden on mobile) */}
                <div className="hidden md:flex flex-col items-center text-center px-2 py-1 justify-center border-l border-r border-white/10">
                  <div className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-extrabold">ՌԱՈՒՆԴ {currentRound} / {roundsPerPlayer}</div>
                  <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                    Քայլը՝ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 font-black">{activePlayer.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2 flex gap-2">
                    <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-amber-300">1: Pasado / Անցյալ</span>
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-300">2: Presente / Ներկա</span>
                    <span className="bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-blue-300">3: Futuro / Ապառնի</span>
                  </div>
                </div>

                {/* Player 2 Box */}
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 justify-end relative text-right ${
                    activePlayerIndex === 1 
                      ? 'bg-fuchsia-500/10 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.25)]' 
                      : 'bg-[#050515]/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] px-1.5 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 rounded font-mono font-bold">Խ2</span>
                      <span className="font-bold text-sm truncate text-white">{players[1].name}</span>
                    </div>
                    <div className="text-xl font-extrabold text-fuchsia-400 font-mono flex items-center gap-1 justify-end">
                      {players[1].score} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">միավոր</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${AVATARS[player2Avatar].color} flex items-center justify-center text-2xl shadow-md border border-white/10`}>
                      {AVATARS[player2Avatar].emoji}
                    </div>
                    {activePlayerIndex === 1 && (
                      <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-fuchsia-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Floating Score effect */}
                  {floatingScore?.playerId === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -20, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white font-mono font-black px-2.5 py-1 rounded-full text-xs shadow-lg"
                    >
                      +{floatingScore.value}
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Mobile Info Overlay (Only visible on small devices) */}
              <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#0a0a23]/60 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                <span className="text-cyan-400 font-mono">Ռաունդ {currentRound} / {roundsPerPlayer}</span>
                <span className="font-semibold text-slate-200">
                  Քայլը՝ <span className="text-cyan-300 font-black">{activePlayer.name}</span>
                </span>
              </div>

              {/* ================= 3D TABLESTAGE ARENA ================= */}
              <div 
                id="three-d-arenastage" 
                className="relative py-4 px-2 md:py-8 flex flex-col items-center justify-center"
                style={{ perspective: "1200px" }}
              >
                
                {/* 3D Isometric Tilt Board */}
                <div 
                  id="table-board-perspective"
                  className="w-full max-w-2xl bg-[#090d22]/85 backdrop-blur-lg rounded-3xl p-6 md:p-8 border-2 border-cyan-500/20 shadow-[0_30px_70px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] relative"
                  style={{ 
                    transform: "rotateX(10deg) rotateY(0deg)", 
                    transformStyle: "preserve-3d" 
                  }}
                >
                  
                  {/* Subtle LED table trim */}
                  <div className={`absolute inset-x-0 top-0 h-1 rounded-full blur-[2px] transition-all duration-500 ${
                    activePlayerIndex === 0 ? 'bg-indigo-500/60' : 'bg-emerald-500/60'
                  }`} />

                  {/* Ambient 3D Depth Card Component */}
                  <div className="flex flex-col items-center">
                    
                    {/* Rotating Inner Box container */}
                    <div className="relative w-full max-w-sm aspect-[4/3] cursor-pointer group mb-6">
                      
                      {/* FLIP CARD MOTION CONTAINER */}
                      <motion.div
                        id="gameflipper-card"
                        onClick={() => {
                          if (selectedAnswer === null) {
                            speakCurrentPhrase(nextPhrase.spanish);
                          }
                        }}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-full h-full relative"
                      >
                        
                        {/* CARD FACE A: CLOSED AUDIO SIDE (PLAY VINYL) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#0c0d23] via-[#050515] to-[#0a0f2b] border-2 border-cyan-500/30 p-6 flex flex-col items-center justify-between shadow-2xl backface-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-extrabold">
                            <span>Adivina El Tiempo</span>
                            <span className="bg-cyan-950/45 px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-300">ԹՐԵՔ №{currentPhraseIndex + 1}</span>
                          </div>

                          {/* 3D Vinyl Record Spin Area */}
                          <div className="relative w-36 h-36 flex items-center justify-center">
                            
                            {/* Outer Vinyl ring */}
                            <div className={`absolute inset-0 rounded-full border-4 border-[#12132e] bg-gradient-to-br from-[#05050f] to-[#090a18] shadow-inner flex items-center justify-center ${
                              isSpeaking ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:rotate-12 transition-all duration-500'
                            }`}>
                              {/* Vinyl grooves */}
                              <div className="absolute inset-2 rounded-full border border-cyan-500/5" />
                              <div className="absolute inset-4 rounded-full border border-cyan-500/10" />
                              <div className="absolute inset-6 rounded-full border border-cyan-500/5" />
                              <div className="absolute inset-10 rounded-full border border-cyan-500/10" />
                              
                              {/* Center disk */}
                              <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center border border-white/20 shadow-md">
                                <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">🎵</span>
                              </div>
                            </div>

                            {/* Stylus needle overlay */}
                            <div className={`absolute -top-2 -right-2 w-10 h-16 origin-top transition-transform duration-500 ${
                              isSpeaking ? 'rotate-[20deg]' : 'rotate-0'
                            }`}
                            style={{ pointerEvents: 'none' }}
                            >
                              <div className="w-2 h-14 bg-slate-600 rounded-full border border-slate-500 shadow-lg relative">
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                              </div>
                            </div>
                          </div>

                          {/* Action Button & Waves */}
                          <div className="w-full flex flex-col items-center">
                            {isSpeaking ? (
                              <div className="flex gap-1.5 items-end justify-center h-5 mb-2">
                                <span className="w-1 bg-cyan-500 h-4 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                                <span className="w-1 bg-cyan-400 h-6 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                                <span className="w-1 bg-fuchsia-400 h-3 rounded-full animate-[bounce_0.8s_infinite_0s]" />
                                <span className="w-1 bg-cyan-400 h-7 rounded-full animate-[bounce_0.8s_infinite_400ms]" />
                                <span className="w-1 bg-cyan-500 h-4 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                              </div>
                            ) : (
                              <span className="text-xs text-cyan-400 font-extrabold tracking-wide group-hover:text-cyan-300 transition-colors uppercase mb-1">
                                Սեղմեք լսելու համար
                              </span>
                            )}
                            
                            <div className="text-[10px] text-slate-400 text-center font-mono uppercase mt-1">
                              ԽԱՂԱՑՈՂԻ ՌԱՈՒՆԴԸ. <strong className="text-cyan-300">{activePlayer.name}</strong>
                            </div>
                          </div>

                        </div>

                        {/* CARD FACE B: OPENED PHRASE REVEALED (REVERSE SIDE) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-2xl bg-[#0b0c20] border-2 border-fuchsia-500/40 p-5 flex flex-col justify-between shadow-2xl shadow-[0_10px_30px_rgba(232,121,249,0.15)]"
                          style={{ 
                            backfaceVisibility: 'hidden', 
                            transform: "rotateY(180deg)" 
                          }}
                        >
                          <div className="w-full flex items-center justify-between text-[10px] font-mono text-fuchsia-300 uppercase font-bold">
                            <span>Նախադասության բնագիրը</span>
                            <span className="text-cyan-400 font-extrabold">ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ ԵՎ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ</span>
                          </div>

                          {/* Full Spanish phrase with translation */}
                           <div className="my-2 text-center md:px-2 flex-grow flex flex-col justify-center">
                             <blockquote className="text-base font-black text-white leading-normal mb-2 italic">
                               "{nextPhrase.spanish}"
                             </blockquote>
                             
                             <p className="text-xs text-cyan-300 font-semibold font-medium">
                               🗣️ "{nextPhrase.armenian}"
                             </p>
                           </div>

                          {/* Explanation summary footer */}
                           <div className="bg-[#050515]/80 border border-fuchsia-500/20 rounded-xl p-2.5 text-[11px] leading-snug text-slate-300 shadow-inner">
                             <div className="flex items-center gap-1.5 mb-1.5 flex-wrap text-[10px]">
                               <span className={`font-bold px-1.5 py-0.5 rounded uppercase font-mono border ${
                                 nextPhrase.tense === 'past' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                 nextPhrase.tense === 'present' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                                 'bg-blue-500/15 text-blue-350 border-blue-500/30'
                               }`}>
                                 ԺԱՄԱՆԱԿ՝ {' '}
                                 {nextPhrase.tense === 'past' ? 'PASADO (Անցյալ)' : 
                                  nextPhrase.tense === 'present' ? 'PRESENTE (Ներկա)' : 
                                  'FUTURO (Ապառնի)'}
                                </span>
                               <span className="text-slate-600 font-normal">|</span>
                               <span className="font-extrabold text-amber-300">Հուշում՝ {nextPhrase.clue}</span>
                             </div>
                             <p className="text-slate-300 leading-normal">{nextPhrase.explanation}</p>
                           </div>
                        </div>

                      </motion.div>
                    </div>

                    {/* INTERACTIVE MODE ONLY DETAILS (If TextClues Mode is checked) */}
                    {textCluesEnabled && selectedAnswer === null && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-neutral-950/50 p-4 rounded-xl border border-neutral-800 text-center mb-6"
                      >
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Տեքստային հուշման ռեժիմ</span>
                        <p className="text-sm font-semibold text-neutral-200">"{nextPhrase.spanish}"</p>
                      </motion.div>
                    )}

                    {/* VOICE CONTROLS */}
                    <div className="flex gap-2 mb-6">
                      <button
                        id="audio-replay-btn"
                        onClick={() => speakCurrentPhrase(nextPhrase.spanish)}
                        disabled={isSpeaking}
                        className="px-4 py-2 bg-[#0a0f2b]/80 border border-cyan-500/20 text-cyan-200 hover:bg-cyan-950/50 disabled:opacity-40 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Volume1 className="w-4 h-4 text-cyan-400 animate-pulse" />
                        Լսել կրկին (Space)
                      </button>
                    </div>

                    {/* CHOICE AREA FOR ACTIVE TURN */}
                    {selectedAnswer === null ? (
                      <div className="w-full max-w-md flex flex-col gap-3">
                        
                        <span className="text-[10px] font-mono tracking-widest text-[#a5b4fc] uppercase text-center block font-extrabold">
                          ԸՆՏՐԵՔ ՃԻՇՏ ԺԱՄԱՆԱԿԻ ՏԱՐԲԵՐԱԿԸ
                        </span>

                        <div className="grid grid-cols-3 gap-3">
                          
                          {/* 1. PAST TENSE BUTTON */}
                          <button
                            id="guess-past-btn"
                            onClick={() => handleGuess('past')}
                            className="relative filter hover:brightness-110 active:brightness-95 transition-all duration-75 active:translate-y-1"
                          >
                            <span className="absolute inset-0 bg-amber-800 rounded-xl translate-y-1 text-white"></span>
                            <span className="relative block text-center py-3 bg-gradient-to-b from-amber-500 to-amber-600 text-white rounded-xl font-black text-xs md:text-sm border border-amber-300 font-mono tracking-wide">
                              PASADO
                              <span className="block text-[10px] opacity-85 font-normal mt-0.5 font-sans">Անցյալ</span>
                            </span>
                          </button>

                          {/* 2. PRESENT TENSE BUTTON */}
                          <button
                            id="guess-present-btn"
                            onClick={() => handleGuess('present')}
                            className="relative filter hover:brightness-110 active:brightness-95 transition-all duration-75 active:translate-y-1"
                          >
                            <span className="absolute inset-0 bg-emerald-800 rounded-xl translate-y-1 text-white"></span>
                            <span className="relative block text-center py-3 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-xl font-black text-xs md:text-sm border border-emerald-300 font-mono tracking-wide">
                              PRESENTE
                              <span className="block text-[10px] opacity-85 font-normal mt-0.5 font-sans">Ներկա</span>
                            </span>
                          </button>

                          {/* 3. FUTURE TENSE BUTTON */}
                          <button
                            id="guess-future-btn"
                            onClick={() => handleGuess('future')}
                            className="relative filter hover:brightness-110 active:brightness-95 transition-all duration-75 active:translate-y-1"
                          >
                            <span className="absolute inset-0 bg-cyan-850 rounded-xl translate-y-1 border-opacity-40"></span>
                            <span className="relative block text-center py-3 bg-gradient-to-b from-cyan-500 to-blue-650 text-white rounded-xl font-black text-xs md:text-sm border border-cyan-300 font-mono tracking-wide">
                              FUTURO
                              <span className="block text-[10px] opacity-85 font-normal mt-0.5 font-sans">Ապառնի</span>
                            </span>
                          </button>

                        </div>

                      </div>
                    ) : (
                      
                      /* AFTER GUESS RESULT AREA */
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-[#040416] p-5 rounded-2xl border border-white/10 text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-fuchsia-500/5 blur-2xl"></div>

                        {isCorrect ? (
                          <div className="flex flex-col items-center gap-1.5 text-cyan-400 relative z-10">
                            <CheckCircle2 className="w-12 h-12 stroke-[2.5] text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                            <span className="text-xl font-black uppercase tracking-wider bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">ՃԻՇՏ Է՛</span>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Դուք գուշակեցիք քերականական ժամանակը: <strong className="text-cyan-300">{activePlayer.name}</strong>-ի հաշիվն ավելացավ <span className="font-extrabold text-cyan-400">100 միավորով</span>:
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-fuchsia-500 relative z-10">
                            <XCircle className="w-12 h-12 stroke-[2.5] text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.4)]" />
                            <span className="text-xl font-black uppercase tracking-wider bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-300">ՍԽԱ՛Լ</span>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Դուք ընտրեցիք՝ <strong className="text-fuchsia-400 uppercase font-mono font-black">{selectedAnswer === 'past' ? 'Անցյալ' : selectedAnswer === 'present' ? 'Ներկա' : 'Ապառնի'}</strong>: <br />
                              Իսկ իրականում դա <strong className="text-cyan-400 uppercase font-mono font-black">
                                {nextPhrase.tense === 'past' ? 'Անցյալ (Pasado)' : nextPhrase.tense === 'present' ? 'Ներկա (Presente)' : 'Ապառնի (Futuro)'}
                              </strong> էր:
                            </p>
                          </div>
                        )}

                        <div className="w-full h-[1px] bg-white/10 my-4 relative z-10" />

                        {/* NEXT TURN ACTIONS */}
                        <button
                          id="conclude-turn-btn"
                          onClick={nextTurn}
                          className="w-full relative group flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:translate-y-1 hover:scale-[1.01] z-10"
                        >
                          <span className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></span>
                          <span className="absolute inset-0 bg-cyan-800 rounded-xl translate-y-1 shadow-[0_4px_15px_rgba(6,182,212,0.3)]"></span>
                          <span className="relative w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black tracking-wide rounded-xl border border-cyan-400 flex items-center justify-center gap-2 uppercase [transform:translateY(0)] group-active:[transform:translateY(4px)] transition-all">
                            {currentPhraseIndex + 1 >= gamePhrases.length ? (
                              <>
                                <Award className="w-4 h-4 text-amber-300 animate-bounce" />
                                ԱՎԱՐՏԵԼ ԽԱՂԸ
                              </>
                            ) : (
                              <>
                                Փոխանցել քայլը. {players[activePlayerIndex === 0 ? 1 : 0].name}
                                <ArrowRight className="w-4 h-4 text-cyan-200" />
                              </>
                            )}
                          </span>
                        </button>
                      </motion.div>
                      
                    )}

                  </div>

                </div>

                {/* Simulated 3D table floor reflection shadow */}
                <div className="w-full max-w-xl h-10 bg-cyan-500/5 blur-3xl rounded-full mt-4" style={{ pointerEvents: 'none' }} />

              </div>

              {/* RECENT ROUND ANSWERS MAP */}
              {history.length > 0 && (
                <div id="game-round-history" className="bg-[#0a0a23]/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                  <h4 className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-black mb-3 text-center">Անցած ռաունդների արձանագրություն</h4>
                  <div className="grid gap-2 max-h-36 overflow-y-auto pr-1">
                    {history.map((record, index) => {
                      const p = players.find(x => x.id === record.activePlayerId);
                      return (
                        <div 
                          key={`hist-rec-${index}`} 
                          className="flex items-center justify-between p-2 bg-[#050515]/60 rounded-xl border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold">#{record.number}</span>
                            <span className="font-bold text-white truncate">{p?.name}</span>
                            <span className="text-slate-400 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-md italic">"{record.phrase.spanish}"</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-1.5 py-0.5 rounded font-mono uppercase text-[9px] font-bold ${
                              record.phrase.tense === 'past' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                              record.phrase.tense === 'present' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                              'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            }`}>
                              {record.phrase.tense === 'past' ? 'Pasado / Անցյալ' : record.phrase.tense === 'present' ? 'Presente / Ներկա' : 'Futuro / Ապառնի'}
                            </span>
                            
                            {record.isCorrect ? (
                              <span className="text-cyan-400 font-black text-xs flex items-center gap-0.5">
                                <span className="text-sm">✓</span> +100
                              </span>
                            ) : (
                              <span className="text-fuchsia-400 font-extrabold text-xs">
                                ✗ 0
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ================= PHASE 3: GAME OVER PODIUM ================= */}
          {phase === 'game_over' && (
            <motion.div
              key="gameover-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto w-full bg-[#0a0a23]/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Confetti styling glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-10 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-[70px]" />
              
              <div className="text-center relative z-10">
                
                <span className="text-5xl animate-bounce block mb-4">🏆</span>
                
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-black">ՄԵՆԱՄԱՐՏՆ ԱՎԱՐՏՎԱԾ Է</span>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1 mb-2 bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                  Վերջնական արդյունքը
                </h2>

                {/* Winner Declaration Box */}
                <div className="my-6 p-5 rounded-2xl bg-[#050515]/80 border border-cyan-500/20 shadow-2xl inline-block w-full max-w-md">
                  {isDraw ? (
                    <div>
                      <span className="text-2xl font-bold text-amber-400 font-sans">🤝 Ոչ-ոքի՛</span>
                      <p className="text-xs text-slate-350 mt-1">Երկու մենամարտիկներն էլ հավաքեցին հավասար միավորներ՝ <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{players[0].score}</span>:</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">ԳԱՎԱԹԱԿԻՐ ՀԱՂԹՈՂԸ.</span>
                      
                      <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 px-5 py-3 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <span className="text-3xl animate-pulse">👑</span>
                        <div className="text-left">
                          <span className="font-black text-lg text-white block leading-tight">{winner?.name}</span>
                          <span className="text-xs text-cyan-300 font-mono">Հաշիվը՝ {winner?.score} միավոր</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score breakdown comparison */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                  
                  {/* Player 1 summary */}
                  <div className="p-4 rounded-xl bg-[#050515]/40 border border-[#22d3ee]/20 text-center shadow-lg">
                    <span className="text-xs text-cyan-400 font-bold block mb-1">{players[0].name}</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono">{players[0].score}</span>
                    <span className="block text-[10px] text-slate-500 uppercase font-mono mt-1">Խ1-ի միավորները</span>
                  </div>

                  {/* Player 2 summary */}
                  <div className="p-4 rounded-xl bg-[#050515]/40 border border-[#f553f1]/20 text-center shadow-lg">
                    <span className="text-xs text-fuchsia-400 font-bold block mb-1">{players[1].name}</span>
                    <span className="text-2xl font-black text-fuchsia-300 font-mono">{players[1].score}</span>
                    <span className="block text-[10px] text-slate-500 uppercase font-mono mt-1">Խ2-ի միավորները</span>
                  </div>

                </div>

                {/* History list for reviews */}
                <div className="bg-[#050515]/60 p-4 rounded-2xl border border-white/10 text-left max-w-md mx-auto mb-8 shadow-inner">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 text-center">Ձեր անցման վիճակագրությունը</h3>
                  <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Ընդհանուր խաղարկված նախադասություններ՝</span>
                      <span className="text-white font-bold">{history.length}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Ճիշտ պատասխաններ՝</span>
                      <span className="text-cyan-400 font-black">
                        {history.filter(x => x.isCorrect).length} {history.length ? `${history.length}-ից` : ''} ({history.length ? Math.round((history.filter(x => x.isCorrect).length / history.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Թույլ տրված սխալներ՝</span>
                      <span className="text-fuchsia-400 font-bold">{history.filter(x => !x.isCorrect).length}</span>
                    </div>
                  </div>
                </div>

                {/* Restart game actions */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button
                    id="play-again-btn"
                    onClick={startGame}
                    className="relative group flex items-center justify-center cursor-pointer transition-all duration-300 active:translate-y-1 hover:scale-[1.02]"
                  >
                    <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-xl blur opacity-60"></span>
                    <span className="absolute inset-0 bg-cyan-800 rounded-xl translate-y-1 shadow-[0_4px_15px_rgba(6,182,212,0.4)]"></span>
                    <span className="relative px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-650 text-white font-black tracking-wide rounded-xl border border-cyan-300 flex items-center justify-center gap-2 uppercase [transform:translateY(0)] group-active:[transform:translateY(4px)] transition-all text-xs sm:text-sm">
                      <RefreshCw className="w-4 h-4 text-cyan-100" />
                      Ռևանշ (Նույն կազմով)
                    </span>
                  </button>

                  <button
                    id="setup-again-btn"
                    onClick={resetGameToSetup}
                    className="px-6 py-4 bg-[#0a0f2b]/80 border border-cyan-500/20 text-cyan-200 hover:bg-cyan-950/50 text-xs sm:text-sm font-black tracking-wide rounded-xl transition-all flex items-center gap-1.5 uppercase shadow-md hover:scale-[1.02] active:translate-y-1 cursor-pointer"
                  >
                    Խաղացողների կարգավորումներ
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* COMPACT FOOOTER BAR */}
      <footer id="game-footer" className="py-4 border-t border-white/10 bg-[#040416] text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-400">Adivina el Tiempo • Իսպաներենի քերականական մենամարտ</span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded font-mono font-sans">
              Ստեղներ՝ [1] Pasado [2] Presente [3] Futuro [Space] Լսել
            </span>
            <span>2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
