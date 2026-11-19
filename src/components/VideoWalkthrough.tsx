import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  Map, 
  FileText, 
  Compass, 
  History, 
  Zap, 
  Clock, 
  ChevronRight,
  Subtitles,
  FastForward,
  Award,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoWalkthroughProps {
  onNavigateToTab?: (tab: string) => void;
}

interface Chapter {
  id: number;
  title: string;
  timestamp: number; // in seconds
  duration: number; // in seconds
  subtitle: string;
  tag: string;
  color: string;
  description: string;
}

export default function VideoWalkthrough({ onNavigateToTab }: VideoWalkthroughProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const TOTAL_DURATION = 140; // 2 minutes 20 seconds

  const chapters: Chapter[] = [
    {
      id: 1,
      title: "Uploading Syllabus & CV",
      timestamp: 0,
      duration: 28,
      tag: "Step 01",
      color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      subtitle: "Drop your PDF course notes or CV for instant client-side parsing without data leaving your browser.",
      description: "Learn how to drop .pdf or plain text files to extract full technical curriculum.",
    },
    {
      id: 2,
      title: "AI Skill & Tech Gap Analysis",
      timestamp: 28,
      duration: 28,
      tag: "Step 02",
      color: "text-pink-400 bg-pink-500/20 border-pink-500/30",
      subtitle: "Discover your ATS alignment score, isolate missing frameworks, and read recruiter-ready suggestions.",
      description: "See the automated ATS scoring engine evaluate competencies against industry benchmarks.",
    },
    {
      id: 3,
      title: "Curating Study Roadmaps",
      timestamp: 56,
      duration: 28,
      tag: "Step 03",
      color: "text-sky-400 bg-sky-500/20 border-sky-500/30",
      subtitle: "Select Junior, Mid, or Senior difficulty to build a 4-stage tailored milestone calendar.",
      description: "Watch how customized stage topics and core learning resources are curated automatically.",
    },
    {
      id: 4,
      title: "Interactive Checklists & Subtasks",
      timestamp: 84,
      duration: 28,
      tag: "Step 04",
      color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      subtitle: "Tick off completed subtasks to advance your progress gauge in real-time as you study.",
      description: "Track your study momentum and celebrate milestone completions with interactive states.",
    },
    {
      id: 5,
      title: "Session History & 1-Click Reset",
      timestamp: 112,
      duration: 28,
      tag: "Step 05",
      color: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      subtitle: "Restore past uploads from the History tab, download corrected PDFs, and reset for your next subject.",
      description: "Manage your archived files safely and clear your active workspace whenever finished.",
    },
  ];

  // Playback timer ticker
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Update active chapter based on currentTime
  useEffect(() => {
    const idx = chapters.findIndex(
      (c, i) =>
        currentTime >= c.timestamp &&
        (i === chapters.length - 1 || currentTime < chapters[i + 1].timestamp)
    );
    if (idx !== -1 && idx !== activeChapterIndex) {
      setActiveChapterIndex(idx);
    }
  }, [currentTime]);

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, TOTAL_DURATION));
    setCurrentTime(clamped);
  };

  const handleChapterClick = (chapter: Chapter) => {
    setCurrentTime(chapter.timestamp);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Mastery Guide</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-400">Interactive Video Walkthrough (2:20)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2.5">
            <FastForward className="w-6 h-6 text-purple-400" />
            How to Use prep Efficiently
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans-clean max-w-2xl">
            Watch the step-by-step screencast walkthrough demonstrating how to parse documents, extract gaps, generate tailored study roadmaps, and manage your upload history.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay from Start</span>
          </button>
        </div>
      </div>

      {/* Cinematic Video Player Container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl bg-[#111422] border border-purple-500/25 shadow-2xl shadow-purple-950/40 select-none group"
      >
        {/* Ambient video stage glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none -z-0" />

        {/* Video Canvas Stage (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full flex flex-col justify-between p-6 sm:p-8 overflow-hidden z-10">
          
          {/* Top Video HUD Info */}
          <div className="flex items-center justify-between text-xs text-slate-300 z-20">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${currentChapter.color}`}>
                {currentChapter.tag}
              </span>
              <span className="font-display font-bold text-sm text-white drop-shadow-xs">
                {currentChapter.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-xs">
                <Clock className="w-3 h-3 text-purple-400" />
                {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
              </span>
            </div>
          </div>

          {/* Central Animated Screencast Visuals (Changes per Chapter) */}
          <div className="relative flex-grow flex items-center justify-center my-4">
            
            {/* Animated Scene 1: Uploading Course Syllabus */}
            {activeChapterIndex === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#181c2e]/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 shadow-inner">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white font-display">Client-Side PDF Dropzone</div>
                  <div className="text-xs text-slate-400 font-mono">Parsing "Syllabus_CS204_Algorithms.pdf" (148 KB)</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-purple-500/20">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((currentTime % 28) / 28) * 120)}%` }}
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Client-Side Privacy Guaranteed
                </div>
              </motion.div>
            )}

            {/* Animated Scene 2: AI Gap & Skill Radar Analysis */}
            {activeChapterIndex === 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#181c2e]/90 border border-pink-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-bold text-white font-display">ATS Metric Diagnosis</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                    MATCH: 88%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-300">Extracted Skills</span>
                    <div className="text-xs text-white font-semibold">12 Core Concepts Found</div>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-pink-300">Identified Gaps</span>
                    <div className="text-xs text-white font-semibold">3 Prerequisites Missing</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 text-left font-mono leading-relaxed">
                  "Action: Add quantified metrics and highlight distributed Redis caching patterns."
                </div>
              </motion.div>
            )}

            {/* Animated Scene 3: Roadmap Generation */}
            {activeChapterIndex === 2 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#181c2e]/90 border border-sky-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold text-white font-display">4-Stage Milestone Roadmap</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    Difficulty: Mid-Level
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    "Stage 1: Core System Architecture & Types",
                    "Stage 2: High-Throughput REST & PostgreSQL Indexing",
                    "Stage 3: Real-Time Event Streams & Distributed Caching",
                    "Stage 4: CI/CD Packaging & Mock Interview STAR Rehearsal",
                  ].map((stage, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate font-sans-clean">{stage}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Animated Scene 4: Interactive Milestone Tasks */}
            {activeChapterIndex === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#181c2e]/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-white font-display">Checklist & Progress Gauge</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    75% COMPLETED
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="line-through opacity-80">Master TypeScript Generics & Discriminated Unions</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="line-through opacity-80">Set up Redis key-value caching layer with TTL expiration</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center gap-3 text-xs text-slate-300">
                    <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />
                    <span>Package multi-stage Dockerfile for Cloud Run</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Animated Scene 5: History Archive & Reset */}
            {activeChapterIndex === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#181c2e]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white font-display">Upload Archive & Clean Reset</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Archived Privately
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="font-bold text-white">Fullstack_Curriculum.pdf</div>
                    <div className="text-[10px] text-slate-400">185 KB · 12 Skills · 88% Match</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 shrink-0">
                    Load Session
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                  <span>Done studying? 1-Click Reset active workspace</span>
                  <span className="font-bold text-rose-400 underline">Start Fresh</span>
                </div>
              </motion.div>
            )}

            {/* Play / Pause Big Centered Overlay Button */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-950/60 hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-white/20 z-30"
                title="Play Walkthrough Video"
              >
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </motion.button>
            )}
          </div>

          {/* Closed Captions Subtitle Overlay */}
          {showCaptions && (
            <div className="text-center z-20 py-2">
              <span className="inline-block bg-black/75 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-1.5 rounded-full border border-white/10 font-sans-clean shadow-lg max-w-2xl">
                {currentChapter.subtitle}
              </span>
            </div>
          )}

          {/* Bottom Player Controls Deck */}
          <div className="space-y-2 z-20 pt-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 pb-4">
            
            {/* Scrubber Bar with chapter tick markers */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                handleSeek(ratio * TOTAL_DURATION);
              }}
              className="relative w-full h-2 bg-slate-700/60 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden group/bar"
            >
              {/* Progress fill with pastel gradient */}
              <div 
                className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-pink-400 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Chapter division ticks */}
              {chapters.map((ch, i) => (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                  style={{ left: `${(ch.timestamp / TOTAL_DURATION) * 100}%` }}
                  title={ch.title}
                />
              ))}
            </div>

            {/* Controls Bar Buttons */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              {/* Left: Play/Pause, Replay, Time */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-[11px] text-slate-300">
                  {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
                </span>
              </div>

              {/* Right: Captions, Speed, Mute, Fullscreen */}
              <div className="flex items-center gap-2">
                {/* CC Toggle */}
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors border ${
                    showCaptions 
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                      : "text-slate-400 border-transparent hover:text-white hover:bg-white/10"
                  }`}
                  title="Toggle Closed Captions (Subtitles)"
                >
                  CC
                </button>

                {/* Playback Speed */}
                <button
                  onClick={() => {
                    const speeds = [1, 1.25, 1.5, 2];
                    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                    setPlaybackSpeed(speeds[nextIdx]);
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {/* Audio toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Chapter Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Video Chapters</span>
          <span className="text-xs text-slate-500">Click any chapter to jump directly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            return (
              <button
                key={ch.id}
                onClick={() => handleChapterClick(ch)}
                className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all duration-200 space-y-1.5 ${
                  isActive 
                    ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg shadow-purple-950/30" 
                    : "bg-[#141724]/70 border-slate-800/80 hover:bg-[#1b2033] hover:border-purple-500/25 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold ${isActive ? "text-purple-300" : "text-slate-500"}`}>{ch.tag}</span>
                  <span className="text-slate-500">{formatTime(ch.timestamp)}</span>
                </div>
                <div className={`text-xs font-bold truncate font-display ${isActive ? "text-white" : "text-slate-300"}`}>
                  {ch.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pro Efficiency Shortcuts Cheat-Sheet */}
      <div className="bg-[#141724]/80 rounded-2xl border border-purple-500/20 p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-display text-white text-base">3 Pro Habits to Use prep 3x Faster</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 font-sans-clean">
          <div className="p-4 rounded-xl bg-[#0e111d] border border-slate-800 space-y-1.5">
            <span className="text-purple-400 font-bold font-mono">01. Paste Outlines Directly</span>
            <p className="text-slate-400 leading-relaxed">
              If your syllabus is long, copy the table of contents or course outline and paste into the text box for immediate laser-focused roadmapping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e111d] border border-slate-800 space-y-1.5">
            <span className="text-pink-400 font-bold font-mono">02. Switch Subjects in History</span>
            <p className="text-slate-400 leading-relaxed">
              Studying for multiple exams? Keep all course syllabuses in History and click "Load into Session" to swap your entire active checklist in 1 click.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e111d] border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold font-mono">03. Reset & Start Clean</span>
            <p className="text-slate-400 leading-relaxed">
              When an exam or interview round is over, use the Reset button to clear your workspace for a fresh mental slate without losing your past uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
