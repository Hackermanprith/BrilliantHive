"use client";
import { updateSession } from "@/app/actions/study-sessions";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField, FormItem, FormLabel
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StudySessionInput, studySessionInputSchema } from "@/lib/schemas/study-session";
import { convertFromMinutes, convertToMinutes } from "@/lib/time";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityType, Difficulty } from "@prisma/client";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface EditSessionDialogProps {
  session: {
    id: string;
    date: Date;
    duration: number;
    type: ActivityType;
    description?: string | null;
    difficulty?: Difficulty | null;
    subjectId?: string | null;
    topicId?: string | null;
  };
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string }[];
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const EditSessionDialog = ({ session, subjects, topics, trigger, onSuccess }: EditSessionDialogProps) => {
  const { toast } = useToast();
  const { hours, minutes } = convertFromMinutes(session.duration);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<StudySessionInput>({
    resolver: zodResolver(studySessionInputSchema),
    defaultValues: {
      subjectId: session.subjectId || "",
      topicId: session.topicId || "",
      date: new Date(session.date),
      hours,
      minutes,
      type: session.type,
      description: session.description || "",
      difficulty: session.difficulty || undefined,
    },
  });

  async function onSubmit(data: StudySessionInput) {
    try {
      setIsLoading(true);
      const duration = convertToMinutes(data.hours, data.minutes);
      const result = await updateSession(session.id, { ...data, duration });
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Session updated", description: "Successfully updated session." });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update session.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Study Session</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Subject Selection */}
            <FormField control={form.control} name="subjectId" render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            
            {/* Topic Selection */}
            <FormField control={form.control} name="topicId" render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Topic</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {topics.map(topic => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            
            {/* Other Fields: Date, Type, Difficulty, Duration, Description */}
            {/* Submit Button */}
            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Session"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSessionDialog;
