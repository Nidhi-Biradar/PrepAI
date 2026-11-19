import React, { useState } from "react";
import { 
  Map, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Compass, 
  Sparkles, 
  RefreshCw,
  CheckSquare,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";
import { PersonalizedRoadmap, ResumeProfile, DifficultyLevel, HistoryItem } from "../types";

interface RoadmapGeneratorProps {
  currentRoadmap: PersonalizedRoadmap | null;
  resume: ResumeProfile | null;
  onRoadmapGenerated: (roadmap: PersonalizedRoadmap) => void;
  onUpdateTopicStatus: (topicId: string, subtaskId: string, done: boolean) => void;
  onAddToHistory?: (item: HistoryItem) => void;
}

export default function RoadmapGenerator({
  currentRoadmap,
  resume,
  onRoadmapGenerated,
  onUpdateTopicStatus,
  onAddToHistory
}: RoadmapGeneratorProps) {
  const [role, setRole] = useState(resume?.skills?.[0] ? `${resume.skills[0]} Engineer` : "Full-Stack Engineer");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Junior");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Synchronize and reset internal state if parent resume data is reset
  React.useEffect(() => {
    if (!resume) {
      setRole("Full-Stack Engineer");
      setDifficulty("Junior");
    } else {
      setRole(resume.skills?.[0] ? `${resume.skills[0]} Engineer` : "Full-Stack Engineer");
    }
  }, [resume]);

  const handleGenerate = async (overrideLevel?: DifficultyLevel) => {
    const selectedLevel = overrideLevel || difficulty;
    if (overrideLevel) setDifficulty(overrideLevel);
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          difficulty: selectedLevel,
          skills: resume?.skills || [],
          gaps: resume?.identifiedGaps || [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Roadmap engine is temporarily unavailable.");
      }

      const generated: PersonalizedRoadmap = {
        ...data.roadmap,
        createdAt: new Date().toISOString(),
      };

      onRoadmapGenerated(generated);

      // Log to history
      if (onAddToHistory) {
        onAddToHistory({
          id: `roadmap_${Date.now()}`,
          type: "roadmap",
          title: `${role} (${selectedLevel}) Roadmap`,
          timestamp: new Date().toISOString(),
          snippet: `${generated.topics.length} easy-to-follow stages for ${selectedLevel} level.`,
          roadmapData: generated,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Could not create your study roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Math calculated values for status check
  const getProgressMath = () => {
    if (!currentRoadmap) return { done: 0, total: 0, percent: 0 };
    let done = 0;
    let total = 0;
    currentRoadmap.topics.forEach(t => {
      t.subtasks.forEach(s => {
        total++;
        if (s.done) done++;
      });
    });
    const percent = Math.round((done / total) * 100) || 0;
    return { done, total, percent };
  };

  const { done, total, percent } = getProgressMath();

  return (
    <div id="roadmap_container" className="space-y-8 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Curated Syllabus</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-400">Interactive Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2.5">
            <Map className="text-purple-400 w-7 h-7 shrink-0" /> Personalized Study Roadmaps
          </h1>
          <p className="text-sm text-slate-400 font-sans-clean max-w-2xl">
            Syllabus matching curated around your exact gaps and strengths, helping you master core technical competencies step by step.
          </p>
        </div>

        {resume && !currentRoadmap && (
          <div className="inline-flex items-center gap-2.5 bg-purple-500/15 border border-purple-500/30 px-3.5 py-2 rounded-xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-purple-300 font-semibold font-sans-clean">Resume context ready</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Creation Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-display">
              <Compass className="w-4.5 h-4.5 text-purple-400" /> Roadmap Strategy
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase tracking-wider font-display">Target Role / Subject</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Node Developer"
                className="w-full bg-[#0e111d] focus:bg-[#111422] border border-purple-500/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase tracking-wider font-display">Experience Level</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#0e111d] rounded-xl border border-slate-800">
                {(["Junior", "Mid", "Senior"] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setDifficulty(level);
                      if (currentRoadmap) {
                        handleGenerate(level);
                      }
                    }}
                    className={`text-xs py-2 rounded-lg cursor-pointer transition-all duration-150 font-semibold ${
                      difficulty === level
                        ? "bg-purple-600 text-white shadow-xs font-bold border border-purple-400/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-sans-clean leading-relaxed pt-1">
                {difficulty === "Junior"
                  ? "Junior: Step-by-step basics in simple everyday words."
                  : difficulty === "Mid"
                    ? "Mid: Building faster, safer apps on your own."
                    : "Senior: Keeping big systems reliable and guiding teams."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-200 cursor-pointer text-xs disabled:opacity-50 active:scale-[0.98] shadow-md shadow-purple-950/60 border border-white/10"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Building Simple Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  Curate My Roadmap
                </>
              )}
            </button>
          </div>

          {/* Stats recap if present */}
          {currentRoadmap && (
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/20">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Progress Metrics</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tasks Completed</span>
                <span className="font-mono text-white font-bold">{done} / {total}</span>
              </div>
              <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-purple-500/20">
                <div 
                  className="bg-gradient-to-r from-violet-500 via-pink-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-xs text-purple-400 text-right font-bold uppercase tracking-wider">{percent}% Completed</div>
            </div>
          )}
        </div>

        {/* Action Board */}
        <div className="lg:col-span-3">
          {!currentRoadmap ? (
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center space-y-4 shadow-xl shadow-black/20">
              <div className="w-16 h-16 bg-purple-500/15 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/30">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-white text-base font-display">No Active Roadmap Loaded</h3>
                <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
                  Choose your target subject and difficulty level on the left, then click "Curate My Roadmap" to build your custom milestone schedule.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stepper info banner */}
              <div className="bg-[#181c2e] border border-purple-500/25 rounded-2xl p-5 shadow-lg space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white font-display">Target Track: {currentRoadmap.role}</h4>
                    <p className="text-xs text-purple-300 font-sans-clean font-semibold">{currentRoadmap.targetDifficulty} Level · Written in Plain Basic English</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/30 shrink-0">
                    Syllabus Ready
                  </div>
                </div>
                {currentRoadmap.levelNote && (
                  <p className="text-xs text-slate-300 font-sans-clean leading-relaxed border-t border-purple-500/15 pt-2">
                    {currentRoadmap.levelNote}
                  </p>
                )}
              </div>

              {/* Timeline Items */}
              <div className="space-y-6 relative pl-6 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-0.5 before:bg-purple-500/30">
                {currentRoadmap.topics.map((topic, topicIdx) => {
                  const stagePastels = [
                    "bg-purple-500/20 text-purple-300 border-purple-500/30",
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                    "bg-sky-500/20 text-sky-300 border-sky-500/30",
                    "bg-amber-500/20 text-amber-300 border-amber-500/30",
                  ];
                  const stageStyle = stagePastels[topicIdx % stagePastels.length];

                  return (
                    <motion.div 
                      key={topic.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: topicIdx * 0.05 }}
                      className="relative space-y-3"
                    >
                      {/* Stepper node circle */}
                      <span className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-[#141724] border-4 border-purple-500 z-10 shadow-xs" />

                      <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/20 hover:border-purple-400/50 transition-all">
                        {/* Topic Title Area */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${stageStyle}`}>
                                Stage {topicIdx + 1} · {topic.timeline}
                              </span>
                              {topic.subtasks.every(s => s.done) && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider">
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Stage Complete
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-extrabold text-white font-display">{topic.title}</h3>
                          </div>
                        </div>

                        {topic.simpleSummary && (
                          <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 font-sans-clean">
                            <strong>In simple words:</strong> {topic.simpleSummary}
                          </div>
                        )}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans-clean">{topic.description}</p>

                        {/* Tactile Task list with plain-English explanations */}
                        <div className="space-y-2.5 border-t border-purple-500/15 pt-4">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Step-by-Step Tasks (With Simple Explanations)</div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {topic.subtasks.map((task) => (
                              <button
                                key={task.id}
                                onClick={() => onUpdateTopicStatus(topic.id, task.id, !task.done)}
                                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 shadow-xs ${
                                  task.done 
                                    ? "bg-purple-950/30 border-purple-500/40 text-purple-200" 
                                    : "bg-[#0e111d] border-slate-800 text-slate-200 hover:bg-[#171b2d] hover:border-purple-500/30"
                                }`}
                              >
                                {task.done ? (
                                  <CheckCircle2 className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5 hover:text-purple-400" />
                                )}
                                <div className="space-y-1">
                                  <div className={`text-xs font-bold leading-snug font-sans-clean ${task.done ? "line-through text-purple-300/80" : "text-white"}`}>
                                    {task.title}
                                  </div>
                                  {task.explanation && (
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans-clean flex items-start gap-1.5">
                                      <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                                      <span>{task.explanation}</span>
                                    </p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Learning resources */}
                        {topic.resources && topic.resources.length > 0 && (
                          <div className="bg-[#0e111d] p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
                              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Suggested Resources
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {topic.resources.map((res, i) => (
                                <span 
                                  key={i}
                                  className="text-[11px] bg-[#171a2b] text-slate-300 rounded-md px-2 py-0.5 border border-purple-500/20 font-mono"
                                >
                                  {res}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
