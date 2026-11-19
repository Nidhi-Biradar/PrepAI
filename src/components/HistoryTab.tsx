import React, { useState } from "react";
import { 
  History, 
  FileText, 
  Map, 
  Trash2, 
  UploadCloud, 
  ExternalLink, 
  Calendar, 
  FileCode, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Eye, 
  Download, 
  RotateCcw,
  ArrowRight,
  Filter,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HistoryItem, ResumeProfile, PersonalizedRoadmap } from "../types";

interface HistoryTabProps {
  history: HistoryItem[];
  onLoadResume: (resume: ResumeProfile) => void;
  onLoadRoadmap: (roadmap: PersonalizedRoadmap) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onNavigate: (tab: string) => void;
}

export default function HistoryTab({
  history,
  onLoadResume,
  onLoadRoadmap,
  onDeleteHistoryItem,
  onClearAllHistory,
  onNavigate,
}: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered items
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.snippet && item.snippet.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const handleLoadItem = (item: HistoryItem) => {
    if (item.roleGapData) {
      onNavigate("role-gap");
    } else if (item.resumeData) {
      onLoadResume(item.resumeData);
      onNavigate("resume");
    } else if (item.roadmapData) {
      onLoadRoadmap(item.roadmapData);
      onNavigate("roadmap");
    } else if (item.rawText || item.optimizedData) {
      onNavigate("resume");
    }
  };

  const handleDownloadText = (item: HistoryItem) => {
    const textToDownload =
      item.optimizedData?.optimizedText ||
      item.rawText ||
      item.snippet ||
      (item.roleGapData ? JSON.stringify(item.roleGapData, null, 2) : "") ||
      (item.resumeData ? JSON.stringify(item.resumeData, null, 2) : "") ||
      (item.roadmapData ? JSON.stringify(item.roadmapData, null, 2) : "");

    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.fileName || item.title || "prep-history"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Archive & Sessions</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-400">{history.length} saved {history.length === 1 ? "entry" : "entries"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display mt-1">
            Upload & Activity History
          </h1>
          <p className="text-sm text-slate-400 font-sans-clean mt-1">
            Browse and restore previously uploaded PDFs, ATS resume scans, role gap audits, and study roadmaps.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded files or skills..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0e111d] focus:bg-[#111422] border border-purple-500/20 rounded-xl placeholder-slate-500 text-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-clean"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto bg-[#0e111d] p-1 rounded-xl border border-slate-800">
            {[
              { id: "all", label: "All Items" },
              { id: "resume", label: "ATS Scans" },
              { id: "role_gap", label: "Role Gap Audits" },
              { id: "upload", label: "PDF / Files" },
              { id: "roadmap", label: "Roadmaps" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-purple-600 text-white shadow-xs font-bold border border-purple-400/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Items List or Empty State */}
      {history.length === 0 ? (
        <div className="bg-[#141724]/90 rounded-3xl border border-purple-500/25 p-12 text-center space-y-5 shadow-xl shadow-black/20">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white font-display">No Uploaded Files or Saved Sessions</h3>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
              When you upload a resume for ATS scanning or role gap auditing, it will automatically appear here so you can re-load it anytime.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate("resume")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-purple-950/60 transition-all cursor-pointer border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Scan a Resume Now</span>
            </button>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-[#141724]/90 rounded-2xl border border-purple-500/20 p-8 text-center text-slate-400 text-xs font-sans-clean">
          No history items matched your search query "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((item) => {
            const isOptimized = item.type === "optimized" || item.optimizedData;
            const isRoleGap = item.type === "role_gap" || item.roleGapData;
            const isResume = item.type === "resume" || item.resumeData;
            const isRoadmap = item.type === "roadmap" || item.roadmapData;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#141724]/90 rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-xl shadow-black/20 hover:border-purple-400/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isOptimized
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : isRoleGap
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                      : isRoadmap 
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                      : isResume 
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/30" 
                      : "bg-pink-500/20 text-pink-300 border-pink-500/30"
                  }`}>
                    {isOptimized ? <Sparkles className="w-5 h-5" /> : isRoleGap ? <Target className="w-5 h-5" /> : isRoadmap ? <Map className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-display truncate">
                        {item.title}
                      </h3>
                      {item.targetRole && (
                        <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                          Target: {item.targetRole}
                        </span>
                      )}
                      {item.fileName && !item.targetRole && (
                        <span className="text-[11px] font-mono text-purple-300 bg-[#0e111d] border border-purple-500/20 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                          {item.fileName}
                        </span>
                      )}
                      {item.fileSize && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.fileSize}
                        </span>
                      )}
                    </div>

                    {item.snippet && (
                      <p className="text-xs text-slate-400 font-sans-clean line-clamp-1 max-w-xl">
                        {item.snippet}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.matchScore !== undefined && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="font-semibold text-emerald-400">
                            {item.matchScore}% Match Score
                          </span>
                        </>
                      )}
                      {item.skillsCount !== undefined && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="font-semibold text-purple-300">
                            {item.skillsCount} Skills Extracted
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadText(item)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Download Copy"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleLoadItem(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 transition-colors cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span>Load into Session</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  </button>

                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#141829] border border-purple-500/30 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white font-display">{previewItem.title}</h3>
                  <div className="text-xs text-slate-400">
                    {previewItem.fileName ? `File: ${previewItem.fileName} · ` : ""}
                    {new Date(previewItem.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto flex-grow p-4 rounded-xl bg-[#0e111d] border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {previewItem.rawText ||
                  previewItem.snippet ||
                  (previewItem.resumeData ? JSON.stringify(previewItem.resumeData, null, 2) : "") ||
                  (previewItem.roadmapData ? JSON.stringify(previewItem.roadmapData, null, 2) : "No text preview available.")}
              </div>

              <div className="flex items-center justify-between pt-2 shrink-0">
                <button
                  onClick={() => handleDownloadText(previewItem)}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download as Text
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleLoadItem(previewItem);
                      setPreviewItem(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95 shadow-md shadow-purple-950/50"
                  >
                    Load into Active Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#141829] border border-rose-500/30 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/25">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Clear All Upload History?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans-clean">
                This will delete all saved PDF archives, text records, and roadmap logs from your local history. Active sessions will not be affected unless you also reset them.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer active:scale-95 shadow-md shadow-rose-950/50"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
