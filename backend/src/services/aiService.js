"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// Global toggle/helper to call OpenAI if API key exists
const callOpenAI = async (prompt, systemPrompt) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('No OpenAI API key');
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }
        const data = (await response.json());
        return data.choices[0].message.content || '';
    }
    catch (error) {
        console.error('Failed to call OpenAI, falling back to local engine:', error);
        throw error;
    }
};
// Local Rule-Based Template Engine (Simulates a 15+ Years Senior Developer)
exports.aiService = {
    /**
     * Generates or fetches a roadmap.
     * If OpenAI is available, it generates customized details.
     * If not, it uses our high-fidelity database matching.
     */
    async generateRoadmap(desiredCareer, experienceLevel, currentSkills) {
        const systemPrompt = `You are a legendary software engineering veteran and senior tech lead with 15+ years of production experience in building large scale systems. 
You are design-oriented, highly pragmatic, and reject theoretical over-engineering.
Generate a career roadmap for a junior aiming to become a ${desiredCareer}.
Format the response as a valid JSON object containing:
{
  "skills": [
    {
      "name": "Skill Name",
      "description": "Short explanation",
      "phase": "FUNDAMENTALS" | "CORE" | "ADVANCED",
      "order": 1,
      "seniorTips": "Blunt real-world senior advice, common pitfalls and production context.",
      "resources": [
        { "title": "Resource Name", "url": "URL link", "type": "official-documentation" | "tutorial" | "course" }
      ]
    }
  ]
}`;
        const prompt = `Target Career: ${desiredCareer}
Current Experience Level: ${experienceLevel}
Current Skills: ${currentSkills}

Please customize the roadmap. Omit or compress skills they already have. Give them pragmatic, production-focused guidance for a junior to work effectively in a team.`;
        try {
            const aiResponse = await callOpenAI(prompt, systemPrompt);
            return JSON.parse(aiResponse);
        }
        catch {
            // Fallback: Fetch matching pre-seeded Career data
            try {
                const matchedCareer = await client_1.default.career.findFirst({
                    where: {
                        name: {
                            contains: desiredCareer
                        }
                    },
                    include: {
                        skills: {
                            orderBy: [{ phase: 'asc' }, { order: 'asc' }]
                        }
                    }
                });
                if (matchedCareer) {
                    // Format db results to match standard JSON structure
                    return {
                        skills: matchedCareer.skills.map(skill => ({
                            name: skill.name,
                            description: skill.description,
                            phase: skill.phase,
                            order: skill.order,
                            seniorTips: skill.seniorTips,
                            resources: JSON.parse(skill.resources || '[]')
                        }))
                    };
                }
            }
            catch (dbError) {
                console.warn('Database connection failed during assessment fallback, loading static templates:', dbError);
            }
            // Return a default DevOps-like structure if nothing is found or DB is unreachable
            return {
                skills: [
                    {
                        name: 'Linux Basics & Shell Scripting',
                        description: 'Understanding directories, file permissions, users, and writing basic bash scripts.',
                        phase: 'FUNDAMENTALS',
                        order: 1,
                        seniorTips: 'Do not waste time memorizing flags. Learn piping, grep, awk, and understand how permissions work. If you do not know chmod, you will lock yourself out of servers.',
                        resources: [{ title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'course' }]
                    },
                    {
                        name: 'Git and GitOps',
                        description: 'Version control workflows, commit standards, and basic branch management.',
                        phase: 'FUNDAMENTALS',
                        order: 2,
                        seniorTips: 'Learn how to rebase and squash. In production, clean git logs are life-saving. Tutorial-style merge commits are a mess.',
                        resources: [{ title: 'Git Flight Rules', url: 'https://github.com/k88hudson/git-flight-rules', type: 'official-documentation' }]
                    },
                    {
                        name: 'Docker Containerization',
                        description: 'Creating dockerfiles, managing volumes, multi-stage builds, and running network interfaces.',
                        phase: 'CORE',
                        order: 1,
                        seniorTips: 'Multi-stage builds are NOT optional in production. Keep container sizes under 150MB. Big containers waste deployment bandwidth.',
                        resources: [{ title: 'Official Docker Guide', url: 'https://docs.docker.com/', type: 'official-documentation' }]
                    },
                    {
                        name: 'Kubernetes Orchestration',
                        description: 'Deployments, Services, ConfigMaps, Secrets, Ingress controllers.',
                        phase: 'CORE',
                        order: 2,
                        seniorTips: 'In production, you do not build bare-metal Kubernetes. You use EKS or GKE. Focus on Helm, GitOps (ArgoCD), and learning how networking pods route requests.',
                        resources: [{ title: 'Kubernetes Academy', url: 'https://kubernetes.academy/', type: 'course' }]
                    },
                    {
                        name: 'Prometheus & Grafana Monitoring',
                        description: 'Collecting metrics, alerts, and building visualizations.',
                        phase: 'ADVANCED',
                        order: 1,
                        seniorTips: 'Do not track CPU usage only. Set alerts for key business SLIs like API error rates (HTTP 5xx) and latency percentiles (p99). Metrics without alerts are useless noise.',
                        resources: [{ title: 'Prometheus Tutorial', url: 'https://prometheus.io/docs/introduction/overview/', type: 'official-documentation' }]
                    }
                ]
            };
        }
    },
    /**
     * Generates a study plan.
     */
    async generateStudyPlan(userId, activeRoadmap, studyHours) {
        const skillsToPlan = activeRoadmap.skills || [];
        if (skillsToPlan.length === 0) {
            return {
                weeklyGoal: 'Complete setup of onboarding and database structures.',
                dailyTasks: {
                    'Monday': ['Select a target career path'],
                    'Tuesday': ['Complete Onboarding assessment form'],
                    'Wednesday': ['Explore the Fundamentals section'],
                    'Thursday': ['Read the senior tips for the first milestone'],
                    'Friday': ['Configure your Git profiles and start coding!']
                }
            };
        }
        const systemPrompt = `You are a technical mentor with 15+ years of experience.
Generate a structured study planner for a student based on their active roadmap skills and daily study hours.
Output as a valid JSON object:
{
  "weeklyGoal": "Overarching theme for the week",
  "dailyTasks": {
    "Monday": ["Task description with senior developer tips"],
    "Tuesday": ["Task description with senior developer tips"],
    "Wednesday": ["Task description with senior developer tips"],
    "Thursday": ["Task description with senior developer tips"],
    "Friday": ["Task description with senior developer tips"]
  }
}`;
        const prompt = `Available daily study hours: ${studyHours} hours/day
Skills to learn: ${JSON.stringify(skillsToPlan.slice(0, 3).map((s) => ({ name: s.name, description: s.description })))}

Please distribute these topics into a realistic 5-day week study plan. Emphasize senior engineer suggestions.`;
        try {
            const aiResponse = await callOpenAI(prompt, systemPrompt);
            return JSON.parse(aiResponse);
        }
        catch {
            // Local fallback: Distribute skills based on study hours
            const dailyTasks = {};
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const primarySkill = skillsToPlan[0]?.name || 'Core Fundamentals';
            const secondarySkill = skillsToPlan[1]?.name || 'Secondary tooling';
            dailyTasks['Monday'] = [`Dive into ${primarySkill}. Focus on understanding core syntax or operational structures. (Senior tips: Set up a sandbox environment first).`];
            dailyTasks['Tuesday'] = [`Deepen knowledge in ${primarySkill} by running standard exercises. (Senior tips: Write errors down to remember them).`];
            dailyTasks['Wednesday'] = [`Initiate learning of ${secondarySkill}. Write code/configuration configs. (Senior tips: Avoid copy-pasting from StackOverflow without reading).`];
            dailyTasks['Thursday'] = [`Integrate ${primarySkill} and ${secondarySkill} into a small local build. (Senior tips: Make it work, then make it clean).`];
            dailyTasks['Friday'] = [`Review the week's output. Write a documentation page on what you built. (Senior tips: If you cannot document it, you do not understand it).`];
            return {
                weeklyGoal: `Master the foundational aspects of ${primarySkill} and begin integration with ${secondarySkill}.`,
                dailyTasks
            };
        }
    },
    /**
     * Analyzes resumes by scanning content and returning missing items.
     */
    async analyzeResume(resumeText, careerName, requiredSkills, requiredProjects, requiredCerts) {
        const systemPrompt = `You are a critical technical recruiter and hiring manager who has reviewed thousands of engineering resumes.
Analyze the candidate's resume against the requirements for a ${careerName} role.
Calculate a Resume Score out of 100 based on standard guidelines (formatting, concrete projects, technical scope).
Output as a valid JSON object:
{
  "score": 75,
  "missingSkills": ["List of skills mentioned in roadmap but missing in resume text"],
  "missingProjects": ["Type of projects missing in resume"],
  "missingCertifications": ["Certifications recommended for career but missing in resume"],
  "improvementSuggestions": ["Constructive, blunt, experienced senior feedback. E.g. 'Remove empty skill sections', 'Quantify project performance metrics (e.g. reduced load times by 20%)', 'Add link to GitHub and live deployment'."]
}`;
        const prompt = `Candidate Resume Content:
${resumeText}

Required Skills: ${JSON.stringify(requiredSkills)}
Required Projects: ${JSON.stringify(requiredProjects)}
Required Certifications: ${JSON.stringify(requiredCerts)}`;
        try {
            const aiResponse = await callOpenAI(prompt, systemPrompt);
            return JSON.parse(aiResponse);
        }
        catch {
            // Local fallback: Keyword search scanner
            const resumeLower = resumeText.toLowerCase();
            const missingSkills = [];
            const missingProjects = [];
            const missingCertifications = [];
            const improvementSuggestions = [];
            // Scan skills
            requiredSkills.forEach(skill => {
                if (!resumeLower.includes(skill.toLowerCase())) {
                    missingSkills.push(skill);
                }
            });
            // Scan certs
            requiredCerts.forEach(cert => {
                if (!resumeLower.includes(cert.toLowerCase())) {
                    missingCertifications.push(cert);
                }
            });
            // Simple keyword heuristics for projects
            const projectKeywords = ['github', 'portfolio', 'deployed', 'production', 'aws', 'docker', 'kubernetes', 'ci/cd', 'rebuilt'];
            let projectKeywordCount = 0;
            projectKeywords.forEach(kw => {
                if (resumeLower.includes(kw))
                    projectKeywordCount++;
            });
            if (projectKeywordCount < 3) {
                missingProjects.push('Live deployed projects with actual URLs');
                improvementSuggestions.push('Add links to live hosted deployments of your projects (e.g., Vercel, Netlify, AWS). Static code is not enough.');
            }
            // Calculate a score
            let score = 90;
            score -= missingSkills.length * 4;
            score -= missingCertifications.length * 5;
            if (projectKeywordCount < 4)
                score -= 15;
            if (score < 20)
                score = 20;
            // Add general senior suggestions
            improvementSuggestions.push('Replace generic descriptions like "learned Docker" with metric-driven accomplishments like "Dockerized API server reducing container size by 40% using multi-stage builds".');
            improvementSuggestions.push('Remove generic objective statements. Keep the resume strictly about your technical skills, projects, and work outcomes.');
            if (missingSkills.length > 3) {
                improvementSuggestions.push(`Prioritize listing your command of core tools: ${missingSkills.slice(0, 3).join(', ')}.`);
            }
            return {
                score: Math.round(score),
                missingSkills: missingSkills.slice(0, 5),
                missingProjects,
                missingCertifications: missingCertifications.slice(0, 3),
                improvementSuggestions
            };
        }
    },
    /**
     * Custom chatbot response.
     */
    async generateChatResponse(message, userProfile, progress) {
        const activeCareer = userProfile?.assessment?.desiredCareer || 'Software Engineer';
        const experienceLevel = userProfile?.assessment?.experienceLevel || 'Beginner';
        const systemPrompt = `You are "Senior Architect Dave", a veteran tech lead with 15+ years of engineering experience.
You are mentoring a junior/intermediate engineer who is training to be a ${activeCareer}.
The student's current experience level is: ${experienceLevel}.
Their current completed progress is ${Math.round(progress?.completedPercentage || 0)}%.
Respond to their message with direct, practical, and highly pragmatic engineering guidance.
Include pitfalls to avoid, tips on how teams actually work in the industry, and realistic answers. Use bold text for key points.
Never sound like a robot; sound like a senior developer who grabbed a coffee with their junior.`;
        try {
            return await callOpenAI(message, systemPrompt);
        }
        catch {
            // Local Fallback based on keywords
            const msgLower = message.toLowerCase();
            if (msgLower.includes('kubernetes') || msgLower.includes('k8s')) {
                return `Ah, **Kubernetes**. Here is the senior reality: DO NOT try to build your own cluster on bare metal unless you're trying to prove a point or working for a telecom giant. In production, we use managed services like EKS or GKE. For your roadmap, focus on understanding **deployments**, **services**, **Ingress** controllers, and how configs interact via **ConfigMaps/Secrets**. Learn to write clean Helm charts. Avoid overcomplicating until your app actually needs scale.`;
            }
            if (msgLower.includes('docker') || msgLower.includes('container')) {
                return `**Docker** is the industry standard. The biggest mistake I see junior engineers make is writing bloated Dockerfiles. They dump development dependencies into the production container, resulting in a 1.2GB image. Learn **multi-stage builds**. Keep your production container lightweight (aim for Alpine or distroless images). Also, never run containers as \`root\` in production—it's a security vulnerability.`;
            }
            if (msgLower.includes('aws') || msgLower.includes('cloud') || msgLower.includes('certification')) {
                return `Are you ready for certifications? **Certifications get you interviews, but skills get you jobs**. AWS Cloud Practitioner is good to learn the acronyms, but hiring managers like me care about the **Solutions Architect Associate** (SAA). Don't just study to pass the multiple-choice exam; build projects with **Terraform** so you actually understand VPC configurations, IAM policies, and subnet routing. That's what I will grill you on in the technical interview.`;
            }
            if (msgLower.includes('project') || msgLower.includes('recommend')) {
                return `For a **${activeCareer}** target, stop building generic to-do apps. Build something that simulates production challenges:
1. A **CI/CD pipeline** that runs lint checks, unit tests, builds a Docker image, pushes to Docker Hub, and auto-deploys to a cloud instance.
2. An app with **Structured Logging** (using Winston or Pino) and metrics scraped by **Prometheus** displayed on a **Grafana** dashboard.
Show me you can manage log aggregation and container metrics. That is what a real engineering team does daily.`;
            }
            if (msgLower.includes('next') || msgLower.includes('what should i learn')) {
                return `Based on your progress of **${Math.round(progress?.completedPercentage || 0)}%**, you should look at the remaining items in your roadmap. If you've covered fundamentals, pivot to containerization and scripting. Don't rush to advanced monitoring until your base application is solid. What tool or concept are you currently stuck on? Let's break it down together.`;
            }
            return `Listen, as someone who has been building systems for 15+ years, my biggest advice is to **focus on the basics**. Do not chase every shiny new framework on Twitter. Master databases, HTTP protocols, version control (Git), and containerization. If you understand these, you can adapt to any tech stack in a weekend. What specific topic in your **${activeCareer}** roadmap are we tackling today?`;
        }
    }
};
exports.default = exports.aiService;
