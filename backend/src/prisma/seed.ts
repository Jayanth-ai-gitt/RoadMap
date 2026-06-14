import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding (SQLite)...');

  // 1. Clean old static records to avoid seed collision
  // Using deleteMany in reverse order of dependencies
  await prisma.userProgress.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.career.deleteMany({});

  console.log('🗑️  Cleaned existing Careers, Skills, Projects, and Certifications.');

  // ==========================================
  // DEVOPS ENGINEER PATH
  // ==========================================
  const devops = await prisma.career.create({
    data: {
      name: 'DevOps Engineer',
      description: 'Bridge the gap between development and operations. Focus on automating infrastructure provisioning, application deployment pipelines, and building reliable monitoring systems for scale.'
    }
  });

  // DevOps Skills
  const devopsSkills = [
    {
      name: 'Linux Shell & Scripting',
      description: 'Mastering directory structures, permissions (chmod/chown), bash scripting, piping, process control, and utilities (grep, awk, sed, curl).',
      phase: 'FUNDAMENTALS',
      order: 1,
      seniorTips: 'Skip memorizing 100 flags. Master piping, stderr redirection (2>&1), and writing idempotent scripts. If your shell script runs twice and fails the second time, you wrote a bad script. Also, never chmod 777 in production—that is an instant firing offense.',
      resources: JSON.stringify([
        { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'course' },
        { title: 'Learn Bash in Y minutes', url: 'https://learnxinyminutes.com/docs/bash/', type: 'tutorial' }
      ])
    },
    {
      name: 'Git and Branch Management',
      description: 'Understanding commits, merges, cherry-picks, rebasing, resolving conflicts, and standard commit message formats.',
      phase: 'FUNDAMENTALS',
      order: 2,
      seniorTips: 'In production, your git tree is a documentation timeline. Learn to interactive rebase (git rebase -i) to squash messy commits like "fix typo 1", "fix typo 2" before pushing. Avoid merge commits that clutter master logs.',
      resources: JSON.stringify([
        { title: 'Git Flight Rules', url: 'https://github.com/k88hudson/git-flight-rules', type: 'official-documentation' }
      ])
    },
    {
      name: 'Docker Containerization',
      description: 'Writing custom Dockerfiles, understanding layering cache, multi-stage builds, mounting volumes, and docker-compose orchestration.',
      phase: 'CORE',
      order: 1,
      seniorTips: 'If your production image contains a compiler, you did it wrong. Use multi-stage builds to compile in stage 1, and copy only the binary/runtime to stage 2. Keep your image size small. 1.5GB Node images are unacceptable—use Alpine or distroless.',
      resources: JSON.stringify([
        { title: 'Docker Official Docs', url: 'https://docs.docker.com/', type: 'official-documentation' }
      ])
    },
    {
      name: 'Kubernetes Orchestration',
      description: 'Deployments, Services, ConfigMaps, Secrets, Ingress, volumes, and understanding pod networking.',
      phase: 'CORE',
      order: 2,
      seniorTips: 'In the real world, you do not configure kubernetes on bare-metal virtual machines unless you work for AWS or GCP. Learn EKS, GKE, or AKS. Focus on Helm templates, understanding the ingress flow, and how health checks (liveness/readiness probes) work.',
      resources: JSON.stringify([
        { title: 'Kubernetes Interactive Tutorials', url: 'https://kubernetes.io/docs/tutorials/', type: 'tutorial' }
      ])
    },
    {
      name: 'Terraform (Infrastructure as Code)',
      description: 'Writing configurations, managing state files, using modules, variable management, and terraform cloud.',
      phase: 'CORE',
      order: 3,
      seniorTips: 'Never commit your state file (terraform.tfstate) to Git. Set up remote state storage (S3/GCS) with state locking via DynamoDB on day one. A corrupted state file is a disaster.',
      resources: JSON.stringify([
        { title: 'HashiCorp Learn Terraform', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'course' }
      ])
    },
    {
      name: 'CI/CD Pipelines (GitHub Actions / GitLab CI)',
      description: 'Automating testing, build compilation, docker pushing, and deployment hooks.',
      phase: 'CORE',
      order: 4,
      seniorTips: 'Keep your pipelines fast. If unit tests take 45 minutes to run, developers will skip them. Cache node_modules, parallelize jobs, and secure your secret tokens.',
      resources: JSON.stringify([
        { title: 'GitHub Actions Quickstart', url: 'https://docs.github.com/en/actions', type: 'official-documentation' }
      ])
    },
    {
      name: 'Monitoring & Observability (Prometheus & Grafana)',
      description: 'Metrics collection, scraping, writing PromQL queries, alerting rules, and grafana dashboards.',
      phase: 'ADVANCED',
      order: 1,
      seniorTips: 'Do not alert on CPU usage of 80%—that is a vanity metric. Alert on things that affect customers: HTTP 5xx error rates, response latency (p99), and queue build-up. An alert that triggers at 3:00 AM should only occur when human action is immediately necessary.',
      resources: JSON.stringify([
        { title: 'Prometheus Getting Started', url: 'https://prometheus.io/docs/introduction/first_steps/', type: 'official-documentation' }
      ])
    },
    {
      name: 'Log Aggregation & Security (ELK / Loki / IAM)',
      description: 'Structuring logs as JSON, centralizing logs, and configuring least-privilege cloud permissions.',
      phase: 'ADVANCED',
      order: 2,
      seniorTips: 'Never print raw text logs. Use JSON logs. It makes querying in Elasticsearch or Loki ten times faster. Also, enforce AWS IAM least privilege. Never use the admin API key in your code.',
      resources: JSON.stringify([
        { title: 'Grafana Loki Documentation', url: 'https://grafana.com/docs/loki/latest/', type: 'official-documentation' }
      ])
    }
  ];

  for (const s of devopsSkills) {
    await prisma.skill.create({ data: { careerId: devops.id, ...s } });
  }

  // DevOps Projects
  await prisma.project.createMany({
    data: [
      {
        careerId: devops.id,
        name: 'Static Website on AWS S3 with CloudFront CDN',
        description: 'Deploy a portfolio website to AWS S3, configure CloudFront for caching, setup Route53 DNS, and secure it with SSL certificates via ACM.',
        requirements: JSON.stringify([
          'Use S3 bucket for web hosting',
          'CloudFront CDN configuration with custom SSL certificate',
          'Route53 records mapping'
        ]),
        difficulty: 'BEGINNER',
        seniorTake: 'This teaches you core HTTP hosting and global content distribution. It is basic, but you have to understand subnets, caching headers, and SSL handshakes before you configure complex microservices.'
      },
      {
        careerId: devops.id,
        name: 'Automated Multi-Stage CI/CD Deployment Pipeline',
        description: 'Create a GitHub Actions pipeline that triggers on code pushes to build a Node.js Docker image, runs Jest unit tests, pushes to Docker Hub, and triggers a webhook deployment on a cloud VPS.',
        requirements: JSON.stringify([
          'Docker multi-stage optimization',
          'Caching node_modules in Github runner',
          'Secrets stored in Github Secrets'
        ]),
        difficulty: 'INTERMEDIATE',
        seniorTake: 'This is the bread and butter of DevOps. If a company does not automate this, they are failing. In interviews, I will ask you how you rollback bad deployments in this setup. Make sure you have a rollback path.'
      },
      {
        careerId: devops.id,
        name: 'GitOps Driven Kubernetes Cluster Setup via Terraform',
        description: 'Spin up an AWS EKS cluster using Terraform, configure Kubernetes resources (ingress, cert-manager, sealed secrets), and set up ArgoCD for automated continuous deployment (GitOps).',
        requirements: JSON.stringify([
          'Terraform remote state lock on S3/DynamoDB',
          'ArgoCD configured to sync with a public/private Git repository',
          'Ingress routing SSL certificates managed automatically'
        ]),
        difficulty: 'ADVANCED',
        seniorTake: 'This is a premium project that will set you apart from 95% of candidates. Show me this in an interview, and I will hire you. It shows you understand Terraform, cluster state, and GitOps synchronization.'
      }
    ]
  });

  // DevOps Certifications
  await prisma.certification.createMany({
    data: [
      {
        careerId: devops.id,
        name: 'AWS Solutions Architect Associate (SAA-C03)',
        difficulty: 'INTERMEDIATE',
        cost: 150,
        duration: '2-3 months',
        prerequisites: 'Basic knowledge of cloud concepts',
        url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
        seniorTake: 'This is the gold standard cloud cert. It teaches you how services like VPCs, EC2, RDS, and IAM plug together. Do not just memorise exam prep questions. Actually deploy a 3-tier app to AWS or I will spot the fake in five minutes during the interview.'
      },
      {
        careerId: devops.id,
        name: 'Certified Kubernetes Administrator (CKA)',
        difficulty: 'ADVANCED',
        cost: 395,
        duration: '1-2 months',
        prerequisites: 'Docker containerization and command line proficiency',
        url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
        seniorTake: 'The CKA is a practical hands-on exam, which makes it highly respected. If you pass this, I know you can actually debug a broken cluster node. Study tmux and kubectl commands before sitting for it.'
      }
    ]
  });

  // ==========================================
  // FULL STACK DEVELOPER PATH
  // ==========================================
  const fullstack = await prisma.career.create({
    data: {
      name: 'Full Stack Developer',
      description: 'Build end-to-end web applications. Master user interfaces using React/TypeScript, backend services using Node/Express, and schema validation with databases.'
    }
  });

  const fullstackSkills = [
    {
      name: 'HTML, CSS & Semantic Web',
      description: 'Understanding semantic HTML, layout systems (Flexbox & CSS Grid), media queries, and styling frameworks.',
      phase: 'FUNDAMENTALS',
      order: 1,
      seniorTips: 'Learn CSS Flexbox and Grid inside out. Avoid using tailwind templates without knowing standard CSS, or you will struggle to debug broken layout sizes on mobile devices.',
      resources: JSON.stringify([
        { title: 'MDN Web Docs: CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', type: 'official-documentation' }
      ])
    },
    {
      name: 'TypeScript & ES6+ Javascript',
      description: 'Understanding asynchronous code (Promises, async/await), DOM events, array utilities, types, interfaces, and generic functions.',
      phase: 'FUNDAMENTALS',
      order: 2,
      seniorTips: 'Do not use "any" in TypeScript. If you use "any", you are writing Javascript with extra steps and losing all compile-time safety. Learn to use union types and generics properly.',
      resources: JSON.stringify([
        { title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/', type: 'book' }
      ])
    },
    {
      name: 'React SPA (State & Context)',
      description: 'Component lifecycle, hooks (useState, useEffect, useMemo, useCallback), context API, and routing systems.',
      phase: 'CORE',
      order: 1,
      seniorTips: 'Avoid putting everything in global state. Keep state local to the component unless it is needed globally (like auth or theme context). Overusing useEffect triggers infinite render loops—learn to fetch data using library query hooks instead.',
      resources: JSON.stringify([
        { title: 'React Official Documentation', url: 'https://react.dev/', type: 'official-documentation' }
      ])
    },
    {
      name: 'Express.js & REST API Design',
      description: 'HTTP methods, routing, status codes, cors, JSON parsing, middleware functions, and error handling.',
      phase: 'CORE',
      order: 2,
      seniorTips: 'Use standard HTTP status codes. Return 201 for creation, 400 for bad parameters, and 401/403 for authentication issues. Returning 200 OK with message: "Error" in body is bad API design.',
      resources: JSON.stringify([
        { title: 'Express.js Guide', url: 'https://expressjs.com/', type: 'official-documentation' }
      ])
    },
    {
      name: 'Relational Databases (SQL & Prisma)',
      description: 'Designing schemas, database relationships (1-to-many, many-to-many), indexes, migration flows, and query optimization.',
      phase: 'CORE',
      order: 3,
      seniorTips: 'Always add indexes to columns that are frequently queried or used in WHERE clauses (like email, user_id). Also, configure foreign key cascading deletes so you do not leave orphaned rows in your tables.',
      resources: JSON.stringify([
        { title: 'Prisma Schema Reference', url: 'https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference', type: 'official-documentation' }
      ])
    },
    {
      name: 'JWT Authentication & Security',
      description: 'Password hashing with bcrypt, JWT signing, storage (Cookies vs LocalStorage), CORS whitelist, and session validation.',
      phase: 'CORE',
      order: 4,
      seniorTips: 'Never store plain-text passwords. Use bcrypt with salt rounds >= 10. Store JWTs in HttpOnly, SameSite cookies to protect your users from Cross-Site Scripting (XSS) attacks.',
      resources: JSON.stringify([
        { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'official-documentation' }
      ])
    },
    {
      name: 'Caching & Queues (Redis)',
      description: 'Query caching, session store, and background queue handling for heavy workflows.',
      phase: 'ADVANCED',
      order: 1,
      seniorTips: 'Do not cache dynamic resources indefinitely. Use Cache-Control headers and set TTLs (Time-To-Live) on Redis keys. Invalidating cache correctly is one of the hardest challenges in computer science.',
      resources: JSON.stringify([
        { title: 'Redis University', url: 'https://university.redis.com/', type: 'course' }
      ])
    }
  ];

  for (const s of fullstackSkills) {
    await prisma.skill.create({ data: { careerId: fullstack.id, ...s } });
  }

  // Full Stack Projects
  await prisma.project.createMany({
    data: [
      {
        careerId: fullstack.id,
        name: 'Responsive Personal Portfolio Site',
        description: 'Design and build a responsive portfolio site displaying your skills, projects, and a functional contact form using React and clean styling.',
        requirements: JSON.stringify([
          'Mobile responsive layout',
          'Contact form validation',
          'Deploy to Netlify or Vercel'
        ]),
        difficulty: 'BEGINNER',
        seniorTake: 'A portfolio is a representation of your standard. If it lacks clean design, aligns things poorly, or has spelling errors, I will reject the candidate before looking at the code. Make it load under 1 second.'
      },
      {
        careerId: fullstack.id,
        name: 'Secure Node & React Collaborative Task Board',
        description: 'Build a Kanban task management app (like Trello) featuring JWT authentication, drag-and-drop task boards, multi-user rooms, and relational PostgreSQL storage.',
        requirements: JSON.stringify([
          'Secure registration and login flows (hashed passwords)',
          'Drag-and-drop interface for task statuses',
          'API endpoints for project creation, boards, and updates'
        ]),
        difficulty: 'INTERMEDIATE',
        seniorTake: 'This tests state management, relations, and core API building. Make sure to implement proper server-side authorization: a user should not be able to edit or delete a task on a board they do not own.'
      },
      {
        careerId: fullstack.id,
        name: 'Real-time E-Commerce Store with Payment and Webhooks',
        description: 'Create a full-scale e-commerce store with product catalogs, shopping cart logic, Stripe checkout integration, database order tracking, and post-purchase email triggers via webhooks.',
        requirements: JSON.stringify([
          'Stripe Checkout API integration',
          'Server-side Webhook validation of payment events',
          'Optimistic UI state updates for immediate feedback'
        ]),
        difficulty: 'ADVANCED',
        seniorTake: 'This is a true production project. In interviews, I will ask you what happens if the user pays on Stripe, but your server crashes before saving the order. You must handle webhooks asynchronously and support idempotency.'
      }
    ]
  });

  // Full Stack Certifications
  await prisma.certification.createMany({
    data: [
      {
        careerId: fullstack.id,
        name: 'Meta Front-End Developer Professional Certificate',
        difficulty: 'BEGINNER',
        cost: 39,
        duration: '3-4 months',
        prerequisites: 'None',
        url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        seniorTake: 'Good for absolute beginners to structure their learning. It covers React and basic UX design concepts. But do not expect to land jobs just by presenting this certificate—we want to see your github projects.'
      }
    ]
  });

  // ==========================================
  // AI ENGINEER PATH
  // ==========================================
  const ai = await prisma.career.create({
    data: {
      name: 'AI Engineer',
      description: 'Integrate LLMs and build intelligent features. Master model prompting, fine-tuning scripts, vector embeddings, vector databases, and agentic workflows.'
    }
  });

  const aiSkills = [
    {
      name: 'Python Programming & Data Libraries',
      description: 'Writing scripts, utilizing numpy, pandas, pip packaging, virtual environments, and data cleaning.',
      phase: 'FUNDAMENTALS',
      order: 1,
      seniorTips: 'Learn object-oriented Python and virtual environments. Avoid mixing global packages on your machine. Learn to write clean pandas scripts without memory leaks.',
      resources: JSON.stringify([
        { title: 'Python Docs', url: 'https://docs.python.org/3/', type: 'official-documentation' }
      ])
    },
    {
      name: 'LLM APIs & Prompt Engineering',
      description: 'Interacting with OpenAI/Claude APIs, structured JSON outputs, system prompts, and context management.',
      phase: 'CORE',
      order: 1,
      seniorTips: 'In production, LLMs fail if prompts are vague. Use structured outputs (JSON schema) and write robust fallback catch blocks. Validate the output JSON schema before returning it to your frontend.',
      resources: JSON.stringify([
        { title: 'OpenAI Developer Guide', url: 'https://platform.openai.com/docs/guides/text-generation', type: 'official-documentation' }
      ])
    },
    {
      name: 'Vector Databases & RAG Systems',
      description: 'Understanding vector embeddings, chunking strategies, storing vectors in Pinecone/pgvector, and semantic search.',
      phase: 'CORE',
      order: 2,
      seniorTips: 'Retrieval Augmented Generation (RAG) is 90% parsing and 10% querying. If your document chunking is poor, the LLM will hallucinate. Master page splitting and semantic metadata filtering.',
      resources: JSON.stringify([
        { title: 'Pinecone Learning Center', url: 'https://www.pinecone.io/learn/', type: 'course' }
      ])
    },
    {
      name: 'Agentic Workflows & LangChain',
      description: 'Building multi-agent systems, memory persistence, tool-calling routing, and loops.',
      phase: 'ADVANCED',
      order: 1,
      seniorTips: 'Keep agents focused. Giving a single agent 50 tools will make it slow and unreliable. Create specialized sub-agents with narrow task scopes.',
      resources: JSON.stringify([
        { title: 'LangChain Documentation', url: 'https://python.langchain.com/docs/get_started/introduction', type: 'official-documentation' }
      ])
    }
  ];

  for (const s of aiSkills) {
    await prisma.skill.create({ data: { careerId: ai.id, ...s } });
  }

  // AI Projects
  await prisma.project.createMany({
    data: [
      {
        careerId: ai.id,
        name: 'CLI Document Search Tool',
        description: 'A Python command line tool that lets users index a folder of text documents, generates embeddings, and answers queries with text matches.',
        requirements: JSON.stringify([
          'Generate embeddings using OpenAI API',
          'Perform cosine similarity calculations',
          'Simple console-based client interface'
        ]),
        difficulty: 'BEGINNER',
        seniorTake: 'This is the foundation of modern search. Building cosine calculations yourself (instead of using libraries blindly) helps you understand coordinate mapping in vector space.'
      },
      {
        careerId: ai.id,
        name: 'Conversational PDF Knowledge Base (RAG)',
        description: 'Build a web application where users can drag-and-drop PDF guides, partition them, store embeddings in pgvector, and query them in a chat interface with sources.',
        requirements: JSON.stringify([
          'PDF parsing and chunking logic',
          'pgvector database matching in PostgreSQL',
          'Source citation highlighting in chat responses'
        ]),
        difficulty: 'INTERMEDIATE',
        seniorTake: 'A standard RAG implementation is a staple project. Optimize the chunks to verify you can query documents without context window blow-ups.'
      },
      {
        careerId: ai.id,
        name: 'Autonomous Multi-Agent Coding Assistant',
        description: 'Design a system with specialized agents (Planner, Coder, Reviewer) that collaborate to write, test, and save code files locally based on a prompt.',
        requirements: JSON.stringify([
          'Multi-agent state machine coordination',
          'Tool execution loop (run local compilation and capture errors)',
          'Auto-correction of compiler syntax mistakes'
        ]),
        difficulty: 'ADVANCED',
        seniorTake: 'This is the cutting-edge of AI. Showing you can coordinate multiple LLM agents and maintain strict state and context limits makes you a prime hire in the current market.'
      }
    ]
  });

  // AI Certifications
  await prisma.certification.createMany({
    data: [
      {
        careerId: ai.id,
        name: 'AWS Certified AI Practitioner',
        difficulty: 'BEGINNER',
        cost: 75,
        duration: '1 month',
        prerequisites: 'Basic cloud familiarity',
        url: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
        seniorTake: 'Good introduction to SageMaker, Bedrock, and general cloud machine learning service offerings.'
      }
    ]
  });

  // ==========================================
  // CYBERSECURITY ANALYST PATH
  // ==========================================
  const security = await prisma.career.create({
    data: {
      name: 'Cybersecurity Analyst',
      description: 'Secure enterprise environments. Monitor networks, detect vulnerabilities, configure firewalls, and respond to threats.'
    }
  });

  const securitySkills = [
    {
      name: 'Network Fundamentals',
      description: 'TCP/IP protocols, DNS, subnet configurations, port assignments, routing, and firewall settings.',
      phase: 'FUNDAMENTALS',
      order: 1,
      seniorTips: 'Understand TCP handshakes, DNS records, and port numbers. You cannot protect network packets if you do not know how they route.',
      resources: JSON.stringify([
        { title: 'Professor Messer Network+', url: 'https://www.professormesser.com/network-plus/n10-008/n10-008-video-index/', type: 'course' }
      ])
    },
    {
      name: 'Security Logs & SIEM',
      description: 'Analyzing event logs (Windows Event, Syslog), using Wireshark for packet capture, and configuring Splunk/Wazuh.',
      phase: 'CORE',
      order: 1,
      seniorTips: 'Learn to isolate indicators of compromise (IoC) in massive log files. Focus on correlation: matching high-volume failed login attempts with abnormal SSH activity.',
      resources: JSON.stringify([
        { title: 'Splunk Training Free Courses', url: 'https://www.splunk.com/en_us/training/free-courses/overview.html', type: 'course' }
      ])
    },
    {
      name: 'Penetration Testing (Kali Linux)',
      description: 'Exploiting software vulnerabilities, performing privilege escalation, SQL injection, and web app security testing.',
      phase: 'ADVANCED',
      order: 1,
      seniorTips: 'Red teaming is fun, but blue teaming (defense) is where the majority of jobs are. Understand the patches for the vulnerabilities you exploit.',
      resources: JSON.stringify([
        { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'course' }
      ])
    }
  ];

  for (const s of securitySkills) {
    await prisma.skill.create({ data: { careerId: security.id, ...s } });
  }

  // Security Projects
  await prisma.project.createMany({
    data: [
      {
        careerId: security.id,
        name: 'Home Lab Active Directory Setup',
        description: 'Set up an Active Directory domain controller on VirtualBox, populate it with mock users, and write group policies.',
        requirements: JSON.stringify([
          'Domain Controller creation',
          'Group Policy Object settings',
          'Windows Server log aggregation'
        ]),
        difficulty: 'BEGINNER',
        seniorTake: 'This is fundamental for corporate security. Understanding Active Directory and GPOs is crucial since most corporate hacks target Windows credentials.'
      },
      {
        careerId: security.id,
        name: 'Packet Capture & Intrusion Detection Lab',
        description: 'Configure Snort IDS, run mock attacks (nmap, hydra), analyze the logs, and build firewall block rules.',
        requirements: JSON.stringify([
          'Snort rule configurations',
          'Identifying SQL injections from traffic logs',
          'Automated IP block rules'
        ]),
        difficulty: 'INTERMEDIATE',
        seniorTake: 'This tests your technical network capability. I love asking candidates to walk me through how they identify packet tampering in Wireshark.'
      }
    ]
  });

  // Security Certifications
  await prisma.certification.createMany({
    data: [
      {
        careerId: security.id,
        name: 'CompTIA Security+',
        difficulty: 'BEGINNER',
        cost: 392,
        duration: '1-2 months',
        prerequisites: 'Basic IT skills recommended',
        url: 'https://www.comptia.org/certifications/security',
        seniorTake: 'The entry ticket for corporate security. Learn the terminology and core models. Very helpful for securing government or enterprise vendor roles.'
      }
    ]
  });

  console.log('✅ Seeding SQLite Completed Successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
