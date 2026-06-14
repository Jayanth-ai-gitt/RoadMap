const API_BASE = 'http://localhost:5000/api';

// Helper to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('careerpath_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic fetch handler with error logging
const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // ==========================================
  // Authentication API
  // ==========================================
  async signup(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(res);
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async updateProfile(profileData: { name?: string; email?: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // ==========================================
  // Roadmaps & Onboarding API
  // ==========================================
  async submitAssessment(data: {
    desiredCareer: string;
    education?: string;
    currentSkills?: string;
    experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    studyHoursPerDay: number;
    learningStyle: 'VISUAL' | 'PRACTICAL' | 'THEORETICAL';
  }) {
    const res = await fetch(`${API_BASE}/roadmaps/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMyRoadmap() {
    const res = await fetch(`${API_BASE}/roadmaps/my`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async updateSkillProgress(skillId: string, progressData: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    notes?: string;
    certificateUrl?: string;
  }) {
    const res = await fetch(`${API_BASE}/roadmaps/skills/${skillId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(progressData)
    });
    return handleResponse(res);
  },

  async getStudyPlan() {
    const res = await fetch(`${API_BASE}/roadmaps/study-plan`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  // ==========================================
  // Recommendations API
  // ==========================================
  async getRecommendedProjects() {
    const res = await fetch(`${API_BASE}/recommendations/projects`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async getRecommendedCertifications() {
    const res = await fetch(`${API_BASE}/recommendations/certifications`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  // ==========================================
  // Resume & Job Readiness API
  // ==========================================
  async getJobReadinessScore() {
    const res = await fetch(`${API_BASE}/readiness/job-score`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async analyzeResumeFile(file: File) {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await fetch(`${API_BASE}/readiness/analyze-resume`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }, // Content-Type is set automatically by fetch for FormData
      body: formData
    });
    return handleResponse(res);
  },

  async analyzeResumeText(text: string) {
    const res = await fetch(`${API_BASE}/readiness/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ resumeText: text })
    });
    return handleResponse(res);
  },

  // ==========================================
  // Chatbot API
  // ==========================================
  async sendChatMessage(message: string) {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ message })
    });
    return handleResponse(res);
  },

  async getChatHistory() {
    const res = await fetch(`${API_BASE}/chatbot/history`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  // ==========================================
  // Admin Panel API
  // ==========================================
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async updateAdminUserRole(userId: string, role: 'USER' | 'ADMIN') {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async deleteAdminUser(userId: string) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  },

  async addAdminCareer(name: string, description: string) {
    const res = await fetch(`${API_BASE}/admin/careers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, description })
    });
    return handleResponse(res);
  },

  async addAdminProject(projectData: {
    careerId: string;
    name: string;
    description: string;
    requirements: string[];
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    seniorTake: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(projectData)
    });
    return handleResponse(res);
  },

  async addAdminCertification(certData: {
    careerId: string;
    name: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    cost: number;
    duration: string;
    prerequisites: string;
    url: string;
    seniorTake: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/certifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(certData)
    });
    return handleResponse(res);
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeaders() }
    });
    return handleResponse(res);
  }
};
export default api;
