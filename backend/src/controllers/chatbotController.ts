import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Save user message in DB
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        message
      }
    });

    // Fetch user assessment profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { assessment: true }
    });

    // Fetch user progress percentage
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId }
    });

    const progress = {
      completedPercentage: activeRoadmap ? activeRoadmap.progress : 0
    };

    // Generate response (calls OpenAI or senior fallback engine)
    const replyText = await aiService.generateChatResponse(message, userProfile, progress);

    // Save assistant reply in DB
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        message: replyText
      }
    });

    res.status(200).json({
      message: assistantMessage
    });
  } catch (error: any) {
    console.error('Chat bot error:', error);
    res.status(500).json({ error: 'Server error generating chatbot response.' });
  }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50 // cap at 50 messages for memory/perf
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.status(500).json({ error: 'Server error retrieving chat history.' });
  }
};
