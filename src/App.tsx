import React, { useState, useEffect } from "react";
import { 
  BarChart4, 
  FileText, 
  Map, 
  History, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResumeProfile, PersonalizedRoadmap, HistoryItem } from "./types";

// Modular tab panels
import Dashboard from "./components/Dashboard";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import RoadmapGenerator from "./components/RoadmapGenerator";
import HistoryTab from "./components/HistoryTab";
import GuideTab from "./components/GuideTab";
import RoleGapChecker from "./components/RoleGapChecker";
import { Target } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [resume, setResume] = useState<ResumeProfile | null>(null);
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger brief toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load from local storage on bootstrap
  useEffect(() => {
    try {
      const storedResume = localStorage.getItem("app_prep_resume");
      if (storedResume) {
        setResume(JSON.parse(storedResume));
      } else {
        // Fallback check old key
        const oldResume = localStorage.getItem("app_candidate_resume");
        if (oldResume) setResume(JSON.parse(oldResume));
      }

      const storedRoadmap = localStorage.getItem("app_prep_roadmap");
      if (storedRoadmap) {
        setRoadmap(JSON.parse(storedRoadmap));
      } else {
        const oldRoadmap = localStorage.getItem("app_study_roadmap");
        if (oldRoadmap) setRoadmap(JSON.parse(oldRoadmap));
      }

      const storedHistory = localStorage.getItem("app_prep_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.warn("Local storage parse exception:", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistoryToStorage = (updated: HistoryItem[]) => {
    setHistory(updated);
    try {
      localStorage.setItem("app_prep_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  };

  // Add new item into history
  const handleAddToHistory = (item: HistoryItem) => {
    // Avoid exact duplicate IDs
    const updated = [item, ...history.filter(h => h.id !== item.id)];
    saveHistoryToStorage(updated);
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistoryToStorage(updated);
    showToast("History entry removed.");
  };

  // Clear all history
  const handleClearAllHistory = () => {
    saveHistoryToStorage([]);
    showToast("All history entries cleared.");
  };

  // Load an item from history into active session
  const handleLoadResumeFromHistory = (loadedResume: ResumeProfile) => {
    setResume(loadedResume);
    localStorage.setItem("app_prep_resume", JSON.stringify(loadedResume));
    showToast(`Loaded profile "${loadedResume.name || 'Candidate'}" into active workspace.`);
  };

  const handleLoadRoadmapFromHistory = (loadedRoadmap: PersonalizedRoadmap) => {
    setRoadmap(loadedRoadmap);
    localStorage.setItem("app_prep_roadmap", JSON.stringify(loadedRoadmap));
    showToast(`Loaded ${loadedRoadmap.role} roadmap into active workspace.`);
  };

  // Complete resume parsing CV actions & save
  const handleAnalyzeComplete = (profile: ResumeProfile) => {
    setResume(profile);
    localStorage.setItem("app_prep_resume", JSON.stringify(profile));
    showToast("Resume profile analyzed and updated!");
  };

  // Complete roadmap actions & save
  const handleRoadmapGenerated = (newRoadmap: PersonalizedRoadmap) => {
    setRoadmap(newRoadmap);
    localStorage.setItem("app_prep_roadmap", JSON.stringify(newRoadmap));
    showToast("Personalized study roadmap generated!");
  };

  // Toggle stage topic checklists
  const handleUpdateTopicStatus = (topicId: string, subtaskId: string, done: boolean) => {
    if (!roadmap) return;
    const updatedTopics = roadmap.topics.map(topic => {
      if (topic.id === topicId) {
        const updatedSubtasks = topic.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            return { ...sub, done };
          }
          return sub;
        });
        const allDone = updatedSubtasks.every(s => s.done);
        return { ...topic, subtasks: updatedSubtasks, completed: allDone };
      }
      return topic;
    });

    const updatedRoadmap = { ...roadmap, topics: updatedTopics };
    setRoadmap(updatedRoadmap);
    localStorage.setItem("app_prep_roadmap", JSON.stringify(updatedRoadmap));
  };

  // Switch tabs
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open the custom confirmation modal
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  // Perform reset of active session (keeps history safe unless requested)
  const handleConfirmReset = (wipeHistory: boolean = false) => {
    localStorage.removeItem("app_prep_resume");
    localStorage.removeItem("app_prep_roadmap");
    localStorage.removeItem("app_candidate_resume");
    localStorage.removeItem("app_study_roadmap");
    setResume(null);
    setRoadmap(null);

    if (wipeHistory) {
      localStorage.removeItem("app_prep_history");
      setHistory([]);
    }

    setActiveTab("dashboard");
    setShowResetConfirm(false);
    showToast(wipeHistory ? "Full reset complete. Workspace & history cleared." : "Active workspace reset. Ready for a new topic!");
  };

  // Load a rich sample dataset so the user can test the app immediately
  const handleLoadSampleDemo = () => {
    const demoResume: ResumeProfile = {
      name: "Alex Morgan",
      email: "alex.morgan@stanford.edu",
      skills: ["React 19", "TypeScript", "Node.js", "Express", "Tailwind CSS", "REST APIs", "PostgreSQL", "Docker", "Git"],
      keyExperiences: [
        "Built responsive full-stack web applications with React, TypeScript, and Node.js REST backends",
        "Designed relational database schemas with PostgreSQL and handled indexing for low-latency queries",
        "Integrated client-side PDF document parsing and modern animation libraries"
      ],
      identifiedGaps: [
        "Distributed system caching and Redis message queuing",
        "WebSockets and real-time collaboration architecture",
        "CI/CD deployment pipelines on Cloud Run / AWS"
      ],
      recommendations: [
        "Quantify project performance metrics (e.g. reduced load times by 35% through code splitting)",
        "Highlight cloud containerization with Docker and Kubernetes cluster deployments",
        "Expand on system-design patterns for high-throughput microservices"
      ],
      overallMatchScore: 88,
      gapsSummary: "Missing production Redis caching, WebSockets concurrency, and automated CI/CD pipeline experience.",
      improvementsSummary: "Quantify latency reductions and state management patterns across React and Node.js projects.",
      adviceSummary: "Focus on microservices architectures and real-time pub/sub systems.",
      lastUpdated: new Date().toISOString(),
    };

    const demoRoadmap: PersonalizedRoadmap = {
      id: "demo_roadmap_1",
      role: "Full-Stack Web Engineer",
      targetDifficulty: "Mid",
      createdAt: new Date().toISOString(),
      topics: [
        {
          id: "stage_1",
          title: "Foundation & Modern Architecture",
          description: "Solidify core TypeScript strict typing, React 19 hooks, and optimized component lifecycles.",
          timeline: "Week 1",
          resources: ["TypeScript Handbook", "React 19 Docs", "Clean Code JS"],
          completed: false,
          subtasks: [
            { id: "sub_1", title: "Master TypeScript Generics & Discriminated Unions", done: true },
            { id: "sub_2", title: "Implement React 19 Action hooks and custom reducers", done: true },
            { id: "sub_3", title: "Configure strict ESLint & Prettier build rules", done: false },
          ]
        },
        {
          id: "stage_2",
          title: "High-Performance Backend & Databases",
          description: "Design resilient REST/GraphQL APIs, manage PostgreSQL transactions, and implement Redis caching.",
          timeline: "Week 2 - 3",
          resources: ["Node.js Best Practices", "PostgreSQL High Performance", "Redis in Action"],
          completed: false,
          subtasks: [
            { id: "sub_4", title: "Set up Redis key-value caching layer with TTL expiration", done: false },
            { id: "sub_5", title: "Write database migrations and compound index benchmarks", done: false },
            { id: "sub_6", title: "Implement rate limiting, JWT auth, and error middleware", done: false },
          ]
        },
        {
          id: "stage_3",
          title: "Real-Time & Distributed Systems",
          description: "Bridge client and server with WebSockets, asynchronous job queues, and horizontal scaling.",
          timeline: "Week 4",
          resources: ["Designing Data-Intensive Apps", "WebSocket Protocol RFC", "BullMQ Guides"],
          completed: false,
          subtasks: [
            { id: "sub_7", title: "Build WebSocket event-driven notification channels", done: false },
            { id: "sub_8", title: "Implement background worker queues with BullMQ/Redis", done: false },
          ]
        },
        {
          id: "stage_4",
          title: "DevOps, Testing & Mock Interview Practice",
          description: "Package containers with Docker, automate CI/CD actions, and practice behavioral technical answers.",
          timeline: "Week 5",
          resources: ["Docker Deep Dive", "GitHub Actions Docs", "STAR Method Guide"],
          completed: false,
          subtasks: [
            { id: "sub_9", title: "Build multi-stage Dockerfile with minimal production footprint", done: false },
            { id: "sub_10", title: "Rehearse System Design interview questions using STAR format", done: false },
          ]
        }
      ]
    };

    setResume(demoResume);
    setRoadmap(demoRoadmap);
    localStorage.setItem("app_prep_resume", JSON.stringify(demoResume));
    localStorage.setItem("app_prep_roadmap", JSON.stringify(demoRoadmap));

    // Also add to history for demonstration
    const demoHistoryItem: HistoryItem = {
      id: `demo_${Date.now()}`,
      type: "upload",
      title: "Sample_Fullstack_Syllabus",
      fileName: "Fullstack_Curriculum.pdf",
      fileSize: "185 KB",
      fileType: "pdf",
      timestamp: new Date().toISOString(),
      snippet: "Comprehensive Full-Stack syllabus covering React 19, TypeScript, Node.js, PostgreSQL, and System Design.",
      resumeData: demoResume,
      roadmapData: demoRoadmap,
      skillsCount: demoResume.skills.length,
      matchScore: 88,
    };
    handleAddToHistory(demoHistoryItem);

    setActiveTab("dashboard");
    showToast("Loaded sample demo data! Explore your dashboard and roadmap.");
  };

  const navLinks = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart4,
      tag: "Overview & Analytics",
      description: "Overview of your ATS readiness rating, extracted competencies, active roadmap milestone completion, and shortcuts to all workspaces."
    },
    { 
      id: "role-gap",  
      label: "Role Gap Checker", 
      icon: Target,
      tag: "Target Role Benchmarking",
      description: "Benchmarks your resume strictly against any role you choose or type, extracts missing technical requirements, provides an interactive checkbox checklist, and guides corrections."
    },
    { 
      id: "roadmap", 
      label: "Roadmap", 
      icon: Map,
      tag: "4-Stage Study Plan",
      description: "Generates a personalized, 4-stage study schedule tailored to your target role and difficulty level (Junior, Mid, Senior) with milestone checklists and resources."
    },
    { 
      id: "resume", 
      label: "ATS Scan", 
      icon: FileText,
      tag: "ATS Keyword & Gap Audit",
      description: "Scans your CV or syllabus against recruiting ATS benchmarks, checks keyword match scores, identifies tech gaps, and downloads an ATS-compliant PDF with authentic skills preserved."
    },
    { 
      id: "history", 
      label: "History", 
      icon: History, 
      badge: history.length > 0 ? history.length : undefined,
      tag: "Saved Sessions & Uploads",
      description: "Safely archives all your uploaded files, polished resumes, target role gap audits, and study roadmaps with instant one-click reload and text download."
    },
    { 
      id: "guide", 
      label: "Guide", 
      icon: BookOpen,
      tag: "Video & Walkthrough",
      description: "Comprehensive walkthrough center with an interactive video player and a 5-step checklist explaining how to use prep efficiently from upload to mastery."
    },
  ];

  const currentTabInfo = navLinks.find(link => link.id === activeTab) || navLinks[0];
  const CurrentTabIcon = currentTabInfo.icon;

  return (
    <div className="min-h-screen bg-[#0d0f18] text-slate-100 font-sans-clean antialiased flex flex-col selection:bg-purple-900/60 selection:text-purple-200 relative">
      
      {/* Dreamy Deep Ambient Glow Meshes */}
      <div className="fixed top-0 left-12 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/4 right-8 w-96 h-96 bg-sky-900/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-80 h-80 bg-pink-900/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171b2d] border border-purple-500/30 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl shadow-black/40 flex items-center gap-2 pointer-events-none backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Header Navigation Rail - Top Bar Contract: 3 Zones */}
      <header className="sticky top-0 bg-[#121522]/90 backdrop-blur-md border-b border-purple-500/15 z-40 transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-8">
            
            {/* Zone 1: Interesting, Playful Pastel Brand Logo */}
            <div 
              onClick={() => handleNavigate("dashboard")}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
              title="prep · study & prep companion"
            >
              {/* Layered pastel icon badge */}
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                {/* Back decorative tilted squircle */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-pink-500/30 to-amber-500/20 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300 border border-purple-400/20" />
                {/* Front squircle */}
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-950/60 group-hover:scale-105 transition-transform duration-300 overflow-hidden border border-white/15">
                  {/* Internal pastel light accents */}
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-300/40 rounded-full blur-[2px] pointer-events-none" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 bg-amber-300/40 rounded-full blur-[2px] pointer-events-none" />
                  
                  {/* Custom aesthetic "p" + open page mark */}
                  <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H14l6 6v11.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z" fill="white" fillOpacity="0.2" />
                    <path d="M14 2v6h6" stroke="white" strokeWidth="2" />
                    <path d="M8.5 17V8.5h3.2a2.8 2.8 0 0 1 0 5.6H8.5" stroke="white" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Brand typography with animated pastel spark */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-display font-black text-2xl tracking-tight text-white leading-none">
                    prep
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-purple-400 font-mono uppercase mt-0.5">study companion</span>
              </div>
            </div>

            {/* Zone 2: Navigation Links (concise, single-line) */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isSelected = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    id={`nav-${link.id}`}
                    onClick={() => handleNavigate(link.id)}
                    title={`${link.label}: ${link.description}`}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap shrink-0 ${
                      isSelected 
                        ? "bg-purple-500/20 text-purple-200 font-bold border border-purple-500/35 shadow-xs" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-purple-400" : "text-slate-500"}`} />
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="ml-0.5 text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded-full border border-pink-500/30">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Action & Reset Option */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Reset Option in soft pastel blush */}
              <button
                id="reset-all-btn"
                onClick={handleResetClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
                title="Reset session or clear workspace"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Quick Action CTA in soft pastel gradient */}
              {activeTab !== "resume" && (
                <button
                  onClick={() => handleNavigate("resume")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-purple-950/50 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 border border-white/10"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-300" />
                  <span>ATS Scan</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main visual layouts */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Active Tab Explanation Sub-Banner */}
        <div className="mb-7 bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xl shadow-black/25 backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
              <CurrentTabIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-display tracking-wide">{currentTabInfo.label}</span>
                <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {currentTabInfo.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans-clean leading-relaxed">
                <strong className="text-purple-300 font-medium">What this tab does: </strong>
                {currentTabInfo.description}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                sessions={[]}
                resume={resume}
                roadmap={roadmap}
                historyCount={history.length}
                onNavigate={handleNavigate}
                onLoadSession={() => {}}
              />
            )}

            {activeTab === "role-gap" && (
              <RoleGapChecker 
                onAddToHistory={handleAddToHistory}
                onNavigateToRoadmap={() => handleNavigate("roadmap")}
              />
            )}

            {activeTab === "resume" && (
              <ResumeAnalyzer 
                currentProfile={resume}
                onAnalyzeComplete={handleAnalyzeComplete}
                onAddToHistory={handleAddToHistory}
              />
            )}

            {activeTab === "roadmap" && (
              <RoadmapGenerator 
                currentRoadmap={roadmap}
                resume={resume}
                onRoadmapGenerated={handleRoadmapGenerated}
                onUpdateTopicStatus={handleUpdateTopicStatus}
                onAddToHistory={handleAddToHistory}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab
                history={history}
                onLoadResume={handleLoadResumeFromHistory}
                onLoadRoadmap={handleLoadRoadmapFromHistory}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearAllHistory={handleClearAllHistory}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === "guide" && (
              <GuideTab
                onNavigate={handleNavigate}
                onLoadSampleData={handleLoadSampleDemo}
                onTriggerReset={handleResetClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Aesthetic Quiet Footer */}
      <footer className="bg-[#0b0d16] border-t border-purple-500/15 py-6 text-center text-xs text-slate-400 space-y-1.5 z-10 mt-auto">
        <div className="flex items-center justify-center gap-2 font-display font-bold text-white text-sm">
          <span>prep<span className="text-purple-400">.</span></span>
          <span className="text-slate-600 font-normal">·</span>
          <span className="text-xs font-normal text-slate-400 font-sans-clean">Smart study roadmaps & resume ATS analyzer</span>
        </div>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto font-sans-clean">
          Designed for students and developers to isolate skill gaps, build milestones, and master subjects.
        </p>
      </footer>

      {/* Visual bottom mobile tabs shortcut */}
      <div className="md:hidden sticky bottom-0 bg-[#121522]/95 backdrop-blur-md border-t border-purple-500/15 flex items-center justify-between overflow-x-auto no-scrollbar p-2 text-[10px] z-50 text-slate-400 font-semibold select-none shadow-xl gap-2">
        {navLinks.map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleNavigate(tab.id)}
            title={`${tab.label}: ${tab.description}`}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl cursor-pointer transition-colors shrink-0 ${
              activeTab === tab.id ? "text-purple-400 bg-purple-500/10 font-bold" : "hover:text-white"
            }`}
          >
            <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? "text-purple-400" : "text-slate-500"}`} />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/25 bg-[#141829] p-6 sm:p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Reset Your Session?</h3>
                  <p className="text-xs text-slate-400 font-sans-clean">Choose how you'd like to clear your workspace</p>
                </div>
              </div>
              
              <div className="space-y-2.5 pt-1 text-xs text-slate-300 font-sans-clean">
                <div className="p-3.5 rounded-xl bg-[#0e111d] border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Option 1: Clear Active Workspace</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Clears the active resume and roadmap so you can start on a new subject. Your uploaded files in the History tab will remain saved.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-1">
                  <div className="font-bold text-rose-300">Option 2: Clear Everything (Including History)</div>
                  <p className="text-rose-400/80 text-[11px] leading-relaxed">
                    Completely resets prep back to initial factory state, removing all active tracks and saved history.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReset(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-purple-950/50"
                >
                  Clear Active Session
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReset(true)}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-rose-950/50"
                  title="Wipes workspace and history"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
