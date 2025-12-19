import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/_sidebar/program-portfolio")({
  component: () => <ProgramPortfolio />,
});

function ProgramPortfolio() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Program Portfolio & Sponsor Funding Analytics
        </h1>
        <p className="text-muted-foreground">
          Analyze program performance and sponsor funding across all FFRDCs
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
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
            The Program Portfolio module will provide comprehensive analytics including:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Program performance tracking by FFRDC
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sponsor funding allocation analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Contract lifecycle management
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Resource allocation optimization
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


