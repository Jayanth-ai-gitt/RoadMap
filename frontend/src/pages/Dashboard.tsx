import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Milestone, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch roadmap
        const roadmapData = await api.getMyRoadmap();
        setRoadmap(roadmapData);

        // Fetch job readiness score
        const readinessData = await api.getJobReadinessScore();
        setReadiness(readinessData);

        // Fetch study plan tasks
        const studyPlanData = await api.getStudyPlan();
        setStudyPlan(studyPlanData);
      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err);
        // If 404, redirect to assessment
        if (err.message && err.message.includes('assessment')) {
          navigate('/assessment');
        } else {
          setError('Could not retrieve dashboard data. Make sure backend service is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Loading your career metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel border-red-500/30 bg-red-500/5 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 mt-10">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Oops! Dashboard Error</h2>
        <p className="text-sm text-dark-muted">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-5 py-2.5 bg-dark-card border border-dark-border text-sm rounded-xl hover:bg-dark-border/40 font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const progress = roadmap?.progress || 0;
  const chartData = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress }
  ];
  const COLORS = ['#10B981', '#334155']; // Emerald and Slate

  // Get next 3 skills in progress / not started
  const nextSkills = (roadmap?.skills || [])
    .filter((s: any) => s.userProgress.status !== 'COMPLETED')
    .slice(0, 3);

  // Extract a list of today's tasks from the study plan
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const plannerTasks = studyPlan?.dailyTasks?.[today] || studyPlan?.dailyTasks?.['Monday'] || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-gradient-to-tr from-blue-900/30 to-emerald-950/20 border border-dark-border/40">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">ACTIVE PATHWAY</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">{roadmap?.career?.name}</h2>
          <p className="text-sm text-dark-muted max-w-xl">
            {roadmap?.career?.description}
          </p>
        </div>
        <div className="shrink-0 flex gap-3">
          <Link
            to="/roadmap"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all"
          >
            Go to Roadmap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid of Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Progress Gauge */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-sm font-bold text-dark-muted uppercase tracking-wider mb-2 self-start">Roadmap Completion</h3>
          
          <div className="w-44 h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white">{progress}%</span>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">completed</p>
            </div>
          </div>

          <div className="flex gap-4 mt-2 text-xs font-semibold text-dark-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Done ({(roadmap?.skills || []).filter((s: any) => s.userProgress.status === 'COMPLETED').length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-dark-border" />
              <span>Pending ({(roadmap?.skills || []).filter((s: any) => s.userProgress.status !== 'COMPLETED').length})</span>
            </div>
          </div>
        </div>

        {/* Job Readiness Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-dark-muted uppercase tracking-wider">Job Readiness Score</h3>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl font-black text-white">{readiness?.jobReadinessScore}%</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Score
              </span>
            </div>
            <p className="text-xs text-dark-muted pt-1">
              Recruiter-aligned threshold is 75% for internship / entry roles.
            </p>
          </div>

          {/* Progress gauge visual */}
          <div className="w-full bg-dark-border/40 h-2 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full"
              style={{ width: `${readiness?.jobReadinessScore}%` }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-dark-border/40 space-y-1.5">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider">Missing Highlights</h4>
            <ul className="text-xs text-white space-y-1 list-disc list-inside">
              {(readiness?.remainingRequirements || []).slice(0, 2).map((req: string, i: number) => (
                <li key={i} className="truncate text-dark-muted">{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Study Plan Snapshot */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-dark-muted uppercase tracking-wider">Today's Study Sprint</h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {today}
              </span>
            </div>
            <p className="text-xs text-dark-muted mb-4 line-clamp-2 italic">
              "Goal: {studyPlan?.weeklyGoal}"
            </p>

            <div className="space-y-2">
              {plannerTasks.length > 0 ? (
                plannerTasks.slice(0, 2).map((task: string, i: number) => (
                  <div key={i} className="flex gap-2 p-2.5 rounded-xl bg-dark-bg/40 border border-dark-border/20 text-xs">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-dark-muted line-clamp-2">{task}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-dark-muted">
                  No tasks scheduled. Go to planner to configure weekly study modules.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/planner"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-4 flex items-center gap-1 self-start"
          >
            Open planner board
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Milestones (Left & Middle) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Milestone className="w-5 h-5 text-emerald-400" />
              Your Next Study Milestones
            </h3>
            <Link to="/roadmap" className="text-xs text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {nextSkills.map((skill: any, i: number) => (
              <div 
                key={skill.id} 
                className="p-4 rounded-xl bg-dark-bg/30 border border-dark-border/30 hover:border-dark-border/60 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      skill.phase === 'FUNDAMENTALS' ? 'bg-blue-500/10 text-blue-400' :
                      skill.phase === 'CORE' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {skill.phase}
                    </span>
                    <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                  </div>
                  <p className="text-xs text-dark-muted line-clamp-1">{skill.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[10px] text-dark-muted italic">Status: {skill.userProgress.status.replace('_', ' ')}</span>
                  <button 
                    onClick={() => navigate('/roadmap')}
                    className="px-3.5 py-1.5 bg-dark-card border border-dark-border text-[11px] font-bold rounded-lg text-white hover:bg-dark-border/40"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}

            {nextSkills.length === 0 && (
              <div className="text-center py-12 text-sm text-dark-muted">
                🏆 Excellent! You have completed all milestones on this roadmap. Run admin tools to select another track!
              </div>
            )}
          </div>
        </div>

        {/* AI Senior Advice Widget (Right) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-dark-card to-blue-950/10 border-blue-500/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Senior Mentor Insights</h3>
            </div>

            <div className="relative p-4 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-xs leading-relaxed text-dark-muted italic">
              "Master the command line, learn containerization, and build projects that simulate real deployment loads. Tutorial certificates don't impress recruiters; production metrics do. Get to building."
              <span className="block text-right mt-2 text-[10px] text-blue-400 font-bold uppercase not-italic">— Architect Dave (15+ Yrs Exp)</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[11px] text-dark-muted">Have a doubt about Kubernetes or AWS Solutions Exam prep?</p>
            <Link
              to="/mentor"
              className="w-full py-2.5 rounded-xl bg-dark-card border border-dark-border hover:bg-dark-border/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              Ask Senior Mentor Chatbot
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
