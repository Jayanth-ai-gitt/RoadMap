import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Shield, Award, Calendar, Activity } from 'lucide-react';
import { api } from '../services/api';

export const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setUserProfile(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err) {
      console.error(err);
      setError('Could not fetch user profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const data = await api.updateProfile(payload);
      setSuccess('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setUserProfile((prev: any) => ({ ...prev, name: data.user.name, email: data.user.email }));
    } catch (err: any) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Opening profile settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-dark-border/40">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-blue-500" />
          Profile Settings
        </h2>
        <p className="text-sm text-dark-muted mt-1">
          Manage your account credentials and review your onboarding setup configuration.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Account Details Form */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-extrabold text-white">Update Account Credentials</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">New Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dark-muted block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg border border-dark-border/60 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/10"
            >
              {saveLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Assessment summary card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-dark-border/40">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-base">Onboarding Metadata</h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-dark-border/20">
                <span className="text-dark-muted font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Target Path
                </span>
                <span className="font-bold text-white text-right">{userProfile?.assessment?.desiredCareer || 'Not Configured'}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-dark-border/20">
                <span className="text-dark-muted font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Experience
                </span>
                <span className="font-bold text-white uppercase">{userProfile?.assessment?.experienceLevel || 'Beginner'}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-dark-border/20">
                <span className="text-dark-muted font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Learning Speed
                </span>
                <span className="font-bold text-white">{userProfile?.assessment?.studyHoursPerDay || 2} hours/day</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-muted font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-400" />
                  User Role
                </span>
                <span className="font-bold text-white bg-dark-border px-2 py-0.5 rounded">{userProfile?.role}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-border/30 mt-6 text-[10px] text-dark-muted">
            Registered: {new Date(userProfile?.createdAt).toLocaleDateString()}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Profile;
