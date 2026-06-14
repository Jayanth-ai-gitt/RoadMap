import { Response } from 'express';
import pdfParse from 'pdf-parse';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch active roadmap
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        career: {
          include: {
            skills: true,
            projects: true,
            certifications: true
          }
        }
      }
    });

    if (!activeRoadmap) {
      return res.status(400).json({ error: 'Please set up a career goal roadmap first.' });
    }

    let resumeText = '';

    // Handle File Upload or Text Paste
    if (req.file) {
      const buffer = req.file.buffer;
      if (req.file.mimetype === 'application/pdf') {
        try {
          const parsedPdf = await pdfParse(buffer);
          resumeText = parsedPdf.text;
        } catch (pdfError) {
          console.error('PDF parsing error, falling back to text read:', pdfError);
          resumeText = buffer.toString('utf8');
        }
      } else {
        resumeText = buffer.toString('utf8');
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText || resumeText.trim() === '') {
      return res.status(400).json({ error: 'No resume content provided. Please upload a PDF/TXT file or paste your resume text.' });
    }

    // Prepare inputs for AI analysis
    const careerName = activeRoadmap.career.name;
    const requiredSkills = activeRoadmap.career.skills.map(s => s.name);
    const requiredProjects = activeRoadmap.career.projects.map(p => p.name);
    const requiredCerts = activeRoadmap.career.certifications.map(c => c.name);

    // Call AI Analyzer
    const analysis = await aiService.analyzeResume(
      resumeText,
      careerName,
      requiredSkills,
      requiredProjects,
      requiredCerts
    );

    // Save history in DB
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId,
        resumeText,
        score: analysis.score,
        missingSkills: JSON.stringify(analysis.missingSkills),
        missingProjects: JSON.stringify(analysis.missingProjects),
        missingCertifications: JSON.stringify(analysis.missingCertifications),
        improvementSuggestions: JSON.stringify(analysis.improvementSuggestions)
      }
    });

    res.status(200).json({
      id: savedAnalysis.id,
      score: savedAnalysis.score,
      missingSkills: JSON.parse(savedAnalysis.missingSkills),
      missingProjects: JSON.parse(savedAnalysis.missingProjects),
      missingCertifications: JSON.parse(savedAnalysis.missingCertifications),
      improvementSuggestions: JSON.parse(savedAnalysis.improvementSuggestions)
    });
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Server error analyzing resume.' });
  }
};

export const getJobReadinessScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch active roadmap
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        career: {
          include: {
            skills: true,
            projects: true,
            certifications: true
          }
        }
      }
    });

    if (!activeRoadmap) {
      return res.status(400).json({ error: 'Please set up a career goal first.' });
    }

    // Get user progress
    const progressRecords = await prisma.userProgress.findMany({
      where: { userId }
    });

    const careerSkills = activeRoadmap.career.skills;
    const totalSkills = careerSkills.length;
    const completedSkills = progressRecords.filter(p => 
      careerSkills.some(s => s.id === p.skillId) && p.status === 'COMPLETED'
    ).length;

    // 1. Skill Score (50%)
    const skillScoreWeight = 50;
    const skillRatio = totalSkills > 0 ? completedSkills / totalSkills : 0;
    const skillScore = skillRatio * skillScoreWeight;

    // 2. Project Score (30%) - Linked to Core & Advanced skill completion
    const coreAdvancedSkills = careerSkills.filter(s => s.phase === 'CORE' || s.phase === 'ADVANCED');
    const completedCoreAdvanced = progressRecords.filter(p => 
      coreAdvancedSkills.some(s => s.id === p.skillId) && p.status === 'COMPLETED'
    ).length;
    
    const projectScoreWeight = 30;
    const projectRatio = coreAdvancedSkills.length > 0 ? completedCoreAdvanced / coreAdvancedSkills.length : 0;
    const projectScore = projectRatio * projectScoreWeight;

    // 3. Certification Score (20%) - Simulates progress on cert targets based on completed Advanced skills
    const advancedSkills = careerSkills.filter(s => s.phase === 'ADVANCED');
    const completedAdvanced = progressRecords.filter(p => 
      advancedSkills.some(s => s.id === p.skillId) && p.status === 'COMPLETED'
    ).length;
    
    const certScoreWeight = 20;
    const certRatio = advancedSkills.length > 0 ? completedAdvanced / advancedSkills.length : 0;
    const certScore = certRatio * certScoreWeight;

    // Composite Job Readiness
    const overallScore = Math.min(Math.round(skillScore + projectScore + certScore), 100);

    // Identify Remaining Requirements
    const remainingRequirements: string[] = [];
    
    // Find up to 2 uncompleted Core/Advanced skills
    const uncompletedSkills = careerSkills
      .filter(s => !progressRecords.some(p => p.skillId === s.id && p.status === 'COMPLETED'))
      .slice(0, 2);

    uncompletedSkills.forEach(s => {
      remainingRequirements.push(`Learn ${s.name} (${s.phase.toLowerCase()} skill)`);
    });

    // Check project suggestion
    if (projectRatio < 0.5 && activeRoadmap.career.projects.length > 0) {
      remainingRequirements.push(`Build a project (e.g. ${activeRoadmap.career.projects[0].name})`);
    }

    // Check certification suggestion
    if (certRatio < 0.5 && activeRoadmap.career.certifications.length > 0) {
      remainingRequirements.push(`Study for certification (e.g. ${activeRoadmap.career.certifications[0].name})`);
    }

    res.status(200).json({
      careerName: activeRoadmap.career.name,
      jobReadinessScore: overallScore,
      breakdown: {
        skills: Math.round(skillRatio * 100),
        projects: Math.round(projectRatio * 100),
        certifications: Math.round(certRatio * 100)
      },
      remainingRequirements
    });
  } catch (error) {
    console.error('Job readiness score error:', error);
    res.status(500).json({ error: 'Server error calculating job readiness.' });
  }
};
