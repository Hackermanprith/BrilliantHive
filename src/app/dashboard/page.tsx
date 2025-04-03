import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { auth } from "@/lib/auth";
import React from "react";
import { getGoals } from "../actions/goals";
import { getStudySessions } from "../actions/study-sessions";
import { DashboardData, GoalWithSubject} from "@/types/dashboard";
import { getStatistics } from "../actions/statistics";

const Page = async () => {
  const user = await auth({
    redirect: true,
  });

  const [goalData, recentSessions, statistics] = await Promise.all([
    getGoals(),
    getStudySessions(1, 5),
    getStatistics(),
  ]);

  const dashboardData: DashboardData = {
    goals: goalData.goals as GoalWithSubject[],
    summary: goalData.summary || { activeGoals: 0, completedGoals: 0, currentStreak: 0, successRate: 0 },
    recentSessions: {
      sessions: recentSessions.sessions
        ? recentSessions.sessions.map((session) => ({
            id: session.id,
            date: session.date,
            duration: session.duration,
            type: session.type,
            description: session.description || null,
            difficulty: session.difficulty || null,
            subject: session.subject ? { id: session.subject.id, name: session.subject.name } : null,
            topic: session.topic ? { id: session.topic.id, name: session.topic.name } : null,
            archived:false,
            createdAt: session.date
            // createdAt: session.createdAt, // Removed as it does not exist on the session type
          }))
        : [],
    },
    statistics: {
      totalMinutes: statistics.summary.totalMinutes,
      averageMinutesPerDay: statistics.summary.averageMinutesPerDay || 0,
    },
  };
  

  const fallbackData: DashboardData = {
    goals: [],
    summary: {
      activeGoals: 0,
      completedGoals: 0,
      currentStreak: 0,
      successRate: 0
    },
    recentSessions: { sessions: [] },
    statistics: { totalMinutes: 0, averageMinutesPerDay: 0 },
  };

  return (
    <MaxWidthWrapper>
      <DashboardContent 
        user={user}
        userData={dashboardData || fallbackData}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
