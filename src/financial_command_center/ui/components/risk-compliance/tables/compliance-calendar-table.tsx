import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileCheck, Shield, ClipboardCheck } from "lucide-react";
import type { ComplianceCalendarEvent, ComplianceEventType } from "../types";

interface ComplianceCalendarTableProps {
  events: ComplianceCalendarEvent[];
}

const getEventIcon = (type: ComplianceEventType) => {
  switch (type) {
    case "audit":
      return <ClipboardCheck className="h-4 w-4" />;
    case "filing":
      return <FileCheck className="h-4 w-4" />;
    case "certification":
      return <Shield className="h-4 w-4" />;
    case "review":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "overdue":
      return "Overdue";
    case "upcoming":
      return "Upcoming";
    default:
      return status;
  }
};

export function ComplianceCalendarTable({ events }: ComplianceCalendarTableProps) {
  // Sort by due date and status (overdue first, then by date)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const overdueCount = events.filter((e) => e.status === "overdue").length;
  const upcomingCount = events.filter((e) => e.status === "upcoming" || e.status === "in_progress").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Compliance Calendar
            </CardTitle>
            <CardDescription>
              Upcoming audits, filings, and certifications
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 text-destructive">
                <span className="font-semibold">{overdueCount}</span>
                <span className="text-muted-foreground">overdue</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{upcomingCount}</span>
              <span className="text-muted-foreground">upcoming</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead className="text-center">Due Date</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className={event.status === "overdue" ? "bg-destructive/5" : ""}
                >
                  <TableCell>
                    <div className="flex items-center justify-center text-muted-foreground">
                      {getEventIcon(event.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.sponsor}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(event.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        event.daysUntilDue < 0
                          ? "text-destructive font-semibold"
                          : event.daysUntilDue <= 14
                          ? "text-amber-600 dark:text-amber-400 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {event.daysUntilDue < 0
                        ? `${Math.abs(event.daysUntilDue)}d overdue`
                        : `${event.daysUntilDue}d`}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(event.status)}>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

