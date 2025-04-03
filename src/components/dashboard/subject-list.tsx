"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Subject } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeSubject } from "@/app/actions/subjects";

const SubjectsList = ({ subjects }: { subjects: Subject[] }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [archiveData, setArchiveData] = useState<Record<string, boolean>>({});

  const handleRemoveSubject = async (subjectId: string) => {
    const shouldArchive = archiveData[subjectId] ?? false;
    const result = await removeSubject(subjectId, shouldArchive);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subject removed successfully",
      });
      router.refresh();
    }
    setIsOpen((prev) => ({ ...prev, [subjectId]: false }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subjects.length === 0 && (
        <div className="text-sm text-muted-foreground">No subjects found</div>
      )}
      {subjects.map((subject: Subject) => {
        return (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{subject.name}</CardTitle>
                <AlertDialog
                  open={isOpen[subject.id]}
                  onOpenChange={(open) =>
                    setIsOpen((prev) => ({ ...prev, [subject.id]: open }))
                  }
                >
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"} size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Subject</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4 p-4">
                      <AlertDialogDescription>
                        Are you sure you want to remove {subject.name}?
                      </AlertDialogDescription>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`archive-${subject.id}`}
                          checked={archiveData[subject.id]}
                          onCheckedChange={(checked: boolean) =>
                            setArchiveData((prev) => ({
                              ...prev,
                              [subject.id]: checked === true,
                            }))
                          }
                        />
                        <label
                          htmlFor={`archive-${subject.id}`}
                          className="text-sm text-muted-foreground"
                        >
                          Archive associated goals and study sessions
                        </label>
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardDescription>Subject code: {subject.code.toUpperCase()}<br/>Subject id: {subject.id.toUpperCase()}<br/></CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default SubjectsList;
