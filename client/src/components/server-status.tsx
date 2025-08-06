import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Server } from "lucide-react";
import type { ServerStatus } from "@shared/schema";

interface ServerStatusCardProps {
  serverStatus?: ServerStatus[];
  isLoading: boolean;
}

export default function ServerStatusCard({ serverStatus, isLoading }: ServerStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 text-green-500" size={20} />
          Server Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </>
          ) : (
            serverStatus?.map((status) => (
              <div key={status.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{status.service}</span>
                <Badge 
                  variant="outline" 
                  className={`${
                    status.status === 'running' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    status.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {status.port ? `Port ${status.port}` : status.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
