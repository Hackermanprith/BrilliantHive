"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getLeaderboard() {
  try {
    const user = await auth({ required: true });
    if (!user) throw new Error("User not authenticated");

    const leaderboard = await prisma.studySession.groupBy({
      by: ["userId"],
      _sum: { duration: true },
      orderBy: { _sum: { duration: "desc" } },
      take: 10,
    });

    const userIds = leaderboard.map(entry => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map(user => [user.id, user.name]));

    return leaderboard.map(entry => ({
      id: entry.userId,
      name: userMap.get(entry.userId) || "Unknown",
      totalMinutes: entry._sum.duration ?? 0,
    }));
  } catch (error) {
    console.error("❌ [getLeaderboard] Error:", error);
    return { error: "Failed to fetch leaderboard" };
  }
}
