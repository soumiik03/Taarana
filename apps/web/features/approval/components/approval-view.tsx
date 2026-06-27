"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Github } from "lucide-react";
import Link from "next/link";

export function ApprovalView({ featureId }: { featureId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const { data, isLoading } = trpc.approval.getApprovalData.useQuery({ featureId });

  const approveMutation = trpc.approval.approve.useMutation({
    onSuccess: () => {
      toast.success("Feature approved and shipped successfully!");
      router.push("/dashboard/shipped");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to approve feature");
    }
  });

  const rejectMutation = trpc.approval.reject.useMutation({
    onSuccess: () => {
      toast.success("Feature rejected. Sent back for fixes.");
      router.push("/dashboard/feature-requests");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reject feature");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!data || !data.featureRequest) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Feature not found</h2>
        <p className="mt-2 text-zinc-400">The feature you are trying to review could not be found.</p>
        <Button className="mt-6" variant="outline" onClick={() => router.push("/dashboard/feature-requests")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { featureRequest, prd, tasks, pullRequest, reviews } = data;
  const isReady = featureRequest.status === "ready-for-approval";

  const handleApprove = () => {
    approveMutation.mutate({ featureId, notes });
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast.error("Please provide rejection notes.");
      return;
    }
    rejectMutation.mutate({ featureId, notes });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{featureRequest.title}</h1>
            <Badge variant="outline" className="bg-zinc-900 capitalize">
              {featureRequest.status}
            </Badge>
          </div>
          <p className="mt-2 text-zinc-400">{featureRequest.description}</p>
        </div>
      </div>

      <Tabs defaultValue="prd" className="w-full">
        <TabsList className="w-full justify-start border-b border-zinc-800 bg-transparent p-0">
          <TabsTrigger value="prd" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">PRD</TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Tasks</TabsTrigger>
          <TabsTrigger value="pr" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Pull Request & Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prd" className="mt-6 space-y-6">
          {prd ? (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle>Product Requirements Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white">Problem Statement</h3>
                  <p className="mt-1 text-sm text-zinc-300">{prd.problemStatement}</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-white">Goals</h3>
                    <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                      {(prd.goals as string[])?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Non-Goals</h3>
                    <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                      {(prd.nonGoals as string[])?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Acceptance Criteria</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                    {(prd.acceptanceCriteria as string[])?.map((ac: string, i: number) => <li key={i}>{ac}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-lg">No PRD found</div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Implementation Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <div>
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <p className="mt-1 text-sm text-zinc-400">{task.description}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500">No tasks found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pr" className="mt-6 space-y-6">
          {pullRequest ? (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pull Request</CardTitle>
                  <CardDescription>
                    {pullRequest.repoOwner}/{pullRequest.repoName}#{pullRequest.prNumber}
                  </CardDescription>
                </div>
                <Link href={pullRequest.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" /> View on GitHub
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-medium text-white">{pullRequest.title}</h4>
                  <p className="mt-1 text-sm text-zinc-400 whitespace-pre-wrap">{pullRequest.description}</p>
                </div>

                <h3 className="mb-4 font-semibold text-white">AI Review History</h3>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={review.status === "ready-for-approval" ? "default" : "destructive"}>
                              {review.status}
                            </Badge>
                            <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm">Score: <span className="font-bold text-white">{review.score}/100</span></div>
                        </div>
                        <p className="text-sm text-zinc-300 mb-4">{review.overallAssessment}</p>
                        
                        {review.issues && review.issues.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issues Identified</h5>
                            {review.issues.map((issue: any) => (
                              <div key={issue.id} className="rounded bg-zinc-900 p-3 text-sm border border-zinc-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={`text-[10px] uppercase ${issue.severity === 'blocking' ? 'text-red-400 border-red-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                                    {issue.severity}
                                  </Badge>
                                  <span className="font-medium text-white">{issue.title}</span>
                                </div>
                                <p className="text-zinc-400 text-xs mt-2">{issue.whyItMatters}</p>
                                {issue.file && (
                                  <div className="mt-2 text-xs font-mono text-zinc-500 bg-black/20 p-1.5 rounded">
                                    {issue.file}{issue.line ? `:${issue.line}` : ''}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-sm text-zinc-500">No reviews found for this PR.</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-lg">No Pull Request found</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Human Approval Section */}
      {isReady && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Human Release Approval
            </CardTitle>
            <CardDescription>
              The AI review has passed. Please review the implementation and provide final approval for release.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Reviewer Notes (Optional for approval, required for rejection)</label>
              <Textarea 
                placeholder="Add any notes about this release or feedback for fixes..."
                className="min-h-[100px] border-zinc-700 bg-zinc-900 text-zinc-100"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row justify-end pt-4">
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={handleReject}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject & Request Fixes
              </Button>
              <Button 
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Approve & Mark as Shipped
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}