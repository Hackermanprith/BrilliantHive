import { ActivityType, Difficulty, Level, GoalStatus } from "@prisma/client";

export type UserWithSubjects = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  subjects: {
    id: string;
    subject: {
      id: string;
      name: string;
      code: string;
    };
    level: Level;
    targetLevel: Level;
    totalMinutes: number;
  }[];
  topics: {
    id: string;
    topic: {
      id: string;
      name: string;
      subjectId: string;
    };
    progress: number;
  }[];
} | null;

export type GoalWithSubject = {
  id: string;
  subject?: {
    id: string;
    name: string;
  } | null;
  topic?: {
    id: string;
    name: string;
  } | null;
  status: GoalStatus;
  target: number;
  progress: number;
  deadline: Date;
  activityType: ActivityType;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionWithSubject = {
  id: string;
  date: Date;
  duration: number;
  type: ActivityType;
  description: string | null;
  difficulty: Difficulty | null;
  subject?: {
    id: string;
    name: string;
  } | null;
  topic?: {
    id: string;
    name: string;
  } | null;
  archived: boolean;
  createdAt: Date;
};

export type DashboardData = {
  goals: GoalWithSubject[];
  summary: {
    activeGoals: number;
    completedGoals: number;
    currentStreak: number;
    successRate: number;
  };
  recentSessions: {
    sessions: SessionWithSubject[];
  };
  statistics: {
    totalMinutes: number;
    averageMinutesPerDay: number;
  };
  error?: string;
};

export type DashboardContentProps = {
  user: UserWithSubjects;
  userData: DashboardData;
};