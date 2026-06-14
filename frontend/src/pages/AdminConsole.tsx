import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Settings, 
  BarChart3, 
  PlusCircle, 
  Trash2,
  RefreshCw,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { api } from '../services/api';

export const AdminConsole: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USERS' | 'CURRICULUM'>('ANALYTICS');

  // Form States for curriculum creation
  const [careerName, setCareerName] = useState('');
  const [careerDesc, setCareerDesc] = useState('');

  // Project form states
  const [projCareerId, setProjCareerId] = useState('');
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projReqs, setProjReqs] = useState('');
  const [projDiff, setProjDiff] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [projSeniorTake, setProjSeniorTake] = useState('');

  // Cert form states
  const [certCareerId, setCertCareerId] = useState('');
  const [certName, setCertName] = useState('');
  const [certDiff, setCertDiff] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [certCost, setCertCost] = useState(150);
  const [certDur, setCertDur] = useState('2 months');
  const [certPrereqs, setCertPrereqs] = useState('Basic cloud familiarity');
  const [certUrl, setCertUrl] = useState('');
  const [certSeniorTake, setCertSeniorTake] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const uData = await api.getAdminUsers();
      setUsers(uData.users || []);

      const aData = await api.getAdminAnalytics();
      setAnalytics(aData);
      
      // Auto-set first career for form selects
      if (aData?.careers?.length > 0) {
        setProjCareerId(aData.careers[0].id);
        setCertCareerId(aData.careers[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator records. Make sure you are logged in as an ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.updateAdminUserRole(userId, newRole);
      setSuccess('User privilege level changed.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error updating user privileges.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    try {
      await api.deleteAdminUser(userId);
      setSuccess('User record permanently removed.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error deleting user.');
    }
  };

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.addAdminCareer(careerName, careerDesc);
      setSuccess(`Career track "${careerName}" added!`);
      setCareerName('');
      setCareerDesc('');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error adding career.');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const reqList = projReqs.split(',').map(r => r.trim()).filter(Boolean);
      await api.addAdminProject({
        careerId: projCareerId,
        name: projName,
        description: projDesc,
        requirements: reqList,
        difficulty: projDiff,
        seniorTake: projSeniorTake
      });
      setSuccess(`Project recommendation "${projName}" registered!`);
      setProjName('');
      setProjDesc('');
      setProjReqs('');
      setProjSeniorTake('');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error registering project.');
    }
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.addAdminCertification({
        careerId: certCareerId,
        name: certName,
        difficulty: certDiff,
        cost: certCost,
        duration: certDur,
        prerequisites: certPrereqs,
        url: certUrl,
        seniorTake: certSeniorTake
      });
      setSuccess(`Certification blueprint "${certName}" registered!`);
      setCertName('');
      setCertUrl('');
      setCertSeniorTake('');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error registering certification.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Opening secure admin channel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-dark-border/40">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Admin Command Console
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            System administration endpoints to moderate profiles, seed tracks, and overview database logs.
          </p>
        </div>

        {/* Console Navigation */}
        <div className="flex bg-dark-card border border-dark-border/60 p-1.5 rounded-xl self-start md:self-auto text-xs">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'ANALYTICS' ? 'bg-red-600 text-white' : 'text-dark-muted hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            System Stats
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'USERS' ? 'bg-red-600 text-white' : 'text-dark-muted hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Moderation ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('CURRICULUM')}
            className={`px-4.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'CURRICULUM' ? 'bg-red-600 text-white' : 'text-dark-muted hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Tracks
          </button>
        </div>
      </div>

      {/* Global notices */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* 1. ANALYTICS BLOCK */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-widest block">Registered Profiles</span>
              <span className="text-4xl font-black text-white block mt-2">{analytics.totalUsers}</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-widest block">Active Roadmaps</span>
              <span className="text-4xl font-black text-blue-400 block mt-2">{analytics.totalRoadmaps}</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-widest block">Avg Completion Rate</span>
              <span className="text-4xl font-black text-emerald-400 block mt-2">{analytics.averageCompletion}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Popular Careers */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-white text-base">Popular Career Tracks</h3>
              <div className="space-y-3 pt-2">
                {Object.entries(analytics.careerPopularity || {}).map(([cName, count]: any) => (
                  <div key={cName} className="flex justify-between items-center text-xs">
                    <span className="text-dark-muted font-semibold">{cName}</span>
                    <span className="font-bold text-white bg-dark-border px-2.5 py-0.5 rounded-md">{count} user{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
                {Object.keys(analytics.careerPopularity || {}).length === 0 && (
                  <p className="text-xs text-dark-muted italic">No active assessment tracks found.</p>
                )}
              </div>
            </div>

            {/* Curriculum Inventory */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-white text-base">Curriculum Inventory Log</h3>
              <div className="space-y-3 pt-2">
                {analytics.careers?.map((car: any) => (
                  <div key={car.id} className="flex justify-between items-center text-xs border-b border-dark-border/20 pb-2">
                    <span className="text-white font-bold">{car.name}</span>
                    <span className="text-[10px] text-dark-muted">
                      {car._count.skills} Skills • {car._count.projects} Projects • {car._count.certifications} Certs
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. USER MODERATION BLOCK */}
      {activeTab === 'USERS' && (
        <div className="glass-panel rounded-2xl overflow-hidden border-dark-border/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark-card border-b border-dark-border/60 text-dark-muted font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Desired Career</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/30 text-dark-text">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-card/35 transition-colors">
                    <td className="p-4 font-bold">{u.name}</td>
                    <td className="p-4 text-dark-muted">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 italic text-dark-muted">{u.assessment?.desiredCareer || 'None'}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className="px-2.5 py-1 bg-dark-card border border-dark-border rounded hover:bg-dark-border text-[10px] font-bold"
                        >
                          Toggle Admin
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ADD CURRICULUM FORM BLOCK */}
      {activeTab === 'CURRICULUM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Career Path */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <FolderOpen className="w-4.5 h-4.5 text-red-500" />
              Add Career Path
            </h3>
            <form onSubmit={handleCreateCareer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Career Name</label>
                <input
                  type="text"
                  placeholder="e.g. SRE Engineer"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Description</label>
                <textarea
                  placeholder="Summarize the career objectives..."
                  rows={4}
                  value={careerDesc}
                  onChange={(e) => setCareerDesc(e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-500 font-bold rounded-lg text-white"
              >
                Add Career Track
              </button>
            </form>
          </div>

          {/* Add Project Recommendation */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <PlusCircle className="w-4.5 h-4.5 text-blue-500" />
              Recommend Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Career Track</label>
                <select
                  value={projCareerId}
                  onChange={(e) => setProjCareerId(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                >
                  {analytics?.careers?.map((car: any) => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Terraform Cluster"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Requirements (Comma list)</label>
                <input
                  type="text"
                  placeholder="Requirement 1, Requirement 2"
                  value={projReqs}
                  onChange={(e) => setProjReqs(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-dark-muted block">Difficulty</label>
                  <select
                    value={projDiff}
                    onChange={(e) => setProjDiff(e.target.value as any)}
                    className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Description</label>
                <textarea
                  placeholder="Project specifications..."
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Dave's Resume Strategy Commentary</label>
                <textarea
                  placeholder="Why this project? What metrics should they show?"
                  rows={2}
                  value={projSeniorTake}
                  onChange={(e) => setProjSeniorTake(e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg text-white"
              >
                Register Project
              </button>
            </form>
          </div>

          {/* Add Certification */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <PlusCircle className="w-4.5 h-4.5 text-emerald-500" />
              Register Certification
            </h3>
            <form onSubmit={handleCreateCert} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Career Track</label>
                <select
                  value={certCareerId}
                  onChange={(e) => setCertCareerId(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                >
                  {analytics?.careers?.map((car: any) => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Cert Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS SysOps Associate"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-dark-muted block">Cost ($ USD)</label>
                  <input
                    type="number"
                    value={certCost}
                    onChange={(e) => setCertCost(parseInt(e.target.value))}
                    className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-dark-muted block">Duration</label>
                  <input
                    type="text"
                    value={certDur}
                    onChange={(e) => setCertDur(e.target.value)}
                    className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Prerequisites</label>
                <input
                  type="text"
                  value={certPrereqs}
                  onChange={(e) => setCertPrereqs(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Registry Info URL</label>
                <input
                  type="url"
                  placeholder="https://aws.amazon.com/certification"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  className="w-full p-2 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Senior Reality Check Warning</label>
                <textarea
                  placeholder="Recruiter perspective or exam prep warning..."
                  rows={2}
                  value={certSeniorTake}
                  onChange={(e) => setCertSeniorTake(e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border/60 rounded-lg text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white"
              >
                Register Certification
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
export default AdminConsole;
