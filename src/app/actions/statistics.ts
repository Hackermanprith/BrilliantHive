"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, subDays, format, addDays } from "date-fns";
import { getGoalStreakWithCache } from "./goals";

export interface StatisticsData {
  dailyProgress: {
    date: string;
    reading: number;
    watching: number;
    pyq: number;
    dpp: number;
    revision: number;
    immersion: number;
    testPrep: number;
    other: number;
  }[];
  summary: {
    averageMinutesPerDay?: number;
    totalMinutes: number;
    currentStreak: number;
  };
}

export async function getStatistics(
  timeframe: string = "week"
): Promise<StatisticsData> {
  try {
    const user = await auth({ required: true });
    if (!user) throw new Error("User not found");

    const today = startOfDay(new Date());
    const daysToLookBack =
      timeframe === "week" ? 7 : timeframe === "month" ? 30 : 365;
    const startDate = subDays(today, daysToLookBack - 1);

    console.log("Query parameters:", {
      userId: user.id,
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
    });

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        archived: false,
        date: {
          gte: startDate,
          lte: today,
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    console.log("Found sessions:", sessions);

    const dailyProgress: StatisticsData["dailyProgress"] = [];
    for (let i = 0; i < daysToLookBack; i++) {
      const date = format(addDays(startDate, i), "yyyy-MM-dd");
      dailyProgress.push({
        date,
        reading: 0,
        watching: 0,
        pyq: 0,
        dpp: 0,
        revision: 0,
        immersion: 0,
        testPrep: 0,
        other: 0,
      });
    }

    console.log("Initial daily progress:", dailyProgress);

    sessions.forEach((session) => {
      const dateStr = format(session.date, "yyyy-MM-dd");
         const dayData = dailyProgress.find((d) => d.date === dateStr);
      if (dayData) {
        switch (session.type) {
          case "READING":
            dayData.reading += session.duration;
            break;
          case "WATCHING":
            dayData.watching += session.duration;
            break;
          case "PYQ":
            dayData.pyq += session.duration;
            break;
          case "DPP":
            dayData.dpp += session.duration;
            break;
          case "REVISION":
            dayData.revision += session.duration;
            break;
          case "IMMERSION":
            dayData.immersion += session.duration;
            break;
          case "TESTPREP":
            dayData.testPrep += session.duration;
            break;
          case "OTHER":
            dayData.other += session.duration;
            break;
        }
      }
    });

    console.log("Final daily progress:", dailyProgress);

    const totalMinutes = sessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    const averageMinutesPerDay = Math.round(totalMinutes / daysToLookBack);
    const currentStreak = await getGoalStreakWithCache(user.id);

    return {
      dailyProgress,
      summary: {
        totalMinutes,
        averageMinutesPerDay,
        currentStreak,
      },
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      dailyProgress: [],
      summary: {
        currentStreak: 0,
        totalMinutes: 0,
        averageMinutesPerDay: 0,
      },
    };
  }
}
