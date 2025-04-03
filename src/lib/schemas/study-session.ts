import { z } from "zod";
import { ActivityType, Difficulty } from "@prisma/client";

export const studySessionInputSchema = z
  .object({
    subjectId: z.string(),
    topicId: z.string().optional(),
    date: z.date(),
    hours: z.number().min(0),
    minutes: z.number().min(0).max(59),
    type: z.nativeEnum(ActivityType),
    description: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
  })
  .refine((data) => data.hours > 0 || data.minutes > 0, {
    message: "Total duration must be greater than 0",
  });

export type StudySessionInput = z.infer<typeof studySessionInputSchema>;

export interface StudySessionWithSubject {
  id: string;
  date: Date;
  duration: number;
  type: ActivityType;
  description: string | null;
  difficulty: Difficulty | null;
  subject: {
    id: string;
    name: string;
  };
  topic?: {
    id: string;
    name: string;
  } | null;
}
