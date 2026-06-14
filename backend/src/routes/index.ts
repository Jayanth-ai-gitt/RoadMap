import { Router } from 'express';
import multer from 'multer';

// Controllers
import {
  registerUser,
  loginUser,
  forgotPassword,
  getProfile,
  updateProfile
} from '../controllers/authController';

import {
  submitAssessment,
  getMyRoadmap,
  updateSkillProgress,
  getStudyPlan
} from '../controllers/roadmapController';

import {
  getRecommendedProjects,
  getRecommendedCertifications
} from '../controllers/recommendationController';

import {
  analyzeResume,
  getJobReadinessScore
} from '../controllers/readinessController';

import {
  sendMessage,
  getChatHistory
} from '../controllers/chatbotController';

import {
  listUsers,
  updateRole,
  deleteUser,
  addCareer,
  addProject,
  addCertification,
  getAnalytics
} from '../controllers/adminController';

// Middleware
import { authenticateJWT, requireAdmin } from '../middleware/auth';

// Multer memory storage setup for handling PDF/TXT uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/forgot-password', forgotPassword);
router.get('/auth/profile', authenticateJWT, getProfile);
router.put('/auth/profile', authenticateJWT, updateProfile);

// ==========================================
// Roadmap / Assessment Routes
// ==========================================
router.post('/roadmaps/assess', authenticateJWT, submitAssessment);
router.get('/roadmaps/my', authenticateJWT, getMyRoadmap);
router.patch('/roadmaps/skills/:skillId/progress', authenticateJWT, updateSkillProgress);
router.get('/roadmaps/study-plan', authenticateJWT, getStudyPlan);

// ==========================================
// Recommendation Engine Routes
// ==========================================
router.get('/recommendations/projects', authenticateJWT, getRecommendedProjects);
router.get('/recommendations/certifications', authenticateJWT, getRecommendedCertifications);

// ==========================================
// Job & Resume Readiness Score Routes
// ==========================================
router.post('/readiness/analyze-resume', authenticateJWT, upload.single('resume'), analyzeResume);
router.get('/readiness/job-score', authenticateJWT, getJobReadinessScore);

// ==========================================
// AI Chatbot Route
// ==========================================
router.post('/chatbot/message', authenticateJWT, sendMessage);
router.get('/chatbot/history', authenticateJWT, getChatHistory);

// ==========================================
// Admin Panel Routes
// ==========================================
router.get('/admin/users', authenticateJWT, requireAdmin, listUsers);
router.put('/admin/users/:userId/role', authenticateJWT, requireAdmin, updateRole);
router.delete('/admin/users/:userId', authenticateJWT, requireAdmin, deleteUser);
router.post('/admin/careers', authenticateJWT, requireAdmin, addCareer);
router.post('/admin/projects', authenticateJWT, requireAdmin, addProject);
router.post('/admin/certifications', authenticateJWT, requireAdmin, addCertification);
router.get('/admin/analytics', authenticateJWT, requireAdmin, getAnalytics);

export default router;
