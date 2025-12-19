import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

export const Route = createFileRoute("/_sidebar/sponsor-funding")({
  component: () => <SponsorFunding />,
});

function SponsorFunding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Sponsor Funding & Cost Stewardship
        </h1>
        <p className="text-muted-foreground">
          Track sponsor funding and ensure cost-effective mission delivery
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Coming Soon
                <Badge variant="secondary">In Development</Badge>
              </CardTitle>
              <CardDescription>
                This module is currently under development and will be available soon.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Sponsor Funding module will provide comprehensive tracking including:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Funding allocation by sponsor
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Cost stewardship metrics
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Budget utilization tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sponsor relationship management
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


