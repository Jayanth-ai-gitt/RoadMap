import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Goal, 
  RefreshCw, 
  CheckSquare, 
  Square,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const Planner: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchStudyPlan = async () => {
    try {
      const data = await api.getStudyPlan();
      setStudyPlan(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve study planner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
    
    // Load local checked task state from localStorage
    const saved = localStorage.getItem('careerpath_completed_tasks');
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, []);

  const handleToggleTask = (taskKey: string) => {
    let updated = [];
    if (completedTasks.includes(taskKey)) {
      updated = completedTasks.filter(k => k !== taskKey);
    } else {
      updated = [...completedTasks, taskKey];
    }
    setCompletedTasks(updated);
    localStorage.setItem('careerpath_completed_tasks', JSON.stringify(updated));
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      // Send dynamic assessment update request or clear to force backend regenerate
      // We trigger a reload of assessment parameters
      // In this demo, we mock clearing old records then calling study-plan endpoint
      // We will add a mock clear endpoint or simply let the user clear tasks
      // Wait, we can implement custom regenerate logic:
      // Since backend upserts if not exists, we can mock it or let the user fetch directly.
      // Let's implement an endpoint parameter or force clean in backend. 
      // Wait, actually, let's just make it call the endpoint after clearing local storage completed checklist items.
      setCompletedTasks([]);
      localStorage.removeItem('careerpath_completed_tasks');
      
      // Let's reload
      const data = await api.getStudyPlan();
      setStudyPlan(data);
    } catch (err) {
      setError('Failed to regenerate scheduler.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Generating study tracks...</p>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dailyTasks = studyPlan?.dailyTasks || {};

  return (
    <div className="space-y-8">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-dark-border/40">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            Weekly Study Planner
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            Weekly task boards synced with your available study speed to prevent over-burnout.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-4 py-2.5 bg-dark-card border border-dark-border text-xs rounded-xl hover:bg-dark-border/50 text-white font-bold flex items-center gap-2 disabled:opacity-50 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          Recalculate Week Goals
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Goal Summary Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-blue-900/10 to-indigo-950/15 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Goal className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">WEEKLY TARGET</span>
          <h3 className="text-sm md:text-base font-bold text-white leading-tight">
            {studyPlan?.weeklyGoal || 'Build foundational directories, profiles and check initial configs.'}
          </h3>
        </div>
      </div>

      {/* Week days grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const tasks = dailyTasks[day] || [];
          return (
            <div key={day} className="glass-panel p-4 rounded-2xl space-y-4 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-dark-border/40">
                  <h4 className="font-extrabold text-white text-sm">{day}</h4>
                  <span className="text-[9px] bg-dark-border/50 text-dark-muted font-bold px-2 py-0.5 rounded-md">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                <div className="space-y-2.5 pt-3">
                  {tasks.map((task: string, i: number) => {
                    const taskKey = `${day}-${i}`;
                    const isCompleted = completedTasks.includes(taskKey);

                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleTask(taskKey)}
                        className={`p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer select-none flex gap-2 items-start ${
                          isCompleted
                            ? 'bg-emerald-950/5 border-emerald-500/30 text-emerald-400/80 line-through'
                            : 'bg-dark-bg/30 border-dark-border/20 text-dark-muted hover:border-dark-border/60 hover:text-white'
                        }`}
                      >
                        <button type="button" className="shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-dark-muted group-hover:text-white" />
                          )}
                        </button>
                        <span>{task}</span>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <p className="text-xs text-dark-muted/70 italic text-center py-10">No modules scheduled. Focus on review.</p>
                  )}
                </div>
              </div>

              {/* Day completion footer */}
              {tasks.length > 0 && tasks.every((_: any, i: number) => completedTasks.includes(`${day}-${i}`)) && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl justify-center animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  DAY COMPLETED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Planner;
