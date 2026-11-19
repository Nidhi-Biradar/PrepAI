import React, { useState } from "react";
import { 
  Sparkles, 
  Upload, 
  RotateCcw, 
  History, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  Compass, 
  HelpCircle,
  Lightbulb,
  Play,
  ListOrdered,
  Target
} from "lucide-react";
import { motion } from "motion/react";
import VideoWalkthrough from "./VideoWalkthrough";

interface GuideTabProps {
  onNavigate: (tab: string) => void;
  onLoadSampleData: () => void;
  onTriggerReset: () => void;
}

export default function GuideTab({
  onNavigate,
  onLoadSampleData,
  onTriggerReset,
}: GuideTabProps) {
  const [guideMode, setGuideMode] = useState<"video" | "steps">("video");

  const steps = [
    {
      num: "01",
      title: "Scan & Upgrade Your Resume for ATS",
      subtitle: "ATS Keywords & Authentic PDF Export",
      description:
        "Switch to ATS Scan. Upload your resume to check your ATS match score, inspect key gaps, and download a clean ATS-upgraded PDF keeping your exact real experience and skills as-is.",
      icon: Sparkles,
      tabTarget: "resume",
      actionText: "Open ATS Scan",
      iconBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      accentText: "text-purple-400",
    },
    {
      num: "02",
      title: "Find Gaps for Any Target Job Role",
      subtitle: "Role-Specific Benchmarks & Checkboxes",
      description:
        "Head to Role Gap Checker. Choose or type any role you are applying for. prep audits your resume strictly against that role's hiring criteria, extracts missing technical requirements, provides an interactive checkbox list, and guides your corrections.",
      icon: Target,
      tabTarget: "role-gap",
      actionText: "Check Role Gaps",
      iconBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      accentText: "text-sky-400",
    },
    {
      num: "03",
      title: "Generate a Personalized Study Roadmap",
      subtitle: "Tailored to Your Target Level",
      description:
        "Switch to Study Roadmap. Pick your target role and difficulty (Junior, Mid, or Senior). prep structures a 4-stage study plan with checklists, timelines, and verified learning resources.",
      icon: Compass,
      tabTarget: "roadmap",
      actionText: "Create a Roadmap",
      iconBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      accentText: "text-sky-400",
    },
    {
      num: "04",
      title: "Track Milestones & Mark Progress",
      subtitle: "Interactive Subtasks",
      description:
        "As you study, tick off subtasks. Your dashboard metrics update live, giving you visible momentum and completion stats for each subject milestone.",
      icon: CheckCircle2,
      tabTarget: "dashboard",
      actionText: "Check Dashboard Progress",
      iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accentText: "text-emerald-400",
    },
    {
      num: "05",
      title: "Access Upload History & Reset Workspace",
      subtitle: "Safe Archive & Clean Slate",
      description:
        "All your analyzed resumes, role gap audits, and study roadmaps are securely archived in the History tab so you can re-load them anytime. When you finish a subject, use 'Reset Session' to start clean for your next goal.",
      icon: History,
      tabTarget: "history",
      actionText: "Explore Upload History",
      iconBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      accentText: "text-amber-400",
    },
  ];

  const faqs = [
    {
      q: "What file formats does prep support?",
      a: "prep supports standard PDF files (.pdf) and plain text documents (.txt, .md). You can also paste text directly into the editor.",
    },
    {
      q: "Can I switch between multiple uploaded documents?",
      a: "Yes! Every upload is saved to your local History tab. You can click 'Load into Active Session' on any past item to restore it instantly.",
    },
    {
      q: "Where is my data stored?",
      a: "All documents, parsed skill profiles, and roadmap checklists are stored privately in your browser's local storage. Nothing is shared or tracked.",
    },
    {
      q: "How does the Reset option work?",
      a: "The Reset button lets you clear your active workspace or wipe your saved history when you've finished studying for a topic and want a fresh slate.",
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Top Selector Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <div className="space-y-0.5">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Learning Center</div>
          <h1 className="text-xl font-bold text-white font-display">
            How to Use <span className="font-editorial italic font-normal text-purple-400">prep</span> Efficiently
          </h1>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0e111d] rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setGuideMode("video")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              guideMode === "video"
                ? "bg-purple-600 text-white font-bold shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Video Walkthrough</span>
          </button>
          <button
            onClick={() => setGuideMode("steps")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              guideMode === "steps"
                ? "bg-purple-600 text-white font-bold shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>5-Step Checklist</span>
          </button>
        </div>
      </div>

      {/* Featured Video Walkthrough Player */}
      {guideMode === "video" ? (
        <div className="space-y-8 animate-fade-in">
          <VideoWalkthrough onNavigateToTab={onNavigate} />

          {/* Quick Demo Data Launcher Card */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#141724] to-pink-950/30 border border-purple-500/25 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-purple-400 font-mono">Want to test it live?</div>
              <h3 className="text-base font-bold text-white font-display">Load Sample Curriculum & Profile</h3>
              <p className="text-xs text-slate-400 font-sans-clean">
                Populate the app with a verified Full-Stack Engineer syllabus and sample roadmap in one click.
              </p>
            </div>
            <button
              onClick={onLoadSampleData}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-purple-950/50 active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        /* Step by Step Visual Guide */
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-purple-500/20 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Step-By-Step Workflow</span>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                5 Stages from Material to Mastery
              </h2>
            </div>
            <button
              onClick={() => setGuideMode("video")}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
            >
              Prefer video? Watch walkthrough →
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-[#141724]/90 rounded-2xl border border-purple-500/20 p-6 sm:p-7 shadow-lg hover:border-purple-500/40 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Left: Step number & Icon */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner ${step.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-500">{step.num}</span>
                          <span className="text-slate-600">·</span>
                          <span className={`text-xs font-semibold uppercase tracking-wide ${step.accentText}`}>{step.subtitle}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white font-display">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl font-sans-clean pt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Launch Button */}
                    <div className="shrink-0 self-start md:self-center">
                      <button
                        onClick={() => onNavigate(step.tabTarget)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-200 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        <span>{step.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done with Work? Reset Workspace Card in dark mood */}
      <div className="rounded-2xl bg-[#141724]/90 border border-rose-500/25 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 font-mono">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Finished Your Work?</span>
          </div>
          <h3 className="text-lg font-bold text-white font-display">
            Start Fresh Anytime with 1-Click Reset
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans-clean leading-relaxed">
            When you've finished studying a chapter or preparing for an interview, hit Reset to clear your active checklist. Past uploads remain safely stored in your History tab.
          </p>
        </div>

        <button
          onClick={onTriggerReset}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-rose-600/90 hover:bg-rose-500 border border-rose-500/30 shadow-md shadow-rose-950/40 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Active Workspace</span>
        </button>
      </div>

      {/* Pro Tips & FAQs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pro Tips */}
        <div className="bg-[#141724]/90 rounded-2xl border border-purple-500/20 p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-white text-base">Study & Prep Pro Tips</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-400 font-sans-clean">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <span><strong>Paste Course Outlines:</strong> Paste your exam syllabus into the text box for targeted topic-by-topic roadmap generation.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <span><strong>Level Tuning:</strong> Select "Senior" difficulty to receive deeper architectural and edge-case subtasks.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <span><strong>Download Corrected PDF:</strong> After scanning your CV, click "Download Improved PDF" to get a clean, ATS-optimized version.</span>
            </li>
          </ul>
        </div>

        {/* FAQs */}
        <div className="bg-[#141724]/90 rounded-2xl border border-purple-500/20 p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h3 className="font-display text-white text-base">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-1">
                <div className="text-xs font-bold text-slate-200">{faq.q}</div>
                <div className="text-xs text-slate-400 leading-relaxed font-sans-clean">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
