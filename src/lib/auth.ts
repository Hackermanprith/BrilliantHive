import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type AuthConfig = {
  redirect?: boolean;
  required?: boolean;
};

export async function auth(
  config: AuthConfig = { required: true, redirect: true }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    console.log("❌ No user found in session.");
    if (!config.required) return null;
    if (config.redirect) return redirect("/");
    return null;
  }

  try {
    console.log("🔍 Checking user in DB:", user.id);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }, // 🔥 Only using ID for lookup
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        subjects: {
          select: {
            id: true,
            subject: { select: { id: true, name: true, code: true } },
            level: true,
            targetLevel: true,
            totalMinutes: true,
          },
        },
        topics: {
          select: {
            id: true,
            topic: { select: { id: true, name: true, subjectId: true } },
            progress: true,
          },
        },
      },
    });


    if (!dbUser) {
      console.log("⚡ User not found in DB, creating new user...")
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user?.email || "",
          name: user?.given_name
            ? `${user.given_name} ${user.family_name}`
            : "John Doe",
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          subjects: {
            select: {
              id: true,
              subject: { select: { id: true, name: true, code: true } },
              level: true,
              targetLevel: true,
              totalMinutes: true,
            },
          },
          topics: {
            select: {
              id: true,
              topic: { select: { id: true, name: true, subjectId: true } },
              progress: true,
            },
          },
        },
      });

      return newUser;
    }

    return dbUser;
  } catch (error) {
    console.error(error);
    if (!config.required) return null;
    if (config.redirect) return redirect("/"); // Redirect only when allowed
    return null;
  }
}
