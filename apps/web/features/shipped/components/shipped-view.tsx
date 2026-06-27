"use client";

import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Rocket, Loader2, GitCommit, CheckCircle2, Clock } from "lucide-react";

export function ShippedView({ organizationId }: { organizationId: string }) {
  const { data: shippedFeatures, isLoading } = trpc.approval.getShipped.useQuery({
    organizationId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Shipped Features</h1>
          <p className="mt-1 text-sm text-zinc-400">
            A timeline of features that have been successfully reviewed, approved, and released.
          </p>
        </div>
      </div>

      {!shippedFeatures || shippedFeatures.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-sm">
          <Rocket className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-white">No shipped features yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Features that pass human approval will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shippedFeatures.map((feature: any) => (
            <Card key={feature.id} className="border-emerald-500/20 bg-zinc-900/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-zinc-400">{feature.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs">
                    Shipped
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                  <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Delivery Timeline</h4>
                  <div className="relative border-l border-zinc-800 ml-3 space-y-6">
                    <TimelineItem 
                      icon={<Clock className="h-4 w-4 text-zinc-400" />}
                      title="Request Submitted"
                      date={feature.timeline.requestedAt}
                    />
                    <TimelineItem 
                      icon={<CheckCircle2 className="h-4 w-4 text-blue-400" />}
                      title="PRD & Tasks Approved"
                      date={feature.timeline.prdApprovedAt}
                    />
                    <TimelineItem 
                      icon={<GitCommit className="h-4 w-4 text-yellow-400" />}
                      title="Pull Request Opened"
                      date={feature.timeline.prOpenedAt}
                    />
                    <TimelineItem 
                      icon={<Rocket className="h-4 w-4 text-emerald-400" />}
                      title="Human Approved & Shipped"
                      date={feature.timeline.shippedAt}
                      isLast
                    />
                  </div>
                </div>

                {feature.approvalNotes && (
                  <div className="mt-4 rounded-lg bg-emerald-900/10 p-4 border border-emerald-900/30">
                    <div className="text-xs font-semibold text-emerald-500/70 mb-1">APPROVAL NOTES</div>
                    <p className="text-sm text-zinc-300">{feature.approvalNotes}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <Link href={`/dashboard/feature-requests/${feature.id}`}>
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      View Original Request
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ icon, title, date, isLast = false }: { icon: React.ReactNode, title: string, date: string | Date | null, isLast?: boolean }) {
  if (!date) return null;
  
  return (
    <div className="relative pl-6">
      <div className={`absolute -left-[13px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 ${isLast ? 'border-emerald-500/50 bg-emerald-500/10' : ''}`}>
        {icon}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <span className={`text-sm font-medium ${isLast ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>{title}</span>
        <span className="text-xs text-zinc-500 mt-1 sm:mt-0">
          {new Date(date).toLocaleString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}