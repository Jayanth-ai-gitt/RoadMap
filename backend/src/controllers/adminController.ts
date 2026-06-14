import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        assessment: {
          select: {
            desiredCareer: true,
            experienceLevel: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Server error listing users.' });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Role must be either USER or ADMIN' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, role: true }
    });

    res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Admin role update error:', error);
    res.status(500).json({ error: 'Server error updating user role.' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent deleting self
    if (userId === req.user?.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
};

export const addCareer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    const newCareer = await prisma.career.create({
      data: { name, description }
    });

    res.status(201).json({ message: 'Career track added successfully', career: newCareer });
  } catch (error: any) {
    console.error('Admin add career error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A career path with this name already exists.' });
    }
    res.status(500).json({ error: 'Server error adding career.' });
  }
};

export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { careerId, name, description, requirements, difficulty, seniorTake } = req.body;

    if (!careerId || !name || !description || !requirements || !difficulty || !seniorTake) {
      return res.status(400).json({ error: 'All project fields are required.' });
    }

    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career) return res.status(404).json({ error: 'Career path not found.' });

    const newProject = await prisma.project.create({
      data: {
        careerId,
        name,
        description,
        requirements: JSON.stringify(requirements), // Expecting array
        difficulty,
        seniorTake
      }
    });

    res.status(201).json({ message: 'Project recommended successfully', project: newProject });
  } catch (error) {
    console.error('Admin add project error:', error);
    res.status(500).json({ error: 'Server error adding project.' });
  }
};

export const addCertification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { careerId, name, difficulty, cost, duration, prerequisites, url, seniorTake } = req.body;

    if (!careerId || !name || !difficulty || cost === undefined || !duration || !prerequisites || !url || !seniorTake) {
      return res.status(400).json({ error: 'All certification fields are required.' });
    }

    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career) return res.status(404).json({ error: 'Career path not found.' });

    const newCert = await prisma.certification.create({
      data: {
        careerId,
        name,
        difficulty,
        cost: parseFloat(cost),
        duration,
        prerequisites,
        url,
        seniorTake
      }
    });

    res.status(201).json({ message: 'Certification registered successfully', certification: newCert });
  } catch (error) {
    console.error('Admin add certification error:', error);
    res.status(500).json({ error: 'Server error adding certification.' });
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRoadmaps = await prisma.roadmap.count();
    
    // Group active roadmaps by career
    const activeRoadmaps = await prisma.roadmap.findMany({
      include: {
        career: {
          select: { name: true }
        }
      }
    });

    const careerPopularity: Record<string, number> = {};
    let totalProgressSum = 0;

    activeRoadmaps.forEach(r => {
      const careerName = r.career.name;
      careerPopularity[careerName] = (careerPopularity[careerName] || 0) + 1;
      totalProgressSum += r.progress;
    });

    const averageCompletion = totalRoadmaps > 0 ? Math.round(totalProgressSum / totalRoadmaps) : 0;
    
    const careersInDb = await prisma.career.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            skills: true,
            projects: true,
            certifications: true
          }
        }
      }
    });

    res.status(200).json({
      totalUsers,
      totalRoadmaps,
      averageCompletion,
      careerPopularity,
      careers: careersInDb
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error retrieving system analytics.' });
  }
};
export default { listUsers, updateRole, deleteUser, addCareer, addProject, addCertification, getAnalytics };
