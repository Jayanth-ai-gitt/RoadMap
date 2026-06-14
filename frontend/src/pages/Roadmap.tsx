import React, { useEffect, useState } from 'react';
import { 
  Map, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  X, 
  ExternalLink, 
  AlertTriangle,
  Award,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export const Roadmap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Drawer update state
  const [status, setStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
  const [notes, setNotes] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const data = await api.getMyRoadmap();
      setRoadmap(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleSkillClick = (skill: any) => {
    setSelectedSkill(skill);
    setStatus(skill.userProgress.status);
    setNotes(skill.userProgress.notes || '');
    setCertUrl(skill.userProgress.certificateUrl || '');
  };

  const handleSaveProgress = async () => {
    if (!selectedSkill) return;
    setSaveLoading(true);
    try {
      await api.updateSkillProgress(selectedSkill.id, {
        status,
        notes,
        certificateUrl: certUrl
      });
      setSelectedSkill(null);
      // Refresh roadmap data to update progress visual metrics
      fetchRoadmap();
    } catch (err) {
      alert('Error updating progress. Try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Generating timeline modules...</p>
      </div>
    );
  }

  // Filter skills by phase
  const filterByPhase = (phase: string) => {
    return (roadmap?.skills || []).filter((s: any) => s.phase === phase);
  };

  const phases = [
    { key: 'FUNDAMENTALS', title: 'Phase 1: Engineering Fundamentals', desc: 'Core shell tools, source control, and configuration environments.', color: 'text-blue-400', border: 'border-blue-500/30' },
    { key: 'CORE', title: 'Phase 2: Core Competencies', desc: 'Containerization, orchestration, IaC, and deployment pipelines.', color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { key: 'ADVANCED', title: 'Phase 3: Advanced Architectures', desc: 'Observability systems, scale configurations, log processing, and security compliance.', color: 'text-amber-400', border: 'border-amber-500/30' }
  ];

  return (
    <div className="space-y-8 relative">
      {/* Title block */}
      <div className="flex justify-between items-center pb-6 border-b border-dark-border/40">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-blue-500" />
            Curriculum Timeline
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            Click on individual nodes to modify completion status, resources, notes, and certificates.
          </p>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-dark-muted uppercase block">Overall Progress</span>
          <span className="text-2xl font-black text-emerald-400">{roadmap?.progress || 0}%</span>
        </div>
      </div>

      {/* Main timeline */}
      <div className="space-y-12">
        {phases.map((phase) => {
          const skills = filterByPhase(phase.key);
          if (skills.length === 0) return null;

          return (
            <div key={phase.key} className="space-y-6">
              {/* Phase Header Banner */}
              <div className={`p-4 rounded-xl bg-dark-card/40 border ${phase.border} flex flex-col md:flex-row justify-between items-center gap-3 md:w-3/4 md:mx-auto`}>
                <div className="md:text-left">
                  <h3 className={`text-base font-extrabold ${phase.color}`}>{phase.title}</h3>
                  <p className="text-xs text-dark-muted mt-0.5">{phase.desc}</p>
                </div>
                <div className="shrink-0 flex items-center text-xs font-semibold text-dark-muted gap-2">
                  <span className="bg-dark-border/40 px-2.5 py-1 rounded-lg">
                    Done: {skills.filter((s: any) => s.userProgress.status === 'COMPLETED').length} / {skills.length}
                  </span>
                </div>
              </div>

              {/* Phase Tree Nodes */}
              <div className="relative flex flex-col space-y-6 md:space-y-0 md:py-6">
                {/* Central Trunk Line */}
                <div className="absolute left-[21px] md:left-1/2 top-0 bottom-0 w-0.5 bg-dark-border/70 -translate-x-1/2" />

                {skills.map((skill: any, idx: number) => {
                  const isLeft = idx % 2 === 0;
                  const statusColor = 
                    skill.userProgress.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]' :
                    skill.userProgress.status === 'IN_PROGRESS' ? 'bg-blue-500 border-blue-500 text-white animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.3)]' :
                    'bg-dark-bg border-dark-border text-dark-muted';

                  const completedBorder = 
                    skill.userProgress.status === 'COMPLETED' ? 'border-emerald-500/40 bg-emerald-950/5' :
                    skill.userProgress.status === 'IN_PROGRESS' ? 'border-blue-500/40 bg-blue-950/5' :
                    'border-dark-border/40';

                  return (
                    <div 
                      key={skill.id}
                      onClick={() => handleSkillClick(skill)}
                      className={`relative flex items-center w-full md:my-5 cursor-pointer group`}
                    >
                      {/* Central Node Dot */}
                      <div className={`absolute left-[21px] md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-20 transition-all ${statusColor} group-hover:scale-110`}>
                        {skill.userProgress.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                         skill.userProgress.status === 'IN_PROGRESS' ? <Play className="w-2.5 h-2.5 rotate-90" /> : 
                         <HelpCircle className="w-3.5 h-3.5" />}
                      </div>

                      {/* Desktop Horizontal Branch Line */}
                      {isLeft ? (
                        <div className="hidden md:block absolute right-[calc(50%+12px)] left-auto w-[calc(8%-12px)] h-0.5 bg-dark-border/60 group-hover:bg-blue-500/40 transition-all" />
                      ) : (
                        <div className="hidden md:block absolute left-[calc(50%+12px)] right-auto w-[calc(8%-12px)] h-0.5 bg-dark-border/60 group-hover:bg-blue-500/40 transition-all" />
                      )}

                      {/* Card Content container */}
                      <div className={`w-full md:w-[42%] ml-12 md:ml-0 p-4 rounded-xl border ${completedBorder} hover:border-dark-border/80 bg-dark-card/45 backdrop-blur-sm transition-all flex items-start gap-4 ${
                        isLeft ? 'md:mr-auto md:ml-0' : 'md:ml-auto md:mr-0'
                      }`}>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {skill.name}
                            </h4>
                            {skill.userProgress.status === 'COMPLETED' && (
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">completed</span>
                            )}
                          </div>
                          <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed">
                            {skill.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-xs text-dark-muted self-center group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Drawer / Modal Panel */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSkill(null)}
          />

          {/* Drawer body */}
          <div className="relative w-full max-w-lg bg-dark-card border-l border-dark-border text-dark-text flex flex-col h-full shadow-2xl z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border/40">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selectedSkill.phase} MODULE</span>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedSkill.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="p-1 rounded-lg text-dark-muted hover:bg-dark-border/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider">Module Objective</h4>
                <p className="text-sm text-white/90 leading-relaxed">{selectedSkill.description}</p>
              </div>

              {/* 15+ Years Senior Tips (Highly highlighted) */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Senior's Production Reality Check
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed italic">
                  "{selectedSkill.seniorTips}"
                </p>
                <span className="block text-right text-[9px] text-amber-400/80 font-bold uppercase">— Tech Lead Dave</span>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider">Recommended Study Materials</h4>
                <div className="space-y-2">
                  {selectedSkill.resources.map((res: any, idx: number) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-dark-bg/40 border border-dark-border/30 hover:border-dark-border/80 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-white group-hover:text-blue-400 transition-colors font-semibold">{res.title}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-dark-muted">
                        {res.type.replace('-', ' ')}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ))}

                  {selectedSkill.resources.length === 0 && (
                    <p className="text-xs text-dark-muted">No external links attached. Study using official product manuals.</p>
                  )}
                </div>
              </div>

              {/* User Learning Tracker */}
              <div className="border-t border-dark-border/40 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider">Your Progress Logs</h4>
                
                {/* Status selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-dark-muted">Module Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Personal Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-dark-muted flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Learning Notes & Commands
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jot down useful code blocks, terminal operations, or reference directories here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border/60 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>

                {/* Verification/Certifications */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-dark-muted flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Upload / Certificate Verification URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://coursera.org/verify/certificate-code"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-dark-border/40 flex gap-3 bg-dark-bg/25">
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="flex-1 py-2.5 bg-dark-card border border-dark-border text-sm font-bold text-dark-muted hover:text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={saveLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Save Logs'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Roadmap;
