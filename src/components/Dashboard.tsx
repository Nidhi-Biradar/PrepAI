import React from "react";
import { 
  FileText, 
  Map, 
  Sparkles, 
  Award, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  BrainCircuit, 
  Terminal, 
  History,
  BookOpen,
  Target
} from "lucide-react";
import { motion } from "motion/react";
import { ResumeProfile, PersonalizedRoadmap } from "../types";

interface DashboardProps {
  sessions: any[];
  resume: ResumeProfile | null;
  roadmap: PersonalizedRoadmap | null;
  historyCount?: number;
  onNavigate: (tab: string) => void;
  onLoadSession: (session: any) => void;
}

export default function Dashboard({ 
  resume, 
  roadmap, 
  historyCount = 0,
  onNavigate 
}: DashboardProps) {
  
  // Roadmap Math
  const getRoadmapProgress = () => {
    if (!roadmap) return { done: 0, total: 0, percent: 0 };
    let done = 0;
    let total = 0;
    roadmap.topics.forEach(t => {
      t.subtasks.forEach(s => {
        total++;
        if (s.done) done++;
      });
    });
    const percent = Math.round((done / total) * 100) || 0;
    return { done, total, percent };
  };

  const { done, total, percent } = getRoadmapProgress();

  return (
    <div id="dashboard_view" className="space-y-10 max-w-6xl mx-auto">
      
      {/* Immersive Dreamy Dark Hero Banner with Pastel Meshes */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#161a2b] via-[#141724] to-[#1a1528] border border-purple-500/25 rounded-3xl p-7 sm:p-11 shadow-2xl shadow-purple-950/40"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-0" />
        <div className="absolute -bottom-10 left-10 w-64 h-64 bg-pink-600/10 rounded-full blur-[90px] pointer-events-none -z-0" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sky-600/10 rounded-full blur-[110px] pointer-events-none -z-0" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1a1e32] text-purple-300 border border-purple-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Client-Side PDF Synthesis & Roadmaps</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.2] font-display">
              Accelerate your prep journey with <span className="font-editorial italic font-normal text-purple-400 underline decoration-pink-400 decoration-wavy underline-offset-4">prep</span>.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans-clean">
              Isolate syllabus knowledge gaps, upgrade resumes with verified technical skills, and build structured milestone checklists.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
            <button
              id="dash-upload-btn"
              onClick={() => onNavigate("resume")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-950/60 cursor-pointer text-sm active:scale-95 border border-white/10"
            >
              <FileText className="w-4.5 h-4.5" />
              Upload Document
            </button>
            <button
              id="dash-roadmap-btn"
              onClick={() => onNavigate("roadmap")}
              className="inline-flex items-center justify-center gap-2 bg-[#1b2033] hover:bg-[#232942] text-purple-200 border border-purple-500/30 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-sm active:scale-95 shadow-xs"
            >
              <Map className="w-4.5 h-4.5 text-purple-400" />
              Study Roadmap
            </button>
          </div>
        </div>
      </motion.div>

      {/* Pastel Metric Stat Cards in Dark Slate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            label: "ATS Match Rating",
            value: resume?.overallMatchScore ? `${resume.overallMatchScore}%` : "--",
            desc: resume ? "Audited & scored" : "Upload document to score",
            icon: Award,
            cardBg: "bg-[#141724]/90 border-purple-500/25 hover:border-purple-500/40",
            iconBg: "text-purple-300 bg-purple-500/15 border-purple-500/30",
            valueColor: "text-purple-300",
          },
          {
            label: "Identified Skills",
            value: resume?.skills ? resume.skills.length : 0,
            desc: resume ? "Competencies extracted" : "Pending document scan",
            icon: BrainCircuit,
            cardBg: "bg-[#141724]/90 border-emerald-500/25 hover:border-emerald-500/40",
            iconBg: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
            valueColor: "text-emerald-300",
          },
          {
            label: "Roadmap Milestones",
            value: total > 0 ? `${percent}%` : "--",
            desc: total > 0 ? `${done}/${total} tasks finished` : "Pending roadmap plan",
            icon: Map,
            cardBg: "bg-[#141724]/90 border-sky-500/25 hover:border-sky-500/40",
            iconBg: "text-sky-300 bg-sky-500/15 border-sky-500/30",
            valueColor: "text-sky-300",
          },
          {
            label: "Saved Activity",
            value: historyCount > 0 ? `${historyCount}` : resume ? "1 Active" : "0",
            desc: historyCount > 0 ? `${historyCount} items in History` : "Archive empty",
            icon: History,
            cardBg: "bg-[#141724]/90 border-amber-500/25 hover:border-amber-500/40",
            iconBg: "text-amber-300 bg-amber-500/15 border-amber-500/30",
            valueColor: "text-amber-300",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all duration-200 ${item.cardBg}`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{item.label}</span>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${item.valueColor}`}>{item.value}</div>
              <p className="text-xs text-slate-400 font-sans-clean font-medium">{item.desc}</p>
            </div>
            <div className={`p-3 rounded-2xl border ${item.iconBg} shadow-inner`}>
              <item.icon className="w-5.5 h-5.5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Track Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Essential Workspaces */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <Zap className="w-4.5 h-4.5 text-purple-400" /> Interactive Workspaces
            </h2>
            <span className="text-xs text-slate-400 font-sans-clean">Select any track to begin</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* ATS Scan & Upgrader Track */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-[#141724]/90 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-6 flex flex-col justify-between h-56 cursor-pointer group shadow-lg shadow-purple-950/30 transition-all duration-200 relative overflow-hidden"
              onClick={() => onNavigate("resume")}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Zero Fake Skills
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors font-display">
                  ATS Scan & Upgrader
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                  Scan your resume against ATS benchmarks, review keyword alignment, and download an ATS-upgraded PDF preserving your real content.
                </p>
              </div>
              <div className="text-purple-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-2">
                Scan & Upgrade CV <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* Target Role Gap Checker Track */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-[#141724]/90 border border-sky-500/30 hover:border-sky-400/60 rounded-2xl p-6 flex flex-col justify-between h-56 cursor-pointer group shadow-lg shadow-sky-950/30 transition-all duration-200"
              onClick={() => onNavigate("role-gap")}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full">
                    Checkboxes & Fixes
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base group-hover:text-sky-300 transition-colors font-display">
                  Role Gap Checker
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                  Type any target role you're applying for. Benchmark your resume, complete interactive checkboxes, and read targeted corrections.
                </p>
              </div>
              <div className="text-sky-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-2">
                Check Gaps for My Target Role <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* Personalized Roadmap Track */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-[#141724]/90 border border-emerald-500/25 hover:border-emerald-400/50 rounded-2xl p-6 flex flex-col justify-between h-56 cursor-pointer group shadow-lg shadow-emerald-950/20 transition-all duration-200"
              onClick={() => onNavigate("roadmap")}
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-inner group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-white text-base group-hover:text-emerald-300 transition-colors font-display">
                  Study Roadmap Generator
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                  Curate interactive 4-stage study schedules customized to your target engineering level with verified checklists.
                </p>
              </div>
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-2">
                {roadmap ? "Interact with Schedule" : "Create Roadmap"} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* Upload History Track */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-[#141724]/90 border border-sky-500/25 hover:border-sky-400/50 rounded-2xl p-6 flex flex-col justify-between h-56 cursor-pointer group shadow-lg shadow-sky-950/20 transition-all duration-200"
              onClick={() => onNavigate("history")}
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:scale-105 transition-transform">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-white text-base group-hover:text-sky-300 transition-colors font-display">
                  Upload & Activity History
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                  Review all previously uploaded files, analyzed resumes, and role gap audits with instant reload.
                </p>
              </div>
              <div className="text-sky-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-2">
                Browse Upload History <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

          </div>
        </div>

        {/* Right Column - Status and Syllabus Overview */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <TrendingUp className="w-4.5 h-4.5 text-purple-400" /> Current Milestone
          </h2>

          <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-5 shadow-lg shadow-black/20">
            {!roadmap ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 bg-purple-500/15 rounded-2xl flex items-center justify-center mx-auto text-purple-400 border border-purple-500/30">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white font-display">No active roadmap loaded</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-sans-clean">
                    Upload a syllabus or select target skills to generate a study checklist.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate("roadmap")}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  Create roadmap <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Syllabus</div>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#0e111d] border border-purple-500/20">
                    <div className="text-xs font-bold text-white truncate mb-1 font-display">{roadmap.role}</div>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-sans-clean">
                      <span>Level: {roadmap.targetDifficulty}</span>
                      <span className="text-purple-300 font-bold">{percent}% Done</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-3 border border-purple-500/20">
                      <div className="bg-gradient-to-r from-violet-500 via-pink-400 to-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1 font-mono">Stages & Subtasks</div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {roadmap.topics.map((topic, id) => {
                      const doneTasks = topic.subtasks.filter(s => s.done).length;
                      const totalTasks = topic.subtasks.length;
                      return (
                        <div key={id} className="p-3 rounded-lg bg-[#0e111d] border border-slate-800 flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1 pr-3">
                            <span className="text-[9px] font-bold text-purple-300 font-mono bg-purple-500/20 px-1.5 py-0.5 rounded mr-1.5 border border-purple-500/30">{topic.timeline}</span>
                            <span className="text-slate-300 font-medium truncate inline-block max-w-[130px] align-middle">{topic.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">{doneTasks}/{totalTasks}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate("roadmap")}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold border border-purple-500/30 text-purple-300 hover:bg-purple-500/15 transition-all cursor-pointer block"
                >
                  View Full Roadmap
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
