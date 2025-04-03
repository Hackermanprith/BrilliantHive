"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, Clock, Loader2,  Edit2, Archive } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ActivityType} from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { formatMinutes } from "@/lib/time";
import EditSessionDialog from "../edit-session-dialog";
import { getStudySessions, toggleSessionArchive } from "@/app/actions/study-sessions";

interface Filters {
  subjectId?: string;
  topicId?: string;
  activity?: ActivityType;
}

const ITEMS_PER_PAGE = 10;

interface StudyHistoryTableProps {
  initialData: {
    sessions: any[];
    pagination: {
      total: number;
      pages: number;
      current: number;
    };
  };
}

const StudyHistoryTable = ({ initialData }: StudyHistoryTableProps) => {
  const { toast } = useToast();
  const [page, setPage] = useState<number>(initialData.pagination.current || 1);
  const [data, setData] = useState(initialData.sessions || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});
  const router = useRouter();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getStudySessions(page, ITEMS_PER_PAGE, filters);
      setData(result.sessions || []);
    } catch (error) {
      console.error("Failed to fetch study sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch study sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, activity: value as ActivityType }))}>
        <SelectTrigger>
          <SelectValue placeholder="Select Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="READING">Reading</SelectItem>
          <SelectItem value="WRITING">Writing</SelectItem>
          <SelectItem value="REVISION">Revision</SelectItem>
        </SelectContent>
      </Select>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No study sessions found
              </TableCell>
            </TableRow>
          ) : (
            data.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(session.date), "PPP")}
                </TableCell>
                <TableCell>{session.subject?.name || "N/A"}</TableCell>
                <TableCell>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatMinutes(session.duration)}
                </TableCell>
                <TableCell>{session.type.replace("_", " ")}</TableCell>
                <TableCell>
                  {session.difficulty && (
                    <Badge variant="outline">{session.difficulty.replace("_", " ")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <EditSessionDialog session={session} trigger={<Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>} onSuccess={() => router.refresh()} subjects={[]} topics={[]} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Study Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to archive this study session? You can restore it later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const result = await toggleSessionArchive(session.id);
                            if (result.error) {
                              toast({
                                title: "Error",
                                description: result.error,
                                variant: "destructive",
                              });
                              return;
                            }
                            toast({
                              title: "Success",
                              description: "Session archived successfully",
                              variant: "default",
                            });
                            router.refresh();
                          }}
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {page === 1 ? (
              <PaginationPrevious isActive={false} />
            ) : (
              <PaginationPrevious onClick={() => setPage((prev) => Math.max(prev - 1, 1))} />
            )}
          </PaginationItem>
          <PaginationItem>
            Page {page} of {initialData.pagination.pages}
          </PaginationItem>
          <PaginationItem>
            {page === initialData.pagination.pages ? (
              <PaginationNext isActive={false} />
            ) : (
              <PaginationNext onClick={() => setPage((prev) => Math.min(prev + 1, initialData.pagination.pages))} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default StudyHistoryTable;
