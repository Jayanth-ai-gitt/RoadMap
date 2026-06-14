import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Award, 
  Layers, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileCode2
} from 'lucide-react';
import { api } from '../services/api';

export const Recommendations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<any>(null);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'CERTS'>('PROJECTS');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const pData = await api.getRecommendedProjects();
      setProjectData(pData);

      const cData = await api.getRecommendedCertifications();
      setCertData(cData);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve project and certification suggestions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Scanning career curriculum matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-dark-border/40">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            Curated Projects & Certifications
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            Build resume-worthy systems and target certifications validated by senior engineers.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-dark-card border border-dark-border/60 p-1.5 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'PROJECTS' ? 'bg-blue-600 text-white' : 'text-dark-muted hover:text-white'
            }`}
          >
            Projects Hub ({projectData?.projects?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('CERTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'CERTS' ? 'bg-blue-600 text-white' : 'text-dark-muted hover:text-white'
            }`}
          >
            Certifications ({certData?.certifications?.length || 0})
          </button>
        </div>
      </div>

      {/* Projects view */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-center justify-between">
            <div className="text-xs text-blue-300">
              💡 Suggestions based on your roadmap completion of <strong className="text-white">{projectData?.progress || 0}%</strong>: We recommend targeting <strong className="text-white uppercase">{projectData?.suggestedDifficulty}</strong> projects.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projectData?.projects?.map((project: any) => {
              const diffColors = 
                project.difficulty === 'BEGINNER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                project.difficulty === 'INTERMEDIATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20';

              return (
                <div key={project.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-dark-border/50 hover:border-dark-border/90 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-extrabold text-white text-base leading-snug">{project.name}</h3>
                      <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${diffColors}`}>
                        {project.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-dark-muted leading-relaxed">{project.description}</p>

                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Functional Requirements</h4>
                      <ul className="grid grid-cols-1 gap-1 text-xs text-dark-text">
                        {project.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate text-dark-muted">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Senior take on the project */}
                    <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/40 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Dave's Resume Strategy:
                      </span>
                      <p className="text-[11px] italic text-dark-muted leading-relaxed">
                        "{project.seniorTake}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dark-border/40">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-dark-card border border-dark-border hover:bg-dark-border/60 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                    >
                      <FileCode2 className="w-4 h-4" />
                      Explore Starter Repos / Guides
                    </a>
                  </div>
                </div>
              );
            })}

            {projectData?.projects?.length === 0 && (
              <div className="col-span-2 text-center py-16 text-sm text-dark-muted">
                No recommended projects loaded for this career. Use Admin Panel to register projects!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications view */}
      {activeTab === 'CERTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certData?.certifications?.map((cert: any) => {
            const diffColors = 
              cert.difficulty === 'BEGINNER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              cert.difficulty === 'INTERMEDIATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20';

            return (
              <div key={cert.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-dark-border/50 hover:border-dark-border/90 transition-all">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-white text-base leading-snug">{cert.name}</h3>
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${diffColors}`}>
                      {cert.difficulty}
                    </span>
                  </div>

                  {/* Cert details stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 text-[11px] font-semibold text-dark-muted">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Cost: ${cert.cost}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{cert.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate" title={cert.prerequisites}>Prereq: {cert.prerequisites}</span>
                    </div>
                  </div>

                  {/* Senior Advice / Warnings */}
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Senior Warning / Reality Check:
                    </span>
                    <p className="text-[11px] italic text-amber-200/80 leading-relaxed">
                      "{cert.seniorTake}"
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dark-border/40">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all"
                  >
                    Register / Official Blueprint
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}

          {certData?.certifications?.length === 0 && (
            <div className="col-span-2 text-center py-16 text-sm text-dark-muted">
              No recommended certifications cataloged for this career path. Use Admin Panel to register certifications!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Recommendations;
