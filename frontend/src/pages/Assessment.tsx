import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Clock, 
  Compass 
} from 'lucide-react';
import { api } from '../services/api';

export const Assessment: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Onboarding Form State
  const [desiredCareer, setDesiredCareer] = useState('DevOps Engineer');
  const [customCareer, setCustomCareer] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [education, setEducation] = useState('Computer Science Degree');
  const [currentSkills, setCurrentSkills] = useState('');
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(2);
  const [learningStyle, setLearningStyle] = useState<'VISUAL' | 'PRACTICAL' | 'THEORETICAL'>('PRACTICAL');

  const careerOptions = [
    'DevOps Engineer',
    'Cloud Engineer',
    'Full Stack Developer',
    'AI Engineer',
    'Cybersecurity Analyst',
    'Custom Track'
  ];

  const handleNext = () => {
    console.log('handleNext clicked. Current step was:', step);
    setStep((s) => {
      const next = Math.min(s + 1, 3);
      console.log('Setting step to:', next);
      return next;
    });
  };

  const handleBack = () => {
    console.log('handleBack clicked. Current step was:', step);
    setStep((s) => {
      const prev = Math.max(s - 1, 1);
      console.log('Setting step to:', prev);
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalCareer = desiredCareer === 'Custom Track' ? customCareer : desiredCareer;
    if (!finalCareer || finalCareer.trim() === '') {
      setError('Please specify your desired career goal.');
      setLoading(false);
      return;
    }

    try {
      await api.submitAssessment({
        desiredCareer: finalCareer,
        education,
        currentSkills,
        experienceLevel,
        studyHoursPerDay,
        learningStyle
      });
      // Assessment completed, redirect to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-glass p-8 md:p-10 relative z-10 border border-dark-border/40 bg-dark-card/90">
        
        {/* Progress bar */}
        <div className="w-full bg-dark-border/50 h-1.5 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <div>
          {/* STEP 1: Desired Career & Experience */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Compass className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl md:text-2xl font-extrabold text-white">Choose Your Goal Path</h2>
              </div>
              <p className="text-sm text-dark-muted">
                Choose a targeted path to begin your senior-curated system training program.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDesiredCareer(option)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      desiredCareer === option 
                        ? 'border-blue-500 bg-blue-500/10 font-bold' 
                        : 'border-dark-border/40 hover:border-dark-border/80 bg-dark-bg/40'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {desiredCareer === 'Custom Track' && (
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                    Specify Custom Career Track
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Systems Engineer, Data Scientist"
                    value={customCareer}
                    onChange={(e) => setCustomCareer(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-dark-text"
                    required
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                  Select Your Current Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        experienceLevel === level 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-dark-border/40 hover:border-dark-border/80 bg-dark-bg/40 text-dark-muted'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education & Skills */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl md:text-2xl font-extrabold text-white">Your Technical Background</h2>
              </div>
              <p className="text-sm text-dark-muted">
                Provide your background. A senior uses this to skip skills you already have.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider mb-2">
                    Current Education / Background
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-dark-text"
                  >
                    <option value="Computer Science Degree">Computer Science / Software Engineering Degree</option>
                    <option value="Other Technical Degree">Other STEM / Technical Degree</option>
                    <option value="Self-taught Developer">Self-taught / Bootcamps</option>
                    <option value="Non-technical Transition">Non-technical Background</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider mb-2">
                    Current Skills (Comma separated list)
                  </label>
                  <textarea
                    placeholder="e.g. HTML, CSS, JavaScript, Basic Git, Python"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-dark-text"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Time Commitments & Learning Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-extrabold text-white">Planner Configuration</h2>
              </div>
              <p className="text-sm text-dark-muted">
                Configure your time commitments. The weekly scheduler divides tasks to keep progress sustainable.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                      Study Time (Hours / Day)
                    </label>
                    <span className="text-sm font-bold text-blue-400">{studyHoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={studyHoursPerDay}
                    onChange={(e) => setStudyHoursPerDay(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-dark-muted mt-1 font-semibold">
                    <span>1 Hour (Casual)</span>
                    <span>4 Hours (Dedicated)</span>
                    <span>8 Hours (Intense Boot camp)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                    Preferred Learning Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['PRACTICAL', 'VISUAL', 'THEORETICAL'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setLearningStyle(style)}
                        className={`p-4 rounded-xl text-xs font-bold border text-left transition-all ${
                          learningStyle === style 
                            ? 'border-emerald-500 bg-emerald-500/10' 
                            : 'border-dark-border/40 hover:border-dark-border/80 bg-dark-bg/40 text-dark-muted'
                        }`}
                      >
                        <span className="block font-bold text-sm text-white mb-1">
                          {style === 'PRACTICAL' ? 'Hands-On' : style === 'VISUAL' ? 'Interactive' : 'Conceptual'}
                        </span>
                        {style === 'PRACTICAL' && 'Build project pipelines.'}
                        {style === 'VISUAL' && 'Video guides & diagrams.'}
                        {style === 'THEORETICAL' && 'Official docs & RFC specs.'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-dark-border/30 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted hover:text-white flex items-center gap-2 text-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 text-sm transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-extrabold flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing & Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Build My Roadmap
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
export default Assessment;
