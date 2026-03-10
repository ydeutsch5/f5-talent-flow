// ============================================================
// Mock Data Layer — replaces all API calls for demo mode
// ============================================================
import { subDays, subHours, subMinutes, subWeeks } from "date-fns";

const now = new Date();
const d = (hoursAgo: number) => subHours(now, hoursAgo).toISOString();
const dd = (daysAgo: number) => subDays(now, daysAgo).toISOString();

// ── IDs ──────────────────────────────────────────────────────
let _id = 0;
const uid = () => `mock-${++_id}`;

// ── Candidate Statuses ───────────────────────────────────────
export const CANDIDATE_STATUSES = [
  { id: uid(), label: "New Lead", color: "#8b5cf6", position: 0 },
  { id: uid(), label: "Screening", color: "#3b82f6", position: 1 },
  { id: uid(), label: "Shortlisted", color: "#f59e0b", position: 2 },
  { id: uid(), label: "Interview", color: "#06b6d4", position: 3 },
  { id: uid(), label: "Offer Sent", color: "#10b981", position: 4 },
  { id: uid(), label: "Rejected", color: "#ef4444", position: 5 },
  { id: uid(), label: "On Hold", color: "#6b7280", position: 6 },
];

// ── Job Statuses ─────────────────────────────────────────────
export const JOB_STATUSES = [
  { id: uid(), label: "Active", color: "#16a34a", position: 0 },
  { id: uid(), label: "On Hold", color: "#f59e0b", position: 1 },
  { id: uid(), label: "Draft", color: "#6b7280", position: 2 },
  { id: uid(), label: "Filled", color: "#3b82f6", position: 3 },
];

// ── Tags ─────────────────────────────────────────────────────
export const TAGS = [
  { id: uid(), name: "React", color: "#3b82f6", _count: { candidates: 5 } },
  { id: uid(), name: "Node.js", color: "#22c55e", _count: { candidates: 4 } },
  { id: uid(), name: "Python", color: "#eab308", _count: { candidates: 3 } },
  { id: uid(), name: "US Shift OK", color: "#8b5cf6", _count: { candidates: 4 } },
  { id: uid(), name: "Strong Comm", color: "#06b6d4", _count: { candidates: 3 } },
  { id: uid(), name: "Top Talent", color: "#f59e0b", _count: { candidates: 3 } },
  { id: uid(), name: "Quick Hire", color: "#ef4444", _count: { candidates: 1 } },
  { id: uid(), name: "Senior", color: "#374151", _count: { candidates: 3 } },
];

function findTag(name: string) { return TAGS.find(t => t.name === name)!; }

// ── Jobs ─────────────────────────────────────────────────────
const JOB_IDS = Array.from({ length: 8 }, () => uid());
export const JOBS = [
  { id: JOB_IDS[0], roleTitle: "Senior React Developer", clientName: "TechCorp USA", clientWebsite: "https://techcorp.com", status: "Active", weeklyBudget: "$4,200/mo", workingHours: "US_HOURS" as const, industry: "Fintech", createdAt: dd(14), updatedAt: dd(1), _count: { matches: 3 }, mustHaveRequirements: "5+ years React experience. TypeScript proficiency. Experience with REST APIs and Git. Strong component architecture knowledge. Able to work US hours (EST/PST).", niceToHave: "Experience with Next.js or GraphQL. AWS knowledge. Storybook familiarity. Testing experience with Jest and React Testing Library.", responsibilities: "Own the frontend architecture for our payments dashboard. Work closely with US-based PMs to ship new features. Conduct code reviews. Mentor junior developers. Participate in daily standups (US morning time)." },
  { id: JOB_IDS[1], roleTitle: "Node.js Backend Engineer", clientName: "DataFlow Inc", clientWebsite: "https://dataflow.io", status: "Active", weeklyBudget: "$3,800/mo", workingHours: "US_HOURS" as const, industry: "Data", createdAt: dd(12), updatedAt: dd(2), _count: { matches: 3 }, mustHaveRequirements: "4+ years Node.js experience. Strong SQL and PostgreSQL skills. Experience building RESTful APIs. Understanding of microservices architecture. Comfortable with Docker and CI/CD.", niceToHave: "Experience with message queues (RabbitMQ, Kafka). Redis caching. GraphQL. Terraform or IaC tools.", responsibilities: "Design and build scalable backend services for data pipeline orchestration. Optimize database performance. Write comprehensive API documentation. Collaborate with data science team on ETL workflows." },
  { id: JOB_IDS[2], roleTitle: "Full Stack Developer", clientName: "BuildRight LLC", clientWebsite: "https://buildright.com", status: "Active", weeklyBudget: "$4,000/mo", workingHours: "INDIA_SHIFT" as const, industry: "Construction Tech", createdAt: dd(10), updatedAt: dd(1), _count: { matches: 2 }, mustHaveRequirements: "3+ years full stack experience. React and Node.js proficiency. PostgreSQL or MySQL experience. Git workflow knowledge. Ability to work independently.", niceToHave: "Mobile development experience (React Native). AWS or GCP. Experience in construction or real estate tech.", responsibilities: "Build and maintain the project management web application. Implement new features across frontend and backend. Handle database migrations. Participate in sprint planning and retrospectives." },
  { id: JOB_IDS[3], roleTitle: "DevOps Engineer", clientName: "CloudNine Systems", clientWebsite: "https://cloudnine.io", status: "On Hold", weeklyBudget: "$4,500/mo", workingHours: "GENERAL_SHIFT" as const, industry: "Cloud", createdAt: dd(20), updatedAt: dd(5), _count: { matches: 1 }, mustHaveRequirements: "5+ years DevOps/SRE experience. Expert AWS knowledge (EC2, ECS, Lambda, RDS). Terraform proficiency. Kubernetes experience. Strong Linux administration skills.", niceToHave: "Certified AWS Solutions Architect. Experience with observability tools (Datadog, Grafana). Python scripting. Cost optimization experience.", responsibilities: "Manage and optimize cloud infrastructure on AWS. Build CI/CD pipelines. Implement monitoring and alerting. Conduct security audits. Support developer productivity with tooling improvements." },
  { id: JOB_IDS[4], roleTitle: "Python Data Engineer", clientName: "AnalyticsHub", clientWebsite: "https://analyticshub.com", status: "Active", weeklyBudget: "$3,600/mo", workingHours: "US_HOURS" as const, industry: "Analytics", createdAt: dd(8), updatedAt: dd(1), _count: { matches: 2 }, mustHaveRequirements: "4+ years Python experience. Strong SQL skills. Experience with data pipelines (Airflow, Luigi). Familiarity with cloud data warehouses (Snowflake, BigQuery, Redshift).", niceToHave: "Spark/PySpark experience. dbt knowledge. Machine learning basics. Experience with data visualization tools.", responsibilities: "Design and build ETL pipelines for analytics platform. Maintain data warehouse schema. Ensure data quality and consistency. Work with analytics team to define metrics and KPIs." },
  { id: JOB_IDS[5], roleTitle: "React Native Developer", clientName: "MobileFirst Co", clientWebsite: "https://mobilefirst.co", status: "Draft", weeklyBudget: "$3,900/mo", workingHours: "GENERAL_SHIFT" as const, industry: "Mobile", createdAt: dd(6), updatedAt: dd(3), _count: { matches: 0 }, mustHaveRequirements: "3+ years React Native experience. Published apps on App Store and Google Play. TypeScript proficiency. Experience with native modules and bridging.", niceToHave: "Swift/Kotlin knowledge. Experience with app performance optimization. Familiarity with Expo. Animation experience (Reanimated).", responsibilities: "Build and maintain cross-platform mobile applications. Implement pixel-perfect UI from Figma designs. Integrate with backend APIs. Handle app store submissions and updates." },
  { id: JOB_IDS[6], roleTitle: "QA Automation Engineer", clientName: "QualityTech", clientWebsite: "https://qualitytech.com", status: "Filled", weeklyBudget: "$3,200/mo", workingHours: "INDIA_SHIFT" as const, industry: "QA", createdAt: dd(30), updatedAt: dd(7), _count: { matches: 1 }, mustHaveRequirements: "3+ years QA automation experience. Selenium or Playwright proficiency. API testing (Postman, REST Assured). CI/CD integration experience. Strong analytical skills.", niceToHave: "Performance testing (JMeter, k6). Mobile testing experience. Security testing basics. BDD frameworks (Cucumber).", responsibilities: "Design and maintain automated test suites. Write test plans and test cases. Integrate tests into CI/CD pipeline. Report and track defects. Collaborate with developers on quality improvements." },
  { id: JOB_IDS[7], roleTitle: "Product Manager (Technical)", clientName: "Innovate Corp", clientWebsite: "https://innovatecorp.com", status: "Active", weeklyBudget: "$5,000/mo", workingHours: "US_HOURS" as const, industry: "SaaS", createdAt: dd(6), updatedAt: dd(0), _count: { matches: 1 }, mustHaveRequirements: "5+ years product management experience. Technical background (CS degree or engineering experience). Experience with B2B SaaS products. Strong data-driven decision making. Excellent communication skills.", niceToHave: "Experience with AI/ML products. Prior startup experience. SQL proficiency. Familiarity with design tools (Figma).", responsibilities: "Define product roadmap and prioritize features. Write detailed PRDs and user stories. Work closely with engineering and design teams. Conduct user research and competitor analysis. Present to stakeholders and leadership." },
];

// ── Candidates ───────────────────────────────────────────────
const CAND_IDS = Array.from({ length: 12 }, () => uid());
export const CANDIDATES = [
  { id: CAND_IDS[0], name: "Rahul Sharma", email: "rahul.sharma@gmail.com", phone: "+91 98765 43210", title: "Senior React Dev", source: "LinkedIn", shiftAvailability: "US_SHIFT" as const, communicationRating: "EXCELLENT" as const, status: "Shortlisted", tags: [findTag("React"), findTag("US Shift OK"), findTag("Top Talent")], transcription: "Transcript from screening call 12 Nov: [5 min call, discussed React 18 experience, concurrent features, TypeScript generics. Very articulate. Clear US shift availability confirmed. No hesitation on salary range. Strong recommendation.]", portfolioUrl: "https://rahulsharma.dev", createdAt: dd(5), updatedAt: dd(1), _count: { matches: 1 } },
  { id: CAND_IDS[1], name: "Priya Kapoor", email: "priya.kapoor@outlook.com", phone: "+91 87654 32109", title: "Full Stack Dev", source: "Referral", shiftAvailability: "BOTH" as const, communicationRating: "GOOD" as const, status: "Interview", tags: [findTag("React"), findTag("Node.js"), findTag("Strong Comm")], transcription: null, portfolioUrl: null, createdAt: dd(7), updatedAt: dd(2), _count: { matches: 2 } },
  { id: CAND_IDS[2], name: "Arjun Mehta", email: "arjun.mehta@gmail.com", phone: "+91 76543 21098", title: "Backend Engineer", source: "Naukri", shiftAvailability: "REGULAR" as const, communicationRating: "GOOD" as const, status: "Screening", tags: [findTag("Node.js"), findTag("Python")], transcription: null, portfolioUrl: null, createdAt: dd(4), updatedAt: dd(2), _count: { matches: 1 } },
  { id: CAND_IDS[3], name: "Sneha Patel", email: "sneha.patel@gmail.com", phone: "+91 65432 10987", title: "DevOps Engineer", source: "LinkedIn", shiftAvailability: "US_SHIFT" as const, communicationRating: "EXCELLENT" as const, status: "Shortlisted", tags: [findTag("Senior"), findTag("US Shift OK")], transcription: null, portfolioUrl: null, createdAt: dd(6), updatedAt: dd(1), _count: { matches: 1 } },
  { id: CAND_IDS[4], name: "Vikram Singh", email: "vikram.singh@yahoo.com", phone: "+91 54321 09876", title: "React Developer", source: "Indeed", shiftAvailability: "REGULAR" as const, communicationRating: "AVERAGE" as const, status: "New Lead", tags: [findTag("React")], transcription: null, portfolioUrl: null, createdAt: dd(3), updatedAt: dd(3), _count: { matches: 1 } },
  { id: CAND_IDS[5], name: "Ananya Reddy", email: "ananya.reddy@gmail.com", phone: "+91 43210 98765", title: "Python Engineer", source: "LinkedIn", shiftAvailability: "BOTH" as const, communicationRating: "EXCELLENT" as const, status: "Offer Sent", tags: [findTag("Python"), findTag("Top Talent"), findTag("Strong Comm")], transcription: null, portfolioUrl: null, createdAt: dd(9), updatedAt: d(3), _count: { matches: 1 } },
  { id: CAND_IDS[6], name: "Kiran Kumar", email: "kiran.kumar@gmail.com", phone: "+91 32109 87654", title: "Full Stack Dev", source: "Referral", shiftAvailability: "US_SHIFT" as const, communicationRating: "GOOD" as const, status: "Interview", tags: [findTag("React"), findTag("Node.js"), findTag("US Shift OK")], transcription: null, portfolioUrl: null, createdAt: dd(8), updatedAt: d(5), _count: { matches: 2 } },
  { id: CAND_IDS[7], name: "Meera Nair", email: "meera.nair@outlook.com", phone: "+91 21098 76543", title: "QA Automation", source: "Naukri", shiftAvailability: "REGULAR" as const, communicationRating: "AVERAGE" as const, status: "Screening", tags: [findTag("Senior")], transcription: null, portfolioUrl: null, createdAt: dd(10), updatedAt: dd(2), _count: { matches: 1 } },
  { id: CAND_IDS[8], name: "Rohit Verma", email: "rohit.verma@gmail.com", phone: "+91 10987 65432", title: "React Native Dev", source: "Indeed", shiftAvailability: "REGULAR" as const, communicationRating: "POOR" as const, status: "Rejected", tags: [findTag("React")], transcription: null, portfolioUrl: null, createdAt: dd(12), updatedAt: dd(5), _count: { matches: 1 } },
  { id: CAND_IDS[9], name: "Deepa Iyer", email: "deepa.iyer@gmail.com", phone: "+91 09876 54321", title: "Data Engineer", source: "LinkedIn", shiftAvailability: "US_SHIFT" as const, communicationRating: "EXCELLENT" as const, status: "Shortlisted", tags: [findTag("Python"), findTag("US Shift OK"), findTag("Quick Hire")], transcription: null, portfolioUrl: null, createdAt: dd(2), updatedAt: dd(1), _count: { matches: 1 } },
  { id: CAND_IDS[10], name: "Suresh Babu", email: "suresh.babu@gmail.com", phone: "+91 98765 11111", title: "Node.js Engineer", source: "Naukri", shiftAvailability: "REGULAR" as const, communicationRating: "GOOD" as const, status: "New Lead", tags: [findTag("Node.js")], transcription: null, portfolioUrl: null, createdAt: dd(1), updatedAt: dd(1), _count: { matches: 1 } },
  { id: CAND_IDS[11], name: "Lakshmi Rao", email: "lakshmi.rao@gmail.com", phone: "+91 87654 22222", title: "PM Technical", source: "LinkedIn", shiftAvailability: "BOTH" as const, communicationRating: "EXCELLENT" as const, status: "Interview", tags: [findTag("Strong Comm"), findTag("Senior"), findTag("Top Talent")], transcription: null, portfolioUrl: null, createdAt: dd(3), updatedAt: d(0), _count: { matches: 1 } },
];

// ── Matches ──────────────────────────────────────────────────
export const MATCHES = [
  { id: uid(), jobId: JOB_IDS[0], candidateId: CAND_IDS[0], status: "Shortlisted", matchPercentage: 92, matchBand: "Strong", createdAt: dd(3), updatedAt: dd(1), candidate: { id: CAND_IDS[0], name: "Rahul Sharma", title: "Senior React Dev", email: "rahul.sharma@gmail.com", communicationRating: "EXCELLENT", shiftAvailability: "US_SHIFT" } },
  { id: uid(), jobId: JOB_IDS[2], candidateId: CAND_IDS[1], status: "Interview", matchPercentage: 88, matchBand: "Strong", createdAt: dd(4), updatedAt: dd(2), candidate: { id: CAND_IDS[1], name: "Priya Kapoor", title: "Full Stack Dev", email: "priya.kapoor@outlook.com", communicationRating: "GOOD", shiftAvailability: "BOTH" } },
  { id: uid(), jobId: JOB_IDS[0], candidateId: CAND_IDS[1], status: "New Lead", matchPercentage: 79, matchBand: "Strong", createdAt: dd(4), updatedAt: dd(4), candidate: { id: CAND_IDS[1], name: "Priya Kapoor", title: "Full Stack Dev", email: "priya.kapoor@outlook.com", communicationRating: "GOOD", shiftAvailability: "BOTH" } },
  { id: uid(), jobId: JOB_IDS[1], candidateId: CAND_IDS[2], status: "Screening", matchPercentage: 74, matchBand: "Good", createdAt: dd(3), updatedAt: dd(2), candidate: { id: CAND_IDS[2], name: "Arjun Mehta", title: "Backend Engineer", email: "arjun.mehta@gmail.com", communicationRating: "GOOD", shiftAvailability: "REGULAR" } },
  { id: uid(), jobId: JOB_IDS[3], candidateId: CAND_IDS[3], status: "Shortlisted", matchPercentage: 85, matchBand: "Strong", createdAt: dd(5), updatedAt: dd(1), candidate: { id: CAND_IDS[3], name: "Sneha Patel", title: "DevOps Engineer", email: "sneha.patel@gmail.com", communicationRating: "EXCELLENT", shiftAvailability: "US_SHIFT" } },
  { id: uid(), jobId: JOB_IDS[0], candidateId: CAND_IDS[4], status: "New Lead", matchPercentage: 51, matchBand: "Good", createdAt: dd(2), updatedAt: dd(2), candidate: { id: CAND_IDS[4], name: "Vikram Singh", title: "React Developer", email: "vikram.singh@yahoo.com", communicationRating: "AVERAGE", shiftAvailability: "REGULAR" } },
  { id: uid(), jobId: JOB_IDS[4], candidateId: CAND_IDS[5], status: "Offer Sent", matchPercentage: 91, matchBand: "Strong", createdAt: dd(4), updatedAt: d(3), candidate: { id: CAND_IDS[5], name: "Ananya Reddy", title: "Python Engineer", email: "ananya.reddy@gmail.com", communicationRating: "EXCELLENT", shiftAvailability: "BOTH" } },
  { id: uid(), jobId: JOB_IDS[2], candidateId: CAND_IDS[6], status: "Interview", matchPercentage: 83, matchBand: "Strong", createdAt: dd(3), updatedAt: d(5), candidate: { id: CAND_IDS[6], name: "Kiran Kumar", title: "Full Stack Dev", email: "kiran.kumar@gmail.com", communicationRating: "GOOD", shiftAvailability: "US_SHIFT" } },
  { id: uid(), jobId: JOB_IDS[1], candidateId: CAND_IDS[6], status: "New Lead", matchPercentage: 77, matchBand: "Strong", createdAt: dd(3), updatedAt: dd(3), candidate: { id: CAND_IDS[6], name: "Kiran Kumar", title: "Full Stack Dev", email: "kiran.kumar@gmail.com", communicationRating: "GOOD", shiftAvailability: "US_SHIFT" } },
  { id: uid(), jobId: JOB_IDS[6], candidateId: CAND_IDS[7], status: "Screening", matchPercentage: 68, matchBand: "Good", createdAt: dd(5), updatedAt: dd(2), candidate: { id: CAND_IDS[7], name: "Meera Nair", title: "QA Automation", email: "meera.nair@outlook.com", communicationRating: "AVERAGE", shiftAvailability: "REGULAR" } },
  { id: uid(), jobId: JOB_IDS[5], candidateId: CAND_IDS[8], status: "Rejected", matchPercentage: 44, matchBand: "Possible", createdAt: dd(6), updatedAt: dd(5), candidate: { id: CAND_IDS[8], name: "Rohit Verma", title: "React Native Dev", email: "rohit.verma@gmail.com", communicationRating: "POOR", shiftAvailability: "REGULAR" } },
  { id: uid(), jobId: JOB_IDS[4], candidateId: CAND_IDS[9], status: "Shortlisted", matchPercentage: 89, matchBand: "Strong", createdAt: dd(2), updatedAt: dd(1), candidate: { id: CAND_IDS[9], name: "Deepa Iyer", title: "Data Engineer", email: "deepa.iyer@gmail.com", communicationRating: "EXCELLENT", shiftAvailability: "US_SHIFT" } },
  { id: uid(), jobId: JOB_IDS[1], candidateId: CAND_IDS[10], status: "New Lead", matchPercentage: 72, matchBand: "Good", createdAt: dd(1), updatedAt: dd(1), candidate: { id: CAND_IDS[10], name: "Suresh Babu", title: "Node.js Engineer", email: "suresh.babu@gmail.com", communicationRating: "GOOD", shiftAvailability: "REGULAR" } },
  { id: uid(), jobId: JOB_IDS[7], candidateId: CAND_IDS[11], status: "Interview", matchPercentage: 94, matchBand: "Strong", createdAt: dd(2), updatedAt: d(0), candidate: { id: CAND_IDS[11], name: "Lakshmi Rao", title: "PM Technical", email: "lakshmi.rao@gmail.com", communicationRating: "EXCELLENT", shiftAvailability: "BOTH" } },
];

// ── Team / Users ─────────────────────────────────────────────
const USER_IDS = Array.from({ length: 5 }, () => uid());
export const USERS = [
  { id: USER_IDS[0], name: "Joel Davis", email: "joel@f5recruiting.com", role: "admin" as const, createdAt: dd(90), lastLoginAt: d(0) },
  { id: USER_IDS[1], name: "Sarah Kim", email: "sarah@f5recruiting.com", role: "manager" as const, createdAt: dd(80), lastLoginAt: d(2) },
  { id: USER_IDS[2], name: "Maria Chen", email: "maria@f5recruiting.com", role: "recruiter" as const, createdAt: dd(60), lastLoginAt: dd(1) },
  { id: USER_IDS[3], name: "Raj Patel", email: "raj@f5recruiting.com", role: "recruiter" as const, createdAt: dd(45), lastLoginAt: dd(3) },
  { id: USER_IDS[4], name: "Preet Kaur", email: "preet@f5recruiting.com", role: "recruiter" as const, createdAt: dd(30), lastLoginAt: dd(7) },
];

// ── Submissions ──────────────────────────────────────────────
export const SUBMISSIONS = [
  { id: uid(), status: "Approved" as const, createdAt: dd(3), updatedAt: dd(3), notes: "Client loved his portfolio. Moving to final round.", candidate: { id: CAND_IDS[0], name: "Rahul Sharma", title: "Senior React Dev", email: "rahul.sharma@gmail.com", phone: "+91 98765 43210", communicationRating: "EXCELLENT" }, job: { id: JOB_IDS[0], roleTitle: "Senior React Developer", clientName: "TechCorp USA", weeklyBudget: "$4,200/mo", workingHours: "US_HOURS" }, submittedBy: { id: USER_IDS[0], name: "Joel Davis", email: "joel@f5recruiting.com" } },
  { id: uid(), status: "Pending" as const, createdAt: dd(1), updatedAt: dd(1), notes: "Strong match. Awaiting client review.", candidate: { id: CAND_IDS[5], name: "Ananya Reddy", title: "Python Engineer", email: "ananya.reddy@gmail.com", phone: "+91 43210 98765", communicationRating: "EXCELLENT" }, job: { id: JOB_IDS[4], roleTitle: "Python Data Engineer", clientName: "AnalyticsHub", weeklyBudget: "$3,600/mo", workingHours: "US_HOURS" }, submittedBy: { id: USER_IDS[1], name: "Sarah Kim", email: "sarah@f5recruiting.com" } },
  { id: uid(), status: "Pending" as const, createdAt: d(5), updatedAt: d(5), notes: "Excellent communicator. Client should see this one.", candidate: { id: CAND_IDS[6], name: "Kiran Kumar", title: "Full Stack Dev", email: "kiran.kumar@gmail.com", phone: "+91 32109 87654", communicationRating: "GOOD" }, job: { id: JOB_IDS[2], roleTitle: "Full Stack Developer", clientName: "BuildRight LLC", weeklyBudget: "$4,000/mo", workingHours: "INDIA_SHIFT" }, submittedBy: { id: USER_IDS[0], name: "Joel Davis", email: "joel@f5recruiting.com" } },
  { id: uid(), status: "Rejected" as const, createdAt: dd(7), updatedAt: dd(7), notes: "Client preferred someone with more AWS experience.", candidate: { id: CAND_IDS[1], name: "Priya Kapoor", title: "Full Stack Dev", email: "priya.kapoor@outlook.com", phone: "+91 87654 32109", communicationRating: "GOOD" }, job: { id: JOB_IDS[2], roleTitle: "Full Stack Developer", clientName: "BuildRight LLC", weeklyBudget: "$4,000/mo", workingHours: "INDIA_SHIFT" }, submittedBy: { id: USER_IDS[2], name: "Maria Chen", email: "maria@f5recruiting.com" } },
  { id: uid(), status: "Approved" as const, createdAt: dd(2), updatedAt: dd(2), notes: "Perfect fit. Client fast-tracking interview.", candidate: { id: CAND_IDS[11], name: "Lakshmi Rao", title: "PM Technical", email: "lakshmi.rao@gmail.com", phone: "+91 87654 22222", communicationRating: "EXCELLENT" }, job: { id: JOB_IDS[7], roleTitle: "Product Manager (Technical)", clientName: "Innovate Corp", weeklyBudget: "$5,000/mo", workingHours: "US_HOURS" }, submittedBy: { id: USER_IDS[1], name: "Sarah Kim", email: "sarah@f5recruiting.com" } },
  { id: uid(), status: "Pending" as const, createdAt: d(12), updatedAt: d(12), notes: "Strong DevOps background. Matches all must-haves.", candidate: { id: CAND_IDS[3], name: "Sneha Patel", title: "DevOps Engineer", email: "sneha.patel@gmail.com", phone: "+91 65432 10987", communicationRating: "EXCELLENT" }, job: { id: JOB_IDS[3], roleTitle: "DevOps Engineer", clientName: "CloudNine Systems", weeklyBudget: "$4,500/mo", workingHours: "GENERAL_SHIFT" }, submittedBy: { id: USER_IDS[0], name: "Joel Davis", email: "joel@f5recruiting.com" } },
];

// ── Activity Feed ────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: uid(), type: "evaluation" as const, description: "Joel evaluated resume — Rahul Sharma for Senior React Dev", createdAt: d(2), linkType: "candidate" as const, linkId: CAND_IDS[0] },
  { id: uid(), type: "status_change" as const, description: "Sarah changed Ananya Reddy to Offer Sent", createdAt: d(3), linkType: "candidate" as const, linkId: CAND_IDS[5] },
  { id: uid(), type: "submission_approved" as const, description: "Joel submitted Kiran Kumar to BuildRight LLC", createdAt: d(5), linkType: "submission" as const, linkId: undefined },
  { id: uid(), type: "comment" as const, description: 'Maria added comment on Vikram Singh — "Need to retest comm"', createdAt: d(6), linkType: "candidate" as const, linkId: CAND_IDS[4] },
  { id: uid(), type: "evaluation" as const, description: "Raj evaluated resume — Suresh Babu for Node.js role", createdAt: d(8), linkType: "candidate" as const, linkId: CAND_IDS[10] },
  { id: uid(), type: "status_change" as const, description: "Joel changed Sneha Patel to Shortlisted", createdAt: dd(1), linkType: "candidate" as const, linkId: CAND_IDS[3] },
  { id: uid(), type: "submission_approved" as const, description: "Sarah submitted Sneha Patel to CloudNine Systems", createdAt: dd(1), linkType: "submission" as const, linkId: undefined },
  { id: uid(), type: "candidate_added" as const, description: 'Preet added tag "Quick Hire" to Deepa Iyer', createdAt: dd(1), linkType: "candidate" as const, linkId: CAND_IDS[9] },
  { id: uid(), type: "evaluation" as const, description: "Maria evaluated resume — Meera Nair for QA role", createdAt: dd(2), linkType: "candidate" as const, linkId: CAND_IDS[7] },
  { id: uid(), type: "submission_approved" as const, description: "Joel approved submission — Rahul Sharma (TechCorp)", createdAt: dd(3), linkType: "submission" as const, linkId: undefined },
  { id: uid(), type: "submission_approved" as const, description: "Sarah submitted Lakshmi Rao to Innovate Corp", createdAt: dd(3), linkType: "submission" as const, linkId: undefined },
  { id: uid(), type: "evaluation" as const, description: "Joel evaluated resume — Priya Kapoor for BuildRight", createdAt: dd(4), linkType: "candidate" as const, linkId: CAND_IDS[1] },
  { id: uid(), type: "submission_rejected" as const, description: "Maria changed Rohit Verma to Rejected", createdAt: dd(5), linkType: "candidate" as const, linkId: CAND_IDS[8] },
  { id: uid(), type: "candidate_added" as const, description: "Joel created job — Product Manager at Innovate Corp", createdAt: dd(6), linkType: "job" as const, linkId: JOB_IDS[7] },
  { id: uid(), type: "comment" as const, description: 'Sarah added comment on Deepa Iyer — "Best Python we\'ve seen"', createdAt: dd(7), linkType: "candidate" as const, linkId: CAND_IDS[9] },
];

// ── Job Activity ─────────────────────────────────────────────
export const JOB_ACTIVITY: Record<string, Array<{ id: string; type: string; content: string; createdAt: string; user?: { name: string } }>> = {
  [JOB_IDS[0]]: [
    { id: uid(), type: "evaluation", content: "Evaluated Rahul Sharma — 92% match, Strong band", createdAt: d(2), user: { name: "Joel Davis" } },
    { id: uid(), type: "evaluation", content: "Evaluated Priya Kapoor — 79% match, Strong band", createdAt: dd(4), user: { name: "Joel Davis" } },
    { id: uid(), type: "evaluation", content: "Evaluated Vikram Singh — 51% match, Good band", createdAt: dd(2), user: { name: "Raj Patel" } },
    { id: uid(), type: "comment", content: "TechCorp wants to fast-track the top 2 candidates", createdAt: dd(1), user: { name: "Sarah Kim" } },
    { id: uid(), type: "submission", content: "Submitted Rahul Sharma to TechCorp", createdAt: dd(3), user: { name: "Joel Davis" } },
  ],
};

// ── Candidate Activity ───────────────────────────────────────
export const CANDIDATE_ACTIVITY: Record<string, Array<{ id: string; type: string; content: string; createdAt: string; user?: { name: string } }>> = {
  [CAND_IDS[0]]: [
    { id: uid(), type: "resume_evaluated", content: "Resume evaluated for Senior React Developer (TechCorp) — 92% match", createdAt: d(2), user: { name: "Joel Davis" } },
    { id: uid(), type: "status_change", content: "Status changed from Screening to Shortlisted", createdAt: dd(2), user: { name: "Joel Davis" } },
    { id: uid(), type: "submission", content: "Submitted to TechCorp USA for Senior React Developer", createdAt: dd(3), user: { name: "Joel Davis" } },
    { id: uid(), type: "tag_added", content: 'Tag "Top Talent" added', createdAt: dd(4), user: { name: "Sarah Kim" } },
    { id: uid(), type: "comment", content: "Great communication in screening call. Strong React 18 knowledge.", createdAt: dd(5), user: { name: "Joel Davis" } },
  ],
};

// ── Job Intelligence ─────────────────────────────────────────
export const JOB_INTELLIGENCE: Record<string, any> = {
  [JOB_IDS[0]]: {
    mustHaveSkills: ["React 18", "TypeScript", "REST APIs", "Git", "Component Architecture"],
    niceToHaveSkills: ["Next.js", "GraphQL", "AWS", "Storybook", "Testing (Jest/RTL)"],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Figma"],
    seniorityLevel: "Senior (5-8 years)",
    searchKeywords: ["Senior React", "React TypeScript", "React 18", "Frontend Lead"],
    recruiterSummary: "TechCorp is a Series B fintech startup building a payments dashboard for SMBs. They need a strong React engineer who can own the frontend architecture, work closely with US-based PMs, and ship fast. US hours are mandatory. Communication skills are as important as technical depth.",
    domainContext: "Payments/fintech dashboard product. US market focus. Team is 8 engineers total, very collaborative culture. Equity offered.",
    hiringSignals: ["Fast-growing team", "Recent Series B funding", "Equity on offer", "Strong engineering culture", "Frequent promotions"],
    risks: ["US hours are hard requirement, no flexibility", "High bar for communication", "Previous India-based hire didn't work out due to timezone issues"],
  },
};

// ── Job Chat ─────────────────────────────────────────────────
export const JOB_CHAT: Record<string, Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }>> = {
  [JOB_IDS[0]]: [
    { id: uid(), role: "user", content: "What should I look for in candidate communication tests for this role?", createdAt: dd(3) },
    { id: uid(), role: "assistant", content: "For a US-hours fintech role, focus on async clarity (written updates), ability to ask precise questions, and comfort with client-facing discussions. TechCorp's PMs are non-technical, so the candidate needs to explain complex frontend concepts in plain English. Test for proactive communication — do they give status updates without being asked?", createdAt: dd(3) },
    { id: uid(), role: "user", content: "Rahul Sharma scored 92%. Should I submit him?", createdAt: dd(1) },
    { id: uid(), role: "assistant", content: "Yes — 92% is a strong match. His React/TypeScript depth covers all must-haves, and his previous US-hours experience at Infosys reduces timezone risk. The one gap is GraphQL, but that's a nice-to-have. I'd recommend submitting with a note highlighting his communication rating and the US shift experience.", createdAt: dd(1) },
  ],
};

// ============================================================
// Reactive Mock Store
// ============================================================
export class MockStore {
  private candidates = [...CANDIDATES.map(c => ({ ...c, tags: [...c.tags] }))];
  private jobs = [...JOBS];
  private submissions = [...SUBMISSIONS];
  private tags = [...TAGS.map(t => ({ ...t, _count: { ...t._count } }))];
  private candidateStatuses = [...CANDIDATE_STATUSES];
  private users = [...USERS];
  private matches = [...MATCHES];
  private activity = [...RECENT_ACTIVITY];
  private jobActivity = { ...JOB_ACTIVITY };
  private candidateActivity = { ...CANDIDATE_ACTIVITY };
  private listeners = new Set<() => void>();

  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { this.listeners.forEach(fn => fn()); }

  // ── Getters ──
  getCandidates() { return this.candidates; }
  getCandidate(id: string) { return this.candidates.find(c => c.id === id) || null; }
  getJobs() { return this.jobs; }
  getJob(id: string) { return this.jobs.find(j => j.id === id) || null; }
  getSubmissions() { return this.submissions; }
  getTags() { return this.tags; }
  getCandidateStatuses() { return this.candidateStatuses; }
  getJobStatuses() { return JOB_STATUSES; }
  getUsers() { return this.users; }
  getMatches(jobId?: string) { return jobId ? this.matches.filter(m => m.jobId === jobId) : this.matches; }
  getRecentActivity() { return this.activity; }
  getJobActivity(jobId: string) { return this.jobActivity[jobId] || []; }
  getCandidateActivity(candidateId: string) { return this.candidateActivity[candidateId] || []; }
  getJobIntelligence(jobId: string) { return JOB_INTELLIGENCE[jobId] || null; }
  getJobChat(jobId: string) { return JOB_CHAT[jobId] || []; }

  // ── Mutations ──
  updateCandidate(id: string, data: Record<string, any>) {
    const idx = this.candidates.findIndex(c => c.id === id);
    if (idx >= 0) { this.candidates[idx] = { ...this.candidates[idx], ...data, updatedAt: new Date().toISOString() }; this.notify(); }
  }
  createCandidate(data: Record<string, any>) {
    const c = { id: uid(), name: data.name || "", email: data.email || "", phone: data.phone || null, title: data.title || null, source: data.source || null, shiftAvailability: data.shiftAvailability || "REGULAR", communicationRating: data.communicationRating || "GOOD", status: "New Lead", tags: [], transcription: null, portfolioUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { matches: 0 } } as any;
    this.candidates.unshift(c); this.notify(); return c;
  }
  deleteCandidate(id: string) { this.candidates = this.candidates.filter(c => c.id !== id); this.notify(); }

  updateJob(id: string, data: Record<string, any>) {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx >= 0) { this.jobs[idx] = { ...this.jobs[idx], ...data, updatedAt: new Date().toISOString() }; this.notify(); }
  }
  createJob(data: Record<string, any>) {
    const j = { id: uid(), roleTitle: data.roleTitle || "", clientName: data.clientName || "", clientWebsite: data.clientWebsite || null, status: data.status || "Draft", weeklyBudget: data.weeklyBudget || null, workingHours: data.workingHours || "GENERAL_SHIFT", industry: data.industry || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { matches: 0 } } as any;
    this.jobs.unshift(j); this.notify(); return j;
  }
  deleteJob(id: string) { this.jobs = this.jobs.filter(j => j.id !== id); this.notify(); }

  updateSubmission(id: string, data: Record<string, any>) {
    const idx = this.submissions.findIndex(s => s.id === id);
    if (idx >= 0) { this.submissions[idx] = { ...this.submissions[idx], ...data as any, updatedAt: new Date().toISOString() }; this.notify(); }
  }

  createTag(data: { name: string; color: string }) {
    const t = { id: uid(), name: data.name, color: data.color, _count: { candidates: 0 } } as typeof this.tags[number];
    this.tags.push(t); this.notify(); return t;
  }
  updateTag(id: string, data: { name?: string; color?: string }) {
    const idx = this.tags.findIndex(t => t.id === id);
    if (idx >= 0) { this.tags[idx] = { ...this.tags[idx], ...data }; this.notify(); }
  }
  deleteTag(id: string) { this.tags = this.tags.filter(t => t.id !== id); this.notify(); }

  addCandidateTag(candidateId: string, tagId: string) {
    const c = this.candidates.find(c => c.id === candidateId);
    const t = this.tags.find(t => t.id === tagId);
    if (c && t && !c.tags.find(ct => ct.id === tagId)) {
      c.tags.push({ id: t.id, name: t.name, color: t.color } as any);
      t._count.candidates++;
      this.notify();
    }
  }
  removeCandidateTag(candidateId: string, tagId: string) {
    const c = this.candidates.find(c => c.id === candidateId);
    const t = this.tags.find(t => t.id === tagId);
    if (c) { c.tags = c.tags.filter(ct => ct.id !== tagId); if (t) t._count.candidates = Math.max(0, t._count.candidates - 1); this.notify(); }
  }

  createCandidateStatus(data: { label: string; color: string }) {
    const s = { id: uid(), label: data.label, color: data.color, position: this.candidateStatuses.length };
    this.candidateStatuses.push(s); this.notify(); return s;
  }
  updateCandidateStatus(id: string, data: { label?: string; color?: string }) {
    const idx = this.candidateStatuses.findIndex(s => s.id === id);
    if (idx >= 0) { this.candidateStatuses[idx] = { ...this.candidateStatuses[idx], ...data }; this.notify(); }
  }
  deleteCandidateStatus(id: string) { this.candidateStatuses = this.candidateStatuses.filter(s => s.id !== id); this.notify(); }
  reorderCandidateStatuses(ids: string[]) {
    const reordered = ids.map((id, i) => {
      const s = this.candidateStatuses.find(s => s.id === id);
      return s ? { ...s, position: i } : null;
    }).filter(Boolean) as typeof this.candidateStatuses;
    this.candidateStatuses = reordered; this.notify();
  }

  updateMatch(id: string, data: Record<string, any>) {
    const idx = this.matches.findIndex(m => m.id === id);
    if (idx >= 0) { this.matches[idx] = { ...this.matches[idx], ...data, updatedAt: new Date().toISOString() }; this.notify(); }
  }

  postJobActivity(jobId: string, content: string) {
    const entry = { id: uid(), type: "comment", content, createdAt: new Date().toISOString(), user: { name: "Joel Davis" } };
    if (!this.jobActivity[jobId]) this.jobActivity[jobId] = [];
    this.jobActivity[jobId].unshift(entry); this.notify(); return entry;
  }
  postCandidateActivity(candidateId: string, content: string) {
    const entry = { id: uid(), type: "comment", content, createdAt: new Date().toISOString(), user: { name: "Joel Davis" } };
    if (!this.candidateActivity[candidateId]) this.candidateActivity[candidateId] = [];
    this.candidateActivity[candidateId].unshift(entry); this.notify(); return entry;
  }

  postJobChat(jobId: string, message: string) {
    if (!JOB_CHAT[jobId]) JOB_CHAT[jobId] = [];
    const userMsg = { id: uid(), role: "user" as const, content: message, createdAt: new Date().toISOString() };
    JOB_CHAT[jobId].push(userMsg);
    const aiMsg = { id: uid(), role: "assistant" as const, content: "That's a great question. Based on the job requirements and candidate profiles, I'd recommend focusing on the key competencies outlined in the intelligence brief. Let me know if you'd like me to dive deeper into any specific area.", createdAt: new Date().toISOString() };
    JOB_CHAT[jobId].push(aiMsg);
    this.notify();
    return aiMsg;
  }

  inviteUser(data: { name: string; email: string; role: string }) {
    const u = { id: uid(), name: data.name, email: data.email, role: data.role as any, createdAt: new Date().toISOString(), lastLoginAt: null };
    this.users.push(u); this.notify(); return u;
  }
  updateUser(id: string, data: Record<string, any>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx >= 0) { this.users[idx] = { ...this.users[idx], ...data }; this.notify(); }
  }
  deactivateUser(id: string) { this.users = this.users.filter(u => u.id !== id); this.notify(); }
}

export const mockStore = new MockStore();
