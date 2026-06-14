import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const getRecommendedProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find active roadmap
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        career: true
      }
    });

    if (!activeRoadmap) {
      return res.status(400).json({ error: 'Please set up a career goal first.' });
    }

    // Fetch projects for this career
    const projects = await prisma.project.findMany({
      where: { careerId: activeRoadmap.careerId }
    });

    // Determine user's progress level to suggest difficulty
    const userProgress = activeRoadmap.progress; // percentage
    let suggestedDifficulty = 'BEGINNER';
    if (userProgress >= 70) {
      suggestedDifficulty = 'ADVANCED';
    } else if (userProgress >= 30) {
      suggestedDifficulty = 'INTERMEDIATE';
    }

    // Parse requirement strings from JSON
    const projectsWithRequirements = projects.map(p => ({
      ...p,
      requirements: JSON.parse(p.requirements || '[]')
    }));

    res.status(200).json({
      careerName: activeRoadmap.career.name,
      progress: activeRoadmap.progress,
      suggestedDifficulty,
      projects: projectsWithRequirements
    });
  } catch (error) {
    console.error('Projects recommendation error:', error);
    res.status(500).json({ error: 'Server error retrieving project recommendations.' });
  }
};

export const getRecommendedCertifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find active roadmap
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        career: true
      }
    });

    if (!activeRoadmap) {
      return res.status(400).json({ error: 'Please set up a career goal first.' });
    }

    // Fetch certifications for this career
    const certifications = await prisma.certification.findMany({
      where: { careerId: activeRoadmap.careerId }
    });

    res.status(200).json({
      careerName: activeRoadmap.career.name,
      certifications
    });
  } catch (error) {
    console.error('Certifications recommendation error:', error);
    res.status(500).json({ error: 'Server error retrieving certification recommendations.' });
  }
};
