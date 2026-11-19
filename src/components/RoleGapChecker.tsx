import React, { useState } from "react";
import { 
  Target, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  FileText, 
  Layers, 
  Plus, 
  ShieldCheck, 
  Lightbulb, 
  Filter,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RoleGapReport, RoleChecklistItem, HistoryItem, DifficultyLevel } from "../types";
import { extractTextFromPDF } from "../utils/pdfExtractor";

interface RoleGapCheckerProps {
  onAddToHistory?: (item: HistoryItem) => void;
  onNavigateToRoadmap?: () => void;
}

const COMMON_ROLES = [
  "Full-Stack Engineer",
  "Frontend Developer",
  "Backend Cloud Engineer",
  "Data Scientist / AI Engineer",
  "DevOps / SRE Engineer",
  "Mobile App Engineer (iOS/Android)",
  "Machine Learning Engineer",
  "Cybersecurity Analyst",
  "UI/UX Product Designer",
  "Product Manager",
  "Embedded Systems Engineer",
  "Blockchain / Web3 Engineer"
];

export default function RoleGapChecker({
  onAddToHistory,
  onNavigateToRoadmap,
}: RoleGapCheckerProps) {
  const [selectedRole, setSelectedRole] = useState<string>("Full-Stack Engineer");
  const [customRoleInput, setCustomRoleInput] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<DifficultyLevel>("Junior");
  const [resumeText, setResumeText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [report, setReport] = useState<RoleGapReport | null>(null);
  const [checklistFilter, setChecklistFilter] = useState<string>("all");
  const [newCustomTask, setNewCustomTask] = useState<string>("");
  const [showAddCustomTask, setShowAddCustomTask] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Effective role to analyze against (custom input takes precedence if typed)
  const effectiveRole = customRoleInput.trim() ? customRoleInput.trim() : selectedRole;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setFileName(file.name);

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md");

    if (!isPdf && !isText) {
      setErrorMsg("Please upload a valid PDF (.pdf) or text (.txt, .md) file.");
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setFileSize(sizeFormatted);

    const reader = new FileReader();

    if (isPdf) {
      setIsParsingPdf(true);
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            const extracted = await extractTextFromPDF(arrayBuffer);
            if (extracted.trim()) {
              setResumeText(extracted);
            } else {
              setErrorMsg("Could not extract readable text from this PDF. Please paste your resume text below.");
            }
          }
        } catch (err: any) {
          console.error("PDF parse failure:", err);
          setErrorMsg("Failed to parse PDF. Please copy and paste your resume text directly.");
        } finally {
          setIsParsingPdf(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text || "");
      };
      reader.readAsText(file);
    }
  };

  const handleSelectPredefinedRole = (role: string) => {
    setSelectedRole(role);
    setCustomRoleInput(""); // clear custom input so preset is prominent
  };

  const handleRunRoleGapCheck = async (overrideLevel?: DifficultyLevel) => {
    const targetLevel = overrideLevel || experienceLevel;
    if (overrideLevel) {
      setExperienceLevel(overrideLevel);
    }

    if (!resumeText.trim()) {
      setErrorMsg("Please paste or upload your resume text first.");
      return;
    }

    if (!effectiveRole.trim()) {
      setErrorMsg("Please specify a target role to benchmark against.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/resume/role-gap-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          targetRole: effectiveRole,
          experienceLevel: targetLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze resume for target role.");
      }

      const resData = await response.json();
      if (resData.success && resData.report) {
        const enrichedReport: RoleGapReport = {
          ...resData.report,
          experienceLevel: resData.report.experienceLevel || targetLevel,
        };
        setReport(enrichedReport);

        // Save to activity history
        if (onAddToHistory) {
          const historyEntry: HistoryItem = {
            id: enrichedReport.id || `role_gap_${Date.now()}`,
            type: "role_gap",
            title: `Role Gap Audit · ${effectiveRole} (${targetLevel})`,
            fileName: fileName || `${effectiveRole.replace(/\s+/g, "_")}_${targetLevel}_Audit.pdf`,
            fileSize: fileSize || `${Math.round(resumeText.length / 1024)} KB`,
            fileType: "pdf",
            timestamp: new Date().toISOString(),
            snippet: enrichedReport.matchSummary,
            targetRole: `${effectiveRole} · ${targetLevel}`,
            roleGapData: enrichedReport,
            matchScore: enrichedReport.roleMatchScore,
          };
          onAddToHistory(historyEntry);
        }
      } else {
        throw new Error("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error("Role gap check error:", err);
      setErrorMsg(err.message || "Something went wrong while evaluating your resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle individual checklist items
  const handleToggleChecklistItem = (id: string) => {
    if (!report) return;
    const updatedChecklist = report.roleChecklist.map((item) => {
      if (item.id === id) {
        return { ...item, done: !item.done };
      }
      return item;
    });
    setReport({ ...report, roleChecklist: updatedChecklist });
  };

  // Add custom user checkbox task
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTask.trim() || !report) return;

    const newTask: RoleChecklistItem = {
      id: `custom_task_${Date.now()}`,
      task: newCustomTask.trim(),
      category: "Personal Action Item",
      importance: "medium",
      done: false,
      advice: "Self-assigned task to strengthen candidacy for this role.",
    };

    setReport({
      ...report,
      roleChecklist: [newTask, ...report.roleChecklist],
    });
    setNewCustomTask("");
    setShowAddCustomTask(false);
  };

  // Load rich sample demo text
  const handleLoadSampleResume = () => {
    setResumeText(`ALEX MORGAN
alex.morgan@email.com | (555) 234-5678 | San Francisco, CA | github.com/alexmorgan

SUMMARY
Energetic software developer with 1.5 years experience building responsive web interfaces and Node.js REST services. Passionate about clean UI design, front-end optimization, and state management.

SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python (basics)
- Frameworks & Libraries: React, Next.js, Redux Toolkit, Tailwind CSS, Express.js
- Tools & Databases: PostgreSQL, Git, npm, Postman, Vite, Vercel

WORK EXPERIENCE
Junior Frontend Developer | TechFlow Digital | Jun 2023 - Present
- Built interactive client-side dashboards using React 18, TypeScript, and Tailwind CSS.
- Handled state management with Redux Toolkit and reduced re-renders across analytics tables.
- Collaborated with UX designers to translate Figma mockups into accessible web components.
- Helped backend team integrate RESTful endpoints for user authentication and settings.

Full-Stack Engineering Intern | DevWorks Labs | Jan 2023 - May 2023
- Implemented responsive landing pages using Next.js and Tailwind CSS.
- Created CRUD API routes using Express and PostgreSQL for employee task management.
- Assisted with unit testing using Jest and automated pull request linting.

PROJECTS
Collaborative Code Pad
- Developed a web-based code editor with syntax highlighting using Monaco Editor and React.
- Connected Express backend with PostgreSQL to persist user snippets.

EDUCATION
B.S. in Computer Science | University of California, Davis | 2019 - 2023`);
    setFileName("Alex_Morgan_Resume.pdf");
    setFileSize("118 KB");
  };

  // Checklist math
  const getChecklistStats = () => {
    if (!report || !report.roleChecklist) return { total: 0, done: 0, percent: 0 };
    const total = report.roleChecklist.length;
    const done = report.roleChecklist.filter((t) => t.done).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  };

  const checklistStats = getChecklistStats();

  const filteredChecklist = report?.roleChecklist.filter((item) => {
    if (checklistFilter === "all") return true;
    if (checklistFilter === "todo") return !item.done;
    if (checklistFilter === "completed") return item.done;
    if (checklistFilter === "high") return item.importance === "high";
    return true;
  }) || [];

  // Download checklist to plain text
  const handleDownloadChecklist = () => {
    if (!report) return;
    let content = `ROLE PREPARATION CHECKLIST: ${report.targetRole.toUpperCase()} (${(report.experienceLevel || experienceLevel).toUpperCase()} LEVEL)\n`;
    content += `Match Score: ${report.roleMatchScore}%\n`;
    content += `Analyzed: ${new Date(report.analyzedAt).toLocaleDateString()}\n\n`;
    content += `OVERALL SUMMARY:\n${report.matchSummary}\n\n`;
    content += `ACTIONABLE CHECKBOXES:\n`;
    report.roleChecklist.forEach((item, idx) => {
      content += `[${item.done ? "X" : " "}] ${idx + 1}. ${item.task} (${item.importance.toUpperCase()} PRIORITY)\n`;
      content += `    Category: ${item.category}\n`;
      content += `    Advice: ${item.advice}\n\n`;
    });
    content += `\nROLE CORRECTIONS & GUIDANCE:\n`;
    report.roleCorrections.forEach((c, idx) => {
      content += `${idx + 1}. Current Flaw/Weakness: ${c.currentFlawOrGap}\n`;
      content += `   Target Role Impact: ${c.roleTargetContext}\n`;
      content += `   Correction: ${c.recommendedCorrection}\n`;
      content += `   Action Step: ${c.actionableStep}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.targetRole.replace(/\s+/g, "_")}_Preparation_Checklist.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Role-Targeted Gap Analyzer</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-400">Strict Job Benchmarking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2.5">
            <Target className="w-7 h-7 text-purple-400" />
            Role Gap Checker & Corrections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans-clean max-w-2xl">
            Choose or type any role you are applying for. prep benchmarks your resume strictly against that role's hiring bar, extracts precise missing tech gaps, provides interactive checkboxes, and guides your corrections.
          </p>
        </div>

        {report && (
          <button
            onClick={() => setReport(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#161a2b] hover:bg-[#1f253d] border border-purple-500/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Audit Another Role</span>
          </button>
        )}
      </div>

      {/* Target Role Selector + Input Card */}
      <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">Step 1</span>
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" /> Select or Type Your Target Role
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-sans-clean">
            Benchmarking strictly for: <strong className="text-purple-300">{effectiveRole}</strong>
          </span>
        </div>

        {/* Freeform Role Input: User can type ANY role */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Type any custom role (or select from options below):</span>
            <span className="text-[11px] text-purple-400 font-mono">Works with any job title</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="e.g. AI Research Intern, Distributed Systems Engineer, Quantitative Dev, Rust Cloud Specialist..."
              className="w-full px-4 py-3 text-sm bg-[#0e111d] border border-purple-500/30 rounded-xl placeholder-slate-500 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 font-sans-clean transition-all"
            />
            {customRoleInput && (
              <button
                onClick={() => setCustomRoleInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#171b2d] border border-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Predefined Quick Option Pills */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Or choose a common target role:
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_ROLES.map((role) => {
              const isSelected = !customRoleInput.trim() && selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectPredefinedRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-purple-600/30 text-purple-200 border-purple-400 shadow-sm font-semibold"
                      : "bg-[#0e111d] text-slate-400 hover:text-white border-slate-800 hover:border-purple-500/30"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selector: Junior, Mid, Senior */}
        <div className="space-y-2 pt-3 border-t border-purple-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Select Experience Level
            </span>
            <span className="text-[11px] text-purple-400 font-sans-clean">
              Gives tailored gaps, scores & checklists for Junior, Mid, or Senior
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {([
              { id: "Junior", label: "Junior", sub: "0–2 yrs · Core basics & clean projects" },
              { id: "Mid", label: "Mid-Level", sub: "2–5 yrs · Ownership, speed & testing" },
              { id: "Senior", label: "Senior", sub: "5+ yrs · Architecture, scale & mentoring" },
            ] as const).map((lvl) => {
              const active = experienceLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setExperienceLevel(lvl.id);
                    if (report && resumeText.trim()) {
                      handleRunRoleGapCheck(lvl.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600/25 border-purple-400 text-white shadow-sm"
                      : "bg-[#0e111d] border-slate-800 text-slate-400 hover:text-white hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display">{lvl.label}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{lvl.sub}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Input when no report, or Report results when generated */}
      {!report ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Dropzone & Guidance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">Step 2</span>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" /> Upload Resume or CV
                </h3>
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/70 rounded-2xl p-6 text-center space-y-3 relative group transition-all duration-200 bg-[#0e111d] hover:bg-[#161a2c]">
                <div className="w-12 h-12 rounded-2xl bg-[#1b2033] border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 group-hover:text-purple-200 group-hover:scale-105 transition-all shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-300 font-sans-clean">
                    <span className="text-purple-400 font-bold cursor-pointer underline hover:text-purple-300">
                      Click to upload
                    </span>{" "}
                    or drag PDF here
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Supports PDF (.pdf) & Plain Text (.txt, .md)
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Parsing Indicator */}
              {isParsingPdf && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span>Extracting text from PDF client-side...</span>
                </div>
              )}

              {/* Uploaded File Badge */}
              {fileName && !isParsingPdf && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e111d] border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold truncate">{fileName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {fileSize}
                  </span>
                </div>
              )}

              {/* Zero-Fabrication Authenticity Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 via-[#141724] to-purple-950/20 border border-emerald-500/25 space-y-1.5 text-xs text-slate-300 font-sans-clean">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4" /> Role Benchmark Integrity
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We check your genuine resume against <strong>{effectiveRole}</strong>. We never add fake skills or hallucinated jobs.
                </p>
              </div>

              {/* Quick Sample Button */}
              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Load Sample Candidate Resume</span>
              </button>
            </div>
          </div>

          {/* Right Column: Paste Text Area & Action */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Resume Content for Role Evaluation
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {resumeText.length > 0 ? `${resumeText.length.toLocaleString()} characters` : "Empty"}
                </span>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={`Paste your resume text here, or upload a PDF on the left. prep will evaluate it strictly against the "${effectiveRole}" role...`}
                rows={14}
                className="w-full p-4 text-xs font-mono bg-[#0e111d] border border-purple-500/20 rounded-xl placeholder-slate-600 text-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 resize-y leading-relaxed"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Trigger Button */}
              <button
                id="run-role-gap-btn"
                onClick={() => handleRunRoleGapCheck()}
                disabled={isLoading || isParsingPdf || !resumeText.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isLoading || isParsingPdf || !resumeText.trim()
                    ? "bg-purple-900/40 text-purple-300/40 border border-purple-500/10 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] shadow-purple-950/60 border border-white/10"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Benchmarking for {experienceLevel} {effectiveRole}...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-purple-200" />
                    <span>Check Gaps for {experienceLevel} {effectiveRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-fade-in">
          
          {/* Executive Overview Banner with Score */}
          <div className="bg-gradient-to-br from-[#161a2b] via-[#141724] to-[#1d162b] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Score Block */}
              <div className="flex items-center gap-5">
                {/* Visual Circular Score Ring */}
                <div className="relative w-24 h-24 rounded-full bg-[#0e111d] border-2 border-purple-500/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-3xl font-black font-display text-white">
                    {report.roleMatchScore}%
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-purple-300">Role Match</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      <span>Target Role: {report.targetRole}</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                      {report.experienceLevel || experienceLevel} Level
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                    Role Qualification Benchmark
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans-clean leading-relaxed max-w-xl">
                    {report.matchSummary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0 self-start md:self-center">
                <button
                  onClick={handleDownloadChecklist}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-purple-200 bg-[#1e2338] hover:bg-[#272e4a] border border-purple-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Download preparation report and checklist to text"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Export Checklist</span>
                </button>
              </div>

            </div>

            {/* Checklist Progress Bar */}
            <div className="relative z-10 pt-2 border-t border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 font-display">Checklist Progress:</span>
                <span className="text-xs font-mono text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {checklistStats.done} of {checklistStats.total} tasks completed ({checklistStats.percent}%)
                </span>
              </div>
              <div className="w-full sm:w-64 h-2.5 rounded-full bg-[#0e111d] border border-purple-500/20 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${checklistStats.percent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Section 1: Matched Qualifications vs Missing Role Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Matched Skills */}
            <div className="bg-[#141724]/90 border border-emerald-500/25 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Matched for {report.targetRole}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans-clean">
                      Skills & qualifications on your resume that directly align
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {report.matchedSkills.length} Verified
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {report.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0e111d] text-emerald-300 border border-emerald-500/30 shadow-xs"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>

              {/* Genuine Strengths for this role */}
              {report.strengthsForRole && report.strengthsForRole.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    Key Role Strengths
                  </span>
                  <ul className="space-y-1.5">
                    {report.strengthsForRole.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Missing Role Gaps */}
            <div className="bg-[#141724]/90 border border-rose-500/25 rounded-2xl p-6 space-y-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Identified Gaps for {report.targetRole}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans-clean">
                      Standard industry requirements missing from your resume
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                  {report.missingRoleGaps.length} Gaps
                </span>
              </div>

              {/* Gaps List */}
              <div className="space-y-3 pt-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                {report.missingRoleGaps.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-300">
                        Strong match for {report.experienceLevel || "this"}-level {report.targetRole}!
                      </p>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Your resume already covers the core requirements for this level. Use the checklist below to polish your bullet points and metrics.
                      </p>
                    </div>
                  </div>
                ) : (
                  report.missingRoleGaps.map((gap, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0e111d] border border-rose-500/20 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-rose-300 font-display">{gap.skillOrRequirement}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          gap.severity === "critical"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}>
                          {gap.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        <strong className="text-slate-400 font-medium">Why required: </strong>
                        {gap.whyNeededForRole}
                      </p>
                      <p className="text-purple-300 text-[11px] leading-relaxed">
                        <strong className="text-purple-400 font-medium">How to bridge: </strong>
                        {gap.howToBridge}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Section 2: Interactive Role Preparation Checkboxes */}
          <div className="bg-[#141724]/90 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Interactive Tasks</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Strictly for {report.targetRole}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                  Role Preparation Checklist
                </h3>
                <p className="text-xs text-slate-400 font-sans-clean">
                  Tick off each task as you complete coursework, build projects, or update your resume points.
                </p>
              </div>

              {/* Filters & Add Custom Task */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1 bg-[#0e111d] p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: "all", label: "All" },
                    { id: "todo", label: "To Do" },
                    { id: "completed", label: "Done" },
                    { id: "high", label: "High Priority" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setChecklistFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        checklistFilter === filter.id
                          ? "bg-purple-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddCustomTask(!showAddCustomTask)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Custom Task Input Form */}
            {showAddCustomTask && (
              <form onSubmit={handleAddCustomTask} className="flex gap-2 p-3 bg-[#0e111d] rounded-xl border border-purple-500/30 animate-fade-in">
                <input
                  type="text"
                  value={newCustomTask}
                  onChange={(e) => setNewCustomTask(e.target.value)}
                  placeholder="e.g. Build miniature Docker container demo for portfolio..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[#141724] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!newCustomTask.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Save Task
                </button>
              </form>
            )}

            {/* Interactive Checkbox List */}
            <div className="space-y-2.5">
              {filteredChecklist.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No tasks matching this filter.
                </div>
              ) : (
                filteredChecklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      item.done
                        ? "bg-[#0f1422] border-emerald-500/30 opacity-75"
                        : "bg-[#0e111d] border-slate-800 hover:border-purple-500/40"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="mt-0.5 shrink-0">
                      {item.done ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-purple-400/80 hover:text-purple-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className={`text-xs font-semibold leading-snug ${
                          item.done ? "line-through text-slate-400" : "text-white"
                        }`}>
                          {item.task}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            item.importance === "high"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold"
                              : item.importance === "medium"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {item.importance}
                          </span>
                        </div>
                      </div>
                      {item.advice && (
                        <p className="text-[11px] text-slate-400 font-sans-clean leading-relaxed">
                          💡 <span className="text-slate-300">{item.advice}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Section 3: Targeted Role Corrections & Guidance */}
          <div className="bg-[#141724]/90 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Recruiter Insights</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Strictly for {report.targetRole}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Targeted Role Corrections & Reframing
                </h3>
                <p className="text-xs text-slate-400 font-sans-clean">
                  How to correct your resume points to speak directly to hiring managers for this specific role.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.roleCorrections.map((corr, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0e111d] border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* What's weak */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Weak for {report.targetRole}
                      </span>
                      <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                        {corr.currentFlawOrGap}
                      </p>
                      <p className="text-[11px] text-slate-500 italic">
                        "{corr.roleTargetContext}"
                      </p>
                    </div>

                    {/* How to correct */}
                    <div className="space-y-1 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> Recommended Correction
                      </span>
                      <p className="text-xs text-slate-200 bg-[#161a2b] p-2.5 rounded-lg border border-purple-500/20 leading-relaxed font-sans-clean">
                        {corr.recommendedCorrection}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Action Step */}
                  <div className="text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Action:</strong> {corr.actionableStep}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation Shortcut to Roadmap */}
            {onNavigateToRoadmap && (
              <div className="p-4 rounded-xl bg-[#161a2b] border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="space-y-0.5 text-xs text-slate-300 font-sans-clean">
                  <span className="font-bold text-white">Need a structured study schedule for this role?</span>
                  <p className="text-slate-400 text-[11px]">
                    Generate a personalized 4-stage study roadmap for {report.targetRole} to bridge these gaps.
                  </p>
                </div>
                <button
                  onClick={onNavigateToRoadmap}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all cursor-pointer shrink-0"
                >
                  <span>Build Study Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
