import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Gauge,
  TrendingDown
} from 'lucide-react';
import { api } from '../services/api';

export const ResumeScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".txt")) {
        setFile(droppedFile);
        setError('');
      } else {
        setError("Only PDF or TXT files are accepted for parsing.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".txt")) {
        setFile(selectedFile);
        setError('');
      } else {
        setError("Only PDF or TXT files are accepted for parsing.");
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      let data;
      if (file) {
        data = await api.analyzeResumeFile(file);
      } else if (resumeText.trim() !== '') {
        data = await api.analyzeResumeText(resumeText);
      } else {
        setError('Please upload a file or paste your resume text first.');
        setLoading(false);
        return;
      }
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Error processing resume file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-dark-border/40">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          Resume Readiness Check
        </h2>
        <p className="text-sm text-dark-muted mt-1">
          Scan your resume against your active roadmap to check for missing skills, metrics, and certifications.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Grid: Upload Box (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Upload Form Block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-base font-extrabold text-white">Upload Resume</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Drag/Drop Box */}
              {!resumeText && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-500/5' 
                      : file 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-dark-border/60 bg-dark-bg/20 hover:border-dark-border'
                  }`}
                >
                  {file ? (
                    <>
                      <FileText className="w-10 h-10 text-emerald-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white max-w-[200px] truncate">{file.name}</p>
                        <p className="text-[10px] text-dark-muted">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="px-3 py-1 bg-dark-card border border-dark-border text-[10px] font-bold rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-dark-muted" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Drag & drop your resume file</p>
                        <p className="text-[10px] text-dark-muted">PDF or TXT formats (Max 5MB)</p>
                      </div>
                      <label className="px-4 py-2 bg-dark-card border border-dark-border text-[11px] font-extrabold rounded-lg text-white hover:bg-dark-border/40 transition-colors cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          accept=".pdf,.txt"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              )}

              {/* Text Area Fallback */}
              {!file && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                      Or Paste Resume Plaintext
                    </label>
                    {resumeText && (
                      <button 
                        type="button" 
                        onClick={() => setResumeText('')} 
                        className="text-xs text-red-400 font-bold"
                      >
                        Clear Text
                      </button>
                    )}
                  </div>
                  <textarea
                    placeholder="Copy and paste your resume content directly here..."
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border/60 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning ATS Filters...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan Resume Readiness
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Block */}
        <div className="lg:col-span-3 space-y-6">
          {analysis ? (
            <div className="space-y-6">
              
              {/* Score Display Panel */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 border-emerald-500/20 bg-gradient-to-tr from-dark-card to-emerald-950/5">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1E293B" strokeWidth="8" />
                    {/* Foreground arc */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke={analysis.score >= 75 ? '#10B981' : analysis.score >= 50 ? '#F59E0B' : '#EF4444'} 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-white">{analysis.score}</span>
                    <span className="text-[10px] block text-dark-muted font-bold">/100</span>
                  </div>
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-base font-extrabold text-white">ATS Score Evaluation</h3>
                  <p className="text-xs text-dark-muted max-w-sm">
                    This score is calculated based on skill availability, project phrasing, and core curriculum keyword densities.
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    analysis.score >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
                    analysis.score >= 50 ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {analysis.score >= 75 ? 'Interview Ready' : analysis.score >= 50 ? 'Needs Upgrades' : 'Critically Missing Skills'}
                  </span>
                </div>
              </div>

              {/* Critiques/Suggestions (Highly highlighted) */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Dave's Blunt Critique & Suggestions
                </h3>
                
                <div className="space-y-2">
                  {analysis.improvementSuggestions.map((sug: string, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-dark-bg/40 border border-dark-border/20 text-xs leading-relaxed text-dark-muted flex gap-2 items-start">
                      <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword checklists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Missing Skills */}
                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Missing Skill Tags</h4>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {analysis.missingSkills.map((sk: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-md">
                        {sk}
                      </span>
                    ))}
                    {analysis.missingSkills.length === 0 && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All roadmap skills found!
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Certs / Projects */}
                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Missing Certifications / Projects</h4>
                  <div className="space-y-2 pt-2">
                    {analysis.missingCertifications.map((c: string, idx: number) => (
                      <div key={idx} className="text-xs text-dark-muted flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Cert: {c}</span>
                      </div>
                    ))}
                    {analysis.missingProjects.map((p: string, idx: number) => (
                      <div key={idx} className="text-xs text-dark-muted flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Project: {p}</span>
                      </div>
                    ))}
                    {analysis.missingCertifications.length === 0 && analysis.missingProjects.length === 0 && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All certifications & projects set!
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] border-dark-border/40 text-dark-muted gap-4">
              <FileText className="w-12 h-12 text-dark-muted" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Scan Performed</h3>
                <p className="text-xs max-w-sm">
                  Upload a PDF/TXT copy of your resume or paste the raw plaintext on the left to begin checking your score.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default ResumeScanner;
