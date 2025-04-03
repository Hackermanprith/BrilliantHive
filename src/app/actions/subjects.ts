"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string(),
  code: z.string().min(2, "📚 Subject code must be at least 2 characters"),
  level: z.enum([
    "BEGINNER",
    "ELEMENTARY",
    "INTERMEDIATE",
    "UPPER_INTERMEDIATE",
    "ADVANCED",
    "MASTERY",
  ]),
  topic: z.string().min(1, "📌 Topic is required"),
});

export async function addSubject(values: z.infer<typeof subjectSchema>) {
  try {
    console.log("🚀 [addSubject] Start", values);
    const user = await auth({ required: true });
    if (!user) {
      throw new Error("❌ User not found");
    }
    console.log("✅ [addSubject] Authenticated User:", user.id);

    const validatedFields = subjectSchema.parse(values);
    console.log("📋 [addSubject] Validated Fields:", validatedFields);

    const subjectCode = `${validatedFields.code}-${validatedFields.topic.replace(/\s+/g, "").toUpperCase()}`;
    console.log("🔢 [addSubject] Computed Subject Code:", subjectCode);

    let subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { code: subjectCode },
          { name: `${validatedFields.name}-${validatedFields.topic}` },
        ],
      },
    });
    console.log("🔍 [addSubject] Existing Subject:", subject);

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: `${validatedFields.name}-${validatedFields.topic}`,
          code: subjectCode,
        },
      });
      console.log("✨ [addSubject] Created Subject:", subject);
    }

    let topic = await prisma.topic.findFirst({
      where: {
        name: `${validatedFields.name}-${validatedFields.topic}`,
        subjectId: subject.id,
      },
    });
    console.log("🔍 [addSubject] Existing Topic:", topic);

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          name: `${validatedFields.name}-${validatedFields.topic}`,
          subjectId: subject.id,
        },
      });
      console.log("📌 [addSubject] Created Topic:", topic);
    }

    const existingProgress = await prisma.subjectProgress.findUnique({
      where: {
        userId_subjectId: {
          userId: user.id,
          subjectId: subject.id,
        },
      },
    });
    console.log("🧐 [addSubject] Existing Subject Progress:", existingProgress);

    if (existingProgress) {
      return {
        error: "⚠️ You are already learning this subject",
      };
    }

    const progress = await prisma.subjectProgress.create({
      data: {
        userId: user.id,
        subjectId: subject.id,
        level: validatedFields.level,
        totalMinutes: 0,
        targetLevel: validatedFields.level,
        topic: `${validatedFields.name}-${validatedFields.topic}`,
      },
      include: {
        subject: true,
      },
    });
    console.log("🎯 [addSubject] Created Subject Progress:", progress);

    revalidatePath("/dashboard");
    console.log("🔄 [addSubject] Revalidated Dashboard Path");

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("❌ [addSubject] Error:", error);
    return {
      error: "Failed to add subject",
    };
  }
}

export async function removeSubject(
  subjectId: string,
  archive: boolean = false
) {
  try {
    console.log("🗑️ [removeSubject] Start", { subjectId, archive });
    const user = await auth({ required: true });
    if (!user) {
      throw new Error("❌ User not found");
    }
    console.log("✅ [removeSubject] Authenticated User:", user.id);

    await prisma.$transaction(async (tx) => {
      if (archive) {
        console.log("📦 [removeSubject] Archiving associated goals and sessions");
        await tx.goal.updateMany({
          where: {
            userId: user.id,
            subjectId,
          },
          data: {
            archived: true,
          },
        });

        await tx.studySession.updateMany({
          where: {
            userId: user.id,
            subjectId,
          },
          data: {
            archived: true,
          },
        });
      }

      console.log("🗑️ [removeSubject] Deleting Subject Progress");
      await tx.subjectProgress.deleteMany({
        where: {
          userId: user.id,
          subjectId,
        },
      });
    });

    revalidatePath("/dashboard/subjects");
    revalidatePath("/dashboard");
    console.log("🔄 [removeSubject] Revalidated Dashboard Paths");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [removeSubject] Error:", error);
    return {
      error: "Failed to remove subject",
    };
  }
}