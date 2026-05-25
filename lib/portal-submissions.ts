import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getProjectById, getProjects } from '@/lib/data';

type PortalSubmission = {
  id: string;
  projectId: string;
  kind: 'confirmation' | 'message';
  title?: string;
  status?: '已确认' | '有疑问';
  message: string;
  createdAt: string;
  handledAt?: string;
  handledBy?: string;
};

type Project = ReturnType<typeof getProjects>[number];

const storagePath = process.env.PORTAL_SUBMISSIONS_PATH ?? join(process.cwd(), 'data', 'portal-submissions.json');

function readSubmissions() {
  if (!existsSync(storagePath)) {
    return [] as PortalSubmission[];
  }

  try {
    return JSON.parse(readFileSync(storagePath, 'utf8')) as PortalSubmission[];
  } catch {
    return [] as PortalSubmission[];
  }
}

function writeSubmissions(submissions: PortalSubmission[]) {
  mkdirSync(dirname(storagePath), { recursive: true });
  writeFileSync(storagePath, JSON.stringify(submissions, null, 2), 'utf8');
}

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

export function addConfirmationSubmission(projectId: string, title: string, status: '已确认' | '有疑问', message: string) {
  const submissions = readSubmissions();

  submissions.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    projectId,
    kind: 'confirmation',
    title,
    status,
    message,
    createdAt: nowText()
  });

  writeSubmissions(submissions);
}

export function addMessageSubmission(projectId: string, message: string) {
  const submissions = readSubmissions();

  submissions.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    projectId,
    kind: 'message',
    message,
    createdAt: nowText()
  });

  writeSubmissions(submissions);
}

export function markPortalSubmissionHandled(submissionId: string, handledBy: string) {
  const submissions = readSubmissions();
  const updatedSubmissions = submissions.map((submission) => {
    if (submission.id !== submissionId) {
      return submission;
    }

    return {
      ...submission,
      handledAt: nowText(),
      handledBy
    };
  });

  writeSubmissions(updatedSubmissions);
}

export function applyPortalSubmissions(project: Project) {
  const submissions = readSubmissions().filter((item) => item.projectId === project.id);
  const confirmationSubmissions = submissions.filter((item) => item.kind === 'confirmation');
  const messageSubmissions = submissions.filter((item) => item.kind === 'message');

  return {
    ...project,
    confirmations: project.confirmations.map((item) => {
      const latest = confirmationSubmissions.filter((submission) => submission.title === item.title).at(-1);

      if (!latest?.status) {
        return item;
      }

      return {
        ...item,
        status: latest.status,
        response: latest.message || (latest.status === '已确认' ? '客户已在线确认。' : '客户已在线提交疑问。')
      };
    }),
    messages: [
      ...project.messages,
      ...messageSubmissions.map((item) => `客户：${item.message}`),
      ...confirmationSubmissions.map((item) => `客户：${item.title} - ${item.status}${item.message ? `，${item.message}` : ''}`)
    ]
  };
}

export function getPortalSubmissionAlerts(includeHandled = false) {
  return readSubmissions()
    .filter((submission) => includeHandled || !submission.handledAt)
    .map((submission) => {
      const project = getProjectById(submission.projectId);

      if (!project) {
        return undefined;
      }

      return {
        id: submission.id,
        projectId: submission.projectId,
        projectName: project.name,
        customer: project.customer,
        projectStage: project.stage,
        owner: project.owner,
        kind: submission.kind,
        title: submission.kind === 'confirmation' ? `${submission.title} - ${submission.status}` : '客户留言',
        message: submission.message || (submission.status === '已确认' ? '客户已在线确认。' : '客户已在线提交疑问。'),
        createdAt: submission.createdAt,
        handledAt: submission.handledAt,
        handledBy: submission.handledBy
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function getProjectWithPortalSubmissions(projectId: string) {
  const project = getProjectById(projectId);
  return project ? applyPortalSubmissions(project) : undefined;
}

export function getPortalProjectsWithSubmissions(customerId?: string) {
  return getProjects()
    .filter((project) => project.portalVisible)
    .filter((project) => !customerId || project.customerId === customerId)
    .map((project) => applyPortalSubmissions(project));
}
