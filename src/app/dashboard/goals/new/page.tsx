import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import AddGoalForm from "@/components/forms/AddGoalForm";
import { auth } from "@/lib/auth";
import { getSubjects } from "@/app/actions/study-sessions";

const page = async () => {
  await auth({ redirect: true });

  const { subjects } = await getSubjects();

  // Extract topics from subjects
  return (
    <MaxWidthWrapper className="py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-background/60">
          <CardHeader className="border-b bg-muted/50 pb-8">
            <h1 className="text-2xl font-bold">Set new goal</h1>
            <p className="text-sm text-muted-foreground">
              Define a new goal to track your learning progress.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <AddGoalForm subjects={subjects} />
          </CardContent>
        </Card>
      </div>
    </MaxWidthWrapper>
  );
};

export default page;
