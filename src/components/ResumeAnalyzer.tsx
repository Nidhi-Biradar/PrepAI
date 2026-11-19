import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Compass, 
  Award, 
  Sparkles, 
  ClipboardList, 
  RefreshCw, 
  User, 
  Mail, 
  Cpu, 
  CheckCircle, 
  FileDown
} from "lucide-react";
import { motion } from "motion/react";
import { ResumeProfile, HistoryItem } from "../types";
import { jsPDF } from "jspdf";
import { extractTextFromPDF } from "../utils/pdfExtractor";

interface ResumeAnalyzerProps {
  currentProfile: ResumeProfile | null;
  onAnalyzeComplete: (profile: ResumeProfile) => void;
  onAddToHistory?: (item: HistoryItem) => void;
}

export default function ResumeAnalyzer({ 
  currentProfile, 
  onAnalyzeComplete,
  onAddToHistory
}: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState("");
  const [lastUploadedFileName, setLastUploadedFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isGeneratingImprovised, setIsGeneratingImprovised] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const [upgradedPreviewText, setUpgradedPreviewText] = useState("");
  const lastLoadedTimestampRef = React.useRef<string | null>(null);

  // Synchronize and reset internal state if candidate profile is reset, or restore rawText if loaded from History
  React.useEffect(() => {
    if (!currentProfile) {
      lastLoadedTimestampRef.current = null;
      setResumeText("");
      setLastUploadedFileName("");
      setErrorMsg("");
      setPdfSuccessMsg("");
      setIsSuccess(false);
      setShowDetails(false);
      setUpgradedPreviewText("");
    } else if (currentProfile.lastUpdated !== lastLoadedTimestampRef.current) {
      lastLoadedTimestampRef.current = currentProfile.lastUpdated;
      if (currentProfile.rawText) {
        setResumeText(currentProfile.rawText);
      }
      if (currentProfile.fileName) {
        setLastUploadedFileName(currentProfile.fileName);
      }
    }
  }, [currentProfile]);

  // Handles text, md, and PDF file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setErrorMsg("");
    setPdfSuccessMsg("");
    setLastUploadedFileName(file.name);

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md");

    if (!isPdf && !isText) {
      setErrorMsg("Please upload a valid PDF (.pdf) or Plain Text (.txt, .md) file.");
      return;
    }

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

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
              setPdfSuccessMsg(`Successfully parsed PDF "${file.name}"`);

              // Log upload into history
              if (onAddToHistory) {
                onAddToHistory({
                  id: `upload_${Date.now()}`,
                  type: "upload",
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  fileName: file.name,
                  fileSize: fileSizeFormatted,
                  fileType: "pdf",
                  timestamp: new Date().toISOString(),
                  snippet: extracted.slice(0, 140) + "...",
                  rawText: extracted,
                });
              }
            } else {
              setErrorMsg("The PDF upload is empty or scanned as images. Please paste your text directly.");
            }
          }
        } catch (err: any) {
          console.error("PDF extraction error:", err);
          setErrorMsg(`Error reading PDF: ${err.message || "Ensure it is not password-protected"}`);
        } finally {
          setIsParsingPdf(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          const content = event.target.result;
          setResumeText(content);
          setPdfSuccessMsg(`Successfully loaded text file "${file.name}"`);

          // Log upload into history
          if (onAddToHistory) {
            onAddToHistory({
              id: `upload_${Date.now()}`,
              type: "upload",
              title: file.name.replace(/\.[^/.]+$/, ""),
              fileName: file.name,
              fileSize: fileSizeFormatted,
              fileType: "text",
              timestamp: new Date().toISOString(),
              snippet: content.slice(0, 140) + "...",
              rawText: content,
            });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Perform Gemini analysis on resume text
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setErrorMsg("Please paste some CV text or upload a valid file before analyzing.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    setPdfSuccessMsg("");
    
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, fileName: lastUploadedFileName }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The processing engine failed to scan your text.");
      }
      
      const profile: ResumeProfile = {
        ...data.profile,
        rawText: resumeText,
        fileName: lastUploadedFileName || undefined,
        lastUpdated: new Date().toISOString(),
      };
      
      onAnalyzeComplete(profile);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);

      // Record in history as analyzed profile
      if (onAddToHistory) {
        onAddToHistory({
          id: `resume_${Date.now()}`,
          type: "resume",
          title: profile.name ? `${profile.name} · Analysis` : (lastUploadedFileName || "Analyzed Resume"),
          fileName: lastUploadedFileName || undefined,
          timestamp: new Date().toISOString(),
          snippet: profile.gapsSummary || profile.identifiedGaps?.slice(0, 2).join(". ") || "Analyzed skill profile",
          resumeData: profile,
          skillsCount: profile.skills?.length || 0,
          matchScore: profile.overallMatchScore || 85,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Something went wrong in the resume analyzer engine. Check backend keys.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and Download Clean ATS-Upgraded CV PDF (Strictly preserving real resume as-is)
  const handleGenerateImprovisedCV = async () => {
    if (!currentProfile) return;
    const sourceText = resumeText.trim() || currentProfile.rawText?.trim() || "";
    if (!sourceText) {
      setErrorMsg("Please paste or upload your resume text first so the ATS upgrader can format your real content.");
      return;
    }

    setIsGeneratingImprovised(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/resume/improvise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: sourceText,
          profile: currentProfile,
          fileName: lastUploadedFileName || currentProfile.fileName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The ATS upgrader returned an error.");
      }

      const improvisedText: string = (data.improvisedResumeText || "").trim();
      if (!improvisedText) {
        throw new Error("Empty response received from the ATS upgrader.");
      }

      setUpgradedPreviewText(improvisedText);

      // Build clean, ATS-friendly PDF starting directly with candidate's real name & contact info
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18; // mm
      const maxLineWidth = pageWidth - margin * 2;

      let y = 20; // mm
      const lineHeight = 5.2; // mm

      const rawParagraphLines = improvisedText.split(/\r?\n/);

      const ensurePageSpace = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
      };

      let headerRendered = false;

      for (let i = 0; i < rawParagraphLines.length; i++) {
        const rawLine = rawParagraphLines[i].trim();

        if (!rawLine) {
          y += 2.2;
          continue;
        }

        // First non-empty line is the candidate's real name
        if (!headerRendered) {
          headerRendered = true;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(17);
          doc.setTextColor(15, 23, 42);
          const nameLines = doc.splitTextToSize(rawLine, maxLineWidth);
          doc.text(nameLines, margin, y);
          y += nameLines.length * 6.5;

          // Check next 1-2 lines for headline/contact info before first section
          let lookahead = i + 1;
          while (lookahead < rawParagraphLines.length && lookahead <= i + 3) {
            const nextTrim = rawParagraphLines[lookahead].trim();
            if (!nextTrim) {
              lookahead++;
              continue;
            }
            const isSectionHeading =
              nextTrim.toUpperCase() === nextTrim &&
              nextTrim.length > 3 &&
              !nextTrim.includes("@") &&
              !nextTrim.includes("|");
            if (isSectionHeading) break;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(71, 85, 105);
            const subLines = doc.splitTextToSize(nextTrim, maxLineWidth);
            doc.text(subLines, margin, y);
            y += subLines.length * 4.6;
            i = lookahead;
            lookahead++;
          }

          y += 2;
          doc.setDrawColor(148, 163, 184);
          doc.setLineWidth(0.4);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
          continue;
        }

        // Section headers (e.g., PROFESSIONAL SUMMARY, WORK EXPERIENCE, CORE SKILLS, EDUCATION)
        const isSectionHeader =
          rawLine.toUpperCase() === rawLine &&
          rawLine.length > 3 &&
          rawLine.length < 55 &&
          !rawLine.includes(":") &&
          !rawLine.includes("@") &&
          !rawLine.startsWith("•") &&
          !rawLine.startsWith("-");

        if (isSectionHeader) {
          ensurePageSpace(12);
          y += 2.5;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.text(rawLine, margin, y);
          y += 1.8;
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.35);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
          continue;
        }

        // Regular / bullet / role header lines
        const isBullet = rawLine.startsWith("•") || rawLine.startsWith("-");
        const isRoleHeader = !isBullet && rawLine.includes("|");

        doc.setFont("helvetica", isRoleHeader ? "bold" : "normal");
        doc.setFontSize(isRoleHeader ? 10 : 9.5);
        doc.setTextColor(isRoleHeader ? 15 : 51, isRoleHeader ? 23 : 65, isRoleHeader ? 42 : 85);

        const wrapped = doc.splitTextToSize(rawLine, isBullet ? maxLineWidth - 3 : maxLineWidth);
        ensurePageSpace(wrapped.length * lineHeight + 1);
        doc.text(wrapped, isBullet ? margin + 2 : margin, y);
        y += wrapped.length * lineHeight;
      }

      const rawCandidateName =
        (currentProfile.name && currentProfile.name !== "Candidate"
          ? currentProfile.name
          : lastUploadedFileName.replace(/\.[^/.]+$/, "")) || "Candidate";
      const candidateCleanName = rawCandidateName.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "Candidate";
      doc.save(`${candidateCleanName}_ATS_Upgraded_CV.pdf`);
      setPdfSuccessMsg(`Downloaded "${candidateCleanName}_ATS_Upgraded_CV.pdf" with your real resume upgraded for ATS!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to compile the upgraded PDF resume.");
    } finally {
      setIsGeneratingImprovised(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="space-y-1.5 border-b border-purple-500/15 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">CV & Syllabus Scanner</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-400">PDF & Plain Text</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
          Resume Analyzer & ATS Upgrader
        </h1>
        <p className="text-sm text-slate-400 font-sans-clean max-w-2xl">
          Drop your CV or study notes to instantly scan for technical gaps, measure ATS keyword alignment, and export a clean, ATS-compliant PDF strictly preserving your authentic skills without adding fake technologies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input Workdesk */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-display">
              <ClipboardList className="w-4.5 h-4.5 text-purple-400" /> Document Input
            </h2>
            
            {/* Native file drag and drop support with pastel hover */}
            <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/70 rounded-2xl p-6 text-center space-y-3 relative group transition-all duration-200 bg-[#0e111d] hover:bg-[#161a2c]">
              <div className="w-12 h-12 rounded-2xl bg-[#1b2033] border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 group-hover:text-purple-200 group-hover:scale-105 transition-all shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-300 font-sans-clean">
                  <span className="text-purple-400 font-bold cursor-pointer underline hover:text-purple-300">
                    Click to upload
                  </span>{" "}
                  or drag file here
                </div>
                <div className="text-[11px] text-slate-500 font-medium font-mono">
                  Supports PDF (.pdf) & Plain Text (.txt, .md)
                </div>
              </div>
              <input 
                type="file" 
                accept=".txt,.md,.pdf"
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Quick success message for files loaded */}
            {pdfSuccessMsg && (
              <div className="p-3 bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs rounded-xl flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{pdfSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold flex justify-between uppercase tracking-wider font-display">
                <span>Or Paste Raw Text</span>
                <span className="text-[10px] text-slate-500 font-normal">Copy-paste plain text</span>
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full plain text or let the PDF extractor handle it..."
                rows={10}
                className="w-full bg-[#0e111d] focus:bg-[#111422] border border-purple-500/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-mono leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile compiled and saved to History!</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || isParsingPdf}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-950/60 active:scale-[0.98] border border-white/10"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating ATS Audit...
                </>
              ) : isParsingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  Extracting PDF content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  Analyze Gaps & Skills
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Desk */}
        <div className="lg:col-span-3 space-y-6">
          {(!currentProfile && !isLoading) ? (
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center space-y-4 shadow-xl shadow-black/20">
              <div className="w-16 h-16 bg-purple-500/15 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/30">
                <Compass className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-white text-base font-display">Awaiting Document Upload</h3>
                <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
                  Provide your resume or syllabus notes on the left. prep will inspect technical competencies, highlight curriculum gaps, and create an upgraded version.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-8 sm:p-12 h-full flex flex-col justify-center space-y-6 shadow-xl shadow-black/20">
              <div className="space-y-3 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                  <Cpu className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Analyzing CV & Syllabus</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                  Parsing framework familiarity, scanning standard keywords, verifying engineering levels, and framing action items...
                </p>
              </div>
              <div className="space-y-2.5 max-w-xs mx-auto w-full">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-purple-500/20">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            </div>
          ) : (
            currentProfile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#141724]/90 border border-purple-500/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/20"
              >
                {/* PDF OPTION BANNER in rich dark surface with pastel highlights */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1b1f33] via-[#171a2e] to-[#1e172a] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-lg">
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase tracking-wide border border-purple-500/30">
                        <Sparkles className="w-3 h-3 text-purple-400" /> ATS CV Ready
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Zero Fake Skills
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white font-display">Download ATS-Upgraded CV</h4>
                    <p className="text-xs text-slate-300 font-sans-clean leading-relaxed">
                      Keeps your real resume <strong className="text-white">as it is</strong> (same name, jobs, projects, schools, and skills) while upgrading section headings, grammar, and action verbs for ATS scanners.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateImprovisedCV}
                    disabled={isGeneratingImprovised}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all duration-200 disabled:opacity-55 cursor-pointer shadow-md shadow-purple-950/60 active:scale-95 shrink-0 border border-white/10"
                  >
                    {isGeneratingImprovised ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Upgrading for ATS...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        Download ATS PDF
                      </>
                    )}
                  </button>
                </div>

                {upgradedPreviewText && (
                  <div className="p-4 rounded-xl bg-[#0e111d] border border-emerald-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                        ATS-Upgraded Text Preview (Preserved As-Is)
                      </span>
                      <button
                        type="button"
                        onClick={() => setUpgradedPreviewText("")}
                        className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                      >
                        Hide
                      </button>
                    </div>
                    <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {upgradedPreviewText}
                    </pre>
                  </div>
                )}

                {/* Profile header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-purple-500/15 pb-5 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
                      <User className="w-5 h-5 text-purple-400" /> {currentProfile.name || "Candidate Profile"}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-sans-clean">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {currentProfile.email || "Details omitted"}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-purple-300 font-semibold bg-purple-500/15 px-3 py-1 rounded-lg border border-purple-500/30">
                    Audited: {new Date(currentProfile.lastUpdated).toLocaleDateString()}
                  </div>
                </div>

                {/* Score rating visual ring */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#0e111d] border border-purple-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold font-display text-lg shrink-0 shadow-md shadow-purple-950/50">
                    {currentProfile.overallMatchScore || "85"}%
                  </div>
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-xs font-bold text-white font-display">ATS & Match Quality Score</div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans-clean">
                      Computed alignment score against industry prerequisites and recruiting benchmarks.
                    </p>
                  </div>
                </div>

                {/* EXECUTIVE SUMMARIZED INSIGHTS in pastel cards with dark containers */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2 font-display">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Executive Insights
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Action Plan</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Summarized Gaps Card in soft pastel rose */}
                    <div className="bg-rose-950/20 border border-rose-500/25 rounded-2xl p-4 space-y-2 shadow-inner">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-display">Identified Gaps</h5>
                      </div>
                      <p className="text-xs text-rose-200/80 leading-relaxed font-sans-clean">
                        {currentProfile.gapsSummary || (currentProfile.identifiedGaps && currentProfile.identifiedGaps.length > 0 ? currentProfile.identifiedGaps.slice(0, 2).join(". ") : "No critical technology framework or architectural gaps identified.")}
                      </p>
                    </div>

                    {/* Summarized Improvements Card in pastel warm apricot */}
                    <div className="bg-amber-950/20 border border-amber-500/25 rounded-2xl p-4 space-y-2 shadow-inner">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-display">Improvements</h5>
                      </div>
                      <p className="text-xs text-amber-200/80 leading-relaxed font-sans-clean">
                        {currentProfile.improvementsSummary || (currentProfile.recommendations && currentProfile.recommendations.length > 0 ? (currentProfile.recommendations.filter(r => r.toLowerCase().includes("resume") || r.toLowerCase().includes("format") || r.toLowerCase().includes("add") || r.toLowerCase().includes("structure")).slice(0, 1).join(". ") || currentProfile.recommendations[0]) : "Optimize resume description formatting and quantify your achievements.")}
                      </p>
                    </div>

                    {/* Summarized Advice Card in pastel soft sage/mint */}
                    <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-4 space-y-2 shadow-inner">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-display">Actionable Advice</h5>
                      </div>
                      <p className="text-xs text-emerald-200/80 leading-relaxed font-sans-clean">
                        {currentProfile.adviceSummary || (currentProfile.recommendations && currentProfile.recommendations.length > 0 ? currentProfile.recommendations.slice(-1)[0] : "Focus on building real-world dynamic projects and system-design patterns.")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collapsible Full Detailed Lists */}
                <div className="border-t border-purple-500/15 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-display">Technical Breakdown</span>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-bold hover:text-purple-300 cursor-pointer transition-all"
                    >
                      <span>{showDetails ? "Hide Full Report" : "View Full Details"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {showDetails && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5 pt-2"
                    >
                      {/* parsed skills in assorted pastel tags */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
                          <Cpu className="w-4 h-4 text-purple-400" /> Parsed Skills ({currentProfile.skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentProfile.skills.map((skill, i) => {
                            const pastelStyles = [
                              "bg-purple-500/20 text-purple-300 border-purple-500/30",
                              "bg-pink-500/20 text-pink-300 border-pink-500/30",
                              "bg-sky-500/20 text-sky-300 border-sky-500/30",
                              "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                              "bg-amber-500/20 text-amber-300 border-amber-500/30",
                            ];
                            const badgeStyle = pastelStyles[i % pastelStyles.length];
                            return (
                              <span 
                                key={i} 
                                className={`border rounded-xl px-3 py-1 text-xs font-semibold shadow-xs ${badgeStyle}`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
                          <Award className="w-4 h-4 text-purple-400" /> Key Experiences
                        </h4>
                        <ul className="space-y-1.5 pl-0">
                          {currentProfile.keyExperiences.map((exp, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-[#0e111d] p-2.5 rounded-xl border border-slate-800 font-sans-clean">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gaps */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
                          <AlertCircle className="w-4 h-4 text-rose-400" /> Identified Gaps
                        </h4>
                        <ul className="space-y-1.5">
                          {currentProfile.identifiedGaps.map((gap, i) => (
                            <li key={i} className="text-xs text-rose-300 flex items-start gap-2.5 bg-rose-950/20 border border-rose-500/25 p-2.5 rounded-xl font-sans-clean">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                          ATS Recommendations
                        </h4>
                        <ul className="space-y-1.5">
                          {currentProfile.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2 font-sans-clean">
                              <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )
          )}
        </div>

      </div>
    </div>
  );
}

