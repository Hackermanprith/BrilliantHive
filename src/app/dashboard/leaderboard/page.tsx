"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";
import { getLeaderboard } from "@/app/actions/leaderboard";

interface Leader {
  id: string;
  name: string;
  totalMinutes: number;
}

// Function to convert minutes to "X hours Y minutes"
const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        if (!("error" in data)) {
          setLeaders(data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-center mb-6">🏆 Leaderboard</h1>
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader className="animate-spin w-10 h-10 text-gray-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="text-gray-700">
                    <TableHead className="p-3 text-left">Rank</TableHead>
                    <TableHead className="p-3 text-left">Name</TableHead>
                    <TableHead className="p-3 text-right">Total Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((user, index) => (
                    <TableRow key={user.id} className="border-b">
                      <TableCell className="p-3">{index + 1}</TableCell>
                      <TableCell className="p-3 font-medium">{user.name}</TableCell>
                      <TableCell className="p-3 text-right font-semibold">{formatTime(user.totalMinutes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
