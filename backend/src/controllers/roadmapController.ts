import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { desiredCareer, education, currentSkills, experienceLevel, studyHoursPerDay, learningStyle } = req.body;

    if (!desiredCareer || !experienceLevel || !studyHoursPerDay || !learningStyle) {
      return res.status(400).json({ error: 'Missing required assessment parameters.' });
    }

    // 1. Create or Update User Assessment
    const assessment = await prisma.assessment.upsert({
      where: { userId },
      update: {
        desiredCareer,
        education: education || 'Self-taught',
        currentSkills: currentSkills || '',
        experienceLevel,
        studyHoursPerDay: parseFloat(studyHoursPerDay),
        learningStyle
      },
      create: {
        userId,
        desiredCareer,
        education: education || 'Self-taught',
        currentSkills: currentSkills || '',
        experienceLevel,
        studyHoursPerDay: parseFloat(studyHoursPerDay),
        learningStyle
      }
    });

    // 2. Check if a Career exists in DB matching the query
    let career = await prisma.career.findFirst({
      where: {
        name: {
          contains: desiredCareer
        }
      }
    });

    // If no matching career exists, create a dynamic Career
    if (!career) {
      career = await prisma.career.create({
        data: {
          name: desiredCareer,
          description: `Custom AI-generated career track for ${desiredCareer}.`
        }
      });
    }

    // 3. Generate Roadmap Skills (calls OpenAI or fallback template system)
    const aiRoadmap = await aiService.generateRoadmap(desiredCareer, experienceLevel, currentSkills);

    // 4. Create Skills in DB if they do not exist for this Career yet
    // To prevent duplicate additions, we check existing skills for this career
    const existingSkills = await prisma.skill.findMany({
      where: { careerId: career.id }
    });

    if (existingSkills.length === 0) {
      // Create skills
      const skillPromises = aiRoadmap.skills.map((s: any, idx: number) => {
        return prisma.skill.create({
          data: {
            careerId: career!.id,
            name: s.name,
            description: s.description,
            phase: s.phase === 'ADVANCED' ? 'ADVANCED' : s.phase === 'CORE' ? 'CORE' : 'FUNDAMENTALS',
            order: s.order || idx + 1,
            seniorTips: s.seniorTips || 'Master the fundamentals and build small proof of concepts.',
            resources: JSON.stringify(s.resources || [])
          }
        });
      });
      await Promise.all(skillPromises);
    }

    // 5. Connect Roadmap of User to Career
    const roadmap = await prisma.roadmap.upsert({
      where: {
        userId_careerId: {
          userId,
          careerId: career.id
        }
      },
      update: { progress: 0 },
      create: {
        userId,
        careerId: career.id,
        progress: 0
      }
    });

    // 6. Initialize UserProgress entries for all skills of this Career
    const allSkills = await prisma.skill.findMany({
      where: { careerId: career.id }
    });

    const progressPromises = allSkills.map(skill => {
      return prisma.userProgress.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: skill.id
          }
        },
        update: {}, // keep status as is if already existing
        create: {
          userId,
          skillId: skill.id,
          status: 'NOT_STARTED',
          notes: '',
          certificateUrl: ''
        }
      });
    });
    await Promise.all(progressPromises);

    // 7. Clear old study plans so a new one can be generated for the new career path
    await prisma.studyPlan.deleteMany({
      where: { userId }
    });

    res.status(200).json({
      message: 'Assessment completed. Roadmap generated successfully.',
      assessment,
      careerId: career.id,
      roadmapId: roadmap.id
    });
  } catch (error: any) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ error: 'Server error during assessment and roadmap generation.' });
  }
};

export const getMyRoadmap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find user's active roadmap
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        career: {
          include: {
            skills: {
              orderBy: [{ phase: 'asc' }, { order: 'asc' }]
            }
          }
        }
      }
    });

    if (!activeRoadmap) {
      return res.status(404).json({ error: 'No active roadmap found. Please complete the assessment first.' });
    }

    // Fetch user's completion progress for these skills
    const progressRecords = await prisma.userProgress.findMany({
      where: { userId }
    });

    // Map progress status to skills
    const skillsWithProgress = activeRoadmap.career.skills.map(skill => {
      const prog = progressRecords.find(p => p.skillId === skill.id);
      return {
        ...skill,
        resources: JSON.parse(skill.resources || '[]'),
        userProgress: prog ? {
          status: prog.status,
          notes: prog.notes,
          certificateUrl: prog.certificateUrl,
          updatedAt: prog.updatedAt
        } : {
          status: 'NOT_STARTED',
          notes: '',
          certificateUrl: ''
        }
      };
    });

    // Calculate overall completion rate
    const completedCount = progressRecords.filter(p => 
      activeRoadmap.career.skills.some(s => s.id === p.skillId) && p.status === 'COMPLETED'
    ).length;
    
    const totalCount = activeRoadmap.career.skills.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Update the roadmap progress in DB if changed
    if (activeRoadmap.progress !== progressPercent) {
      await prisma.roadmap.update({
        where: { id: activeRoadmap.id },
        data: { progress: progressPercent }
      });
    }

    res.status(200).json({
      id: activeRoadmap.id,
      career: {
        id: activeRoadmap.career.id,
        name: activeRoadmap.career.name,
        description: activeRoadmap.career.description
      },
      skills: skillsWithProgress,
      progress: Math.round(progressPercent)
    });
  } catch (error: any) {
    console.error('Fetch roadmap error:', error);
    res.status(500).json({ error: 'Server error retrieving roadmap.' });
  }
};

export const updateSkillProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { skillId } = req.params;
    const { status, notes, certificateUrl } = req.body;

    if (!skillId) {
      return res.status(400).json({ error: 'Skill ID is required' });
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Update or Create Progress
    const updatedProgress = await prisma.userProgress.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      },
      update: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        certificateUrl: certificateUrl !== undefined ? certificateUrl : undefined
      },
      create: {
        userId,
        skillId,
        status: status || 'NOT_STARTED',
        notes: notes || '',
        certificateUrl: certificateUrl || ''
      }
    });

    // Re-calculate user's total roadmap progress
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId, careerId: skill.careerId }
    });

    if (activeRoadmap) {
      const careerSkills = await prisma.skill.findMany({
        where: { careerId: skill.careerId }
      });

      const userProgressList = await prisma.userProgress.findMany({
        where: { userId, skillId: { in: careerSkills.map(s => s.id) } }
      });

      const completedCount = userProgressList.filter(p => p.status === 'COMPLETED').length;
      const progressPercent = careerSkills.length > 0 ? (completedCount / careerSkills.length) * 100 : 0;

      await prisma.roadmap.update({
        where: { id: activeRoadmap.id },
        data: { progress: progressPercent }
      });
    }

    res.status(200).json({
      message: 'Progress updated successfully',
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error updating progress.' });
  }
};

export const getStudyPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user has an assessment profile and study hours
    const userAssessment = await prisma.assessment.findUnique({
      where: { userId }
    });

    if (!userAssessment) {
      return res.status(400).json({ error: 'Please complete the assessment first to setup study parameters.' });
    }

    // See if study plan already exists
    let studyPlan = await prisma.studyPlan.findFirst({
      where: { userId }
    });

    if (!studyPlan) {
      // Get active roadmap
      const activeRoadmap = await prisma.roadmap.findFirst({
        where: { userId },
        include: {
          career: {
            include: {
              skills: {
                orderBy: [{ phase: 'asc' }, { order: 'asc' }]
              }
            }
          }
        }
      });

      if (!activeRoadmap) {
        return res.status(400).json({ error: 'No active roadmap found. Cannot generate study plan.' });
      }

      // Filter skills that are not completed yet
      const progressList = await prisma.userProgress.findMany({
        where: { userId }
      });

      const uncompletedSkills = activeRoadmap.career.skills.filter(skill => {
        const prog = progressList.find(p => p.skillId === skill.id);
        return !prog || prog.status !== 'COMPLETED';
      });

      // Generate a new study plan
      const planResult = await aiService.generateStudyPlan(
        userId,
        { skills: uncompletedSkills },
        userAssessment.studyHoursPerDay
      );

      // Save plan to DB
      studyPlan = await prisma.studyPlan.create({
        data: {
          userId,
          weeklyGoal: planResult.weeklyGoal,
          dailyTasks: JSON.stringify(planResult.dailyTasks)
        }
      });
    }

    res.status(200).json({
      id: studyPlan.id,
      weeklyGoal: studyPlan.weeklyGoal,
      dailyTasks: JSON.parse(studyPlan.dailyTasks)
    });
  } catch (error) {
    console.error('Fetch study plan error:', error);
    res.status(500).json({ error: 'Server error retrieving study plan.' });
  }
};
