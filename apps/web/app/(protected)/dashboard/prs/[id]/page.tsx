"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
  GitPullRequest,
  Lightbulb,
  FileText,
  Kanban,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  History,
  FileCheck,
  Circle,
  Loader2
} from "lucide-react";
import { cn } from "~/lib/utils";
import { RotatingLoader } from "~/components/rotating-loader";

interface AIReviewProgressCardProps {
  isReviewInProgress: boolean;
  pr: any;
}

function AIReviewProgressCard({ isReviewInProgress, pr }: AIReviewProgressCardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Loading Feature Request", duration: 1500 },
    { label: "Reading PRD", duration: 1500 },
    { label: "Reading Generated Tasks", duration: 1500 },
    { label: "Fetching GitHub Diff", duration: 2000 },
    { label: "Reviewing Code", duration: 3000 },
    { label: "Detecting Requirement Violations", duration: 3500 },
    { label: "Consolidating Findings", duration: 3000 },
    { label: "Preparing Report", duration: 2500 }
  ];

  useEffect(() => {
    if (!isReviewInProgress) {
      setCurrentStep(0);
      return;
    }

    let current = 0;
    const timers: NodeJS.Timeout[] = [];

    const runNextStep = () => {
      if (current >= steps.length) return;
      
      const timer = setTimeout(() => {
        current += 1;
        setCurrentStep(current);
        runNextStep();
      }, steps[current]?.duration ?? 2000);
      
      timers.push(timer);
    };

    runNextStep();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isReviewInProgress]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-[#252525] border border-[#2D2D2D] rounded-xl p-6 space-y-4 max-w-sm w-full text-left shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Loader2 className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
            AI Review Running
          </h3>
          <span className="text-[9px] font-mono text-[#9B9B9B] bg-zinc-800 px-2 py-0.5 rounded">
            Commit: {pr?.headSha?.slice(0, 7)}
          </span>
        </div>
        
        {/* Context messages rotating based on active step */}
        <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900 text-[11px] text-zinc-400 text-center animate-pulse min-h-[34px] flex items-center justify-center">
          {currentStep === 0 && "Analyzing Feature Request..."}
          {currentStep === 1 && "Comparing PRD with implementation..."}
          {currentStep === 2 && "Reading changed files..."}
          {currentStep === 3 && "Fetching diff details from GitHub..."}
          {currentStep === 4 && "Checking requirements coverage..."}
          {currentStep === 5 && "Detecting compliance violations..."}
          {currentStep === 6 && "Consolidating findings and comments..."}
          {currentStep >= 7 && "Preparing final assessment..."}
        </div>

        <div className="space-y-3 pt-2">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;

            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                {isCompleted ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-4.5 w-4.5 text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="h-4.5 w-4.5 text-zinc-700 shrink-0" />
                )}
                <span className={cn(
                  "transition-colors duration-300",
                  isCompleted ? "text-[#E3E3E3] font-medium" :
                  isActive ? "text-indigo-400 font-bold" : "text-zinc-500"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PullRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<any>(null);

  // Query pull request database context
  const { data: ctx, isLoading: isCtxLoading, error: ctxError } = trpc.pullRequest.getById.useQuery(
    { id },
    { refetchInterval: 4000 }
  );

  // Query pull request review comments and commit history from GitHub
  const { data: reviewHistory, isLoading: isHistoryLoading } = trpc.pullRequest.getReviewHistory.useQuery(
    { id },
    { refetchInterval: 4000 }
  );

  if (isCtxLoading) {
    return (
      <div className="space-y-6 mx-auto max-w-6xl px-4 py-8 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-2/3 bg-zinc-800 rounded mt-4" />
        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-zinc-900 rounded-xl border border-zinc-800" />
            <div className="h-72 bg-zinc-900 rounded-xl border border-zinc-800" />
          </div>
          <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  if (ctxError || !ctx) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5 max-w-xl mx-auto my-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error loading Pull Request Details</h3>
        <p className="text-zinc-400 mb-6 text-sm">
          {ctxError?.message || "Pull request context could not be retrieved from the server."}
        </p>
        <Button onClick={() => router.push("/dashboard/prs")} className="bg-white text-black hover:bg-zinc-100 font-semibold py-2 px-4 rounded-xl">
          Back to list
        </Button>
      </div>
    );
  }

  const { pr, featureRequest, prd, tasks } = ctx;

  // Visual stages for Workflow Timeline
  const isPrOpen = pr.status === "open" || pr.status === "closed";
  const isPrReviewed = !!reviewHistory?.latest;
  const isFixNeeded = featureRequest && featureRequest.status === "fix-needed";
  const isApproved = featureRequest && featureRequest.status === "ready-for-approval";
  const isShipped = pr.status === "closed";

  // Enforce cascading completion: if any later stage is active/completed, earlier stages are completed
  const hasPRReviewedOrBeyond = isPrReviewed || isApproved || isFixNeeded || isShipped;
  const hasPROpenOrBeyond = isPrOpen || hasPRReviewedOrBeyond;
  
  const isClarified = !!(featureRequest && featureRequest.status !== "pending" && featureRequest.status !== "clarifying") || hasPROpenOrBeyond;
  const isPrdApproved = !!(prd && prd.status === "approved") || hasPROpenOrBeyond;
  const isTasksGenerated = !!(tasks && tasks.length > 0) || hasPROpenOrBeyond;

  // Dynamic counts for tasks in timeline
  const totalTasks = tasks ? tasks.length : 0;
  const completedTasks = tasks ? tasks.filter(t => t.status === "done").length : 0;
  const tasksDetail = (() => {
    if (!isTasksGenerated || totalTasks === 0) return "Generating...";
    if (completedTasks === totalTasks) return `${totalTasks} / ${totalTasks} Completed`;
    if (completedTasks > 0) return `${completedTasks} / ${totalTasks} Completed`;
    return `${totalTasks} Tasks Generated`;
  })();

  const timelineStages = [
    { label: "Feature Request", completed: true, active: false, details: "Logged successfully" },
    { label: "Clarifications", completed: isClarified, active: !isClarified && featureRequest?.status === "clarifying", details: isClarified ? "Completed" : "Questions pending" },
    { label: "PRD Approved", completed: isPrdApproved, active: isClarified && !isPrdApproved, details: isPrdApproved ? "Approved" : "Awaiting approval" },
    { label: "Tasks Generated", completed: isTasksGenerated, active: isPrdApproved && !isTasksGenerated, details: tasksDetail },
    { label: "Pull Request Submitted", completed: isPrOpen || hasPRReviewedOrBeyond, active: isTasksGenerated && !isPrOpen && !hasPRReviewedOrBeyond, details: (isPrOpen || hasPRReviewedOrBeyond) ? "Submitted" : "In development" },
    { label: "AI Review Completed", completed: isPrReviewed || isApproved || isFixNeeded || isShipped, active: isPrOpen && !isPrReviewed && !isApproved && !isFixNeeded && !isShipped, details: (isPrReviewed || isApproved || isFixNeeded || isShipped) ? "Completed" : "Awaiting review" },
    { label: "Approved / Fix Required", completed: isApproved || isFixNeeded || isShipped, active: isPrReviewed && !isApproved && !isFixNeeded && !isShipped, details: isApproved || isShipped ? "Approved" : isFixNeeded ? "Fix required" : "Pending decision" },
    { label: "Shipped", completed: isShipped, active: isApproved && !isShipped, details: isShipped ? "Merged into prod" : "Ready to merge" },
  ];

  // Latest review represents current active issues
  const latestReview = reviewHistory?.latest;
  const activeIssues = latestReview?.issues || [];
  const blockingIssues = activeIssues.filter(issue => issue.severity === "blocking");
  const nonBlockingIssues = activeIssues.filter(issue => issue.severity !== "blocking");
  const isReviewInProgress = !latestReview || latestReview.commitSha !== pr.headSha;

  return (
    <div className="space-y-6 mx-auto max-w-6xl px-4 py-8">
      {/* Back link */}
      <Link href="/dashboard/prs" className="inline-flex items-center gap-1.5 text-xs text-[#9B9B9B] hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Pull Requests
      </Link>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2D2D] pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn(
              "font-semibold text-[10px] uppercase px-2 py-0.5",
              pr.status === "open"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
            )}>
              {pr.status}
            </Badge>
            <span className="font-mono text-sm text-[#9B9B9B]">PR #{pr.prNumber}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E3E3] mt-2">
            {pr.title}
          </h1>
          <p className="mt-1 text-xs text-[#9B9B9B] font-mono">
            {pr.repoOwner}/{pr.repoName} &middot; Branch: {pr.branch}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black font-semibold text-xs px-4 py-2.5 hover:bg-zinc-150 transition-colors shadow-lg cursor-pointer"
          >
            Open on GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Workflow Timeline Card */}
          <Card className="bg-[#202020] border-[#2D2D2D]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-white">Workflow Timeline</CardTitle>
              <CardDescription className="text-xs text-[#9B9B9B]">Visual development pipeline status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 overflow-x-auto min-w-full">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#2D2D2D] -translate-y-1/2 hidden md:block" />
                {timelineStages.map((stage, i) => (
                  <div key={i} className="flex md:flex-col items-center gap-3 relative z-10 min-w-[100px]">
                    <div className={cn(
                      "h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all",
                      stage.completed
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : stage.active
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    )}>
                      {stage.completed ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="text-left md:text-center shrink-0">
                      <div className="text-[11px] font-bold text-[#E3E3E3]">{stage.label}</div>
                      <div className="text-[9px] text-[#9B9B9B]">{stage.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Review Results Card */}
          <Card className="bg-[#202020] border-[#2D2D2D]">
            <CardHeader className="border-b border-[#2D2D2D]/60 flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-white">Current Review Issues</CardTitle>
                <CardDescription className="text-xs text-[#9B9B9B]">Active comments and bugs detected by AI QA reviewer</CardDescription>
              </div>
              {!isReviewInProgress && latestReview && (
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold px-2 py-0.5",
                    blockingIssues.length > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  )}>
                    {blockingIssues.length} Blocking
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5">
                    {nonBlockingIssues.length} Suggestions
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {isReviewInProgress ? (
                <AIReviewProgressCard isReviewInProgress={isReviewInProgress} pr={pr} />
              ) : latestReview ? (
                <>
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Status Card */}
                      <div className="bg-[#252525] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                        <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Overall Status</span>
                        <div className={cn(
                          "text-sm font-bold mt-1.5 flex items-center gap-1.5",
                          latestReview.status === "ready-for-approval" ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {latestReview.status === "ready-for-approval" ? (
                            <>
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                              Ready for Approval
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                              Fix Required
                            </>
                          )}
                        </div>
                      </div>

                      {/* Score Card */}
                      <div className="bg-[#252525] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                        <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Merge Readiness</span>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-lg font-extrabold text-[#818CF8]">{latestReview.score}%</span>
                          <span className="text-[10px] text-zinc-500">({latestReview.score}/100)</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              latestReview.score >= 80 ? "bg-emerald-500" :
                                latestReview.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${latestReview.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Breakdown Card */}
                      <div className="bg-[#252525] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                        <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Issue Breakdown</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20 px-1.5 py-0.5">
                            {blockingIssues.length} Blocking
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-400 border-orange-500/20 px-1.5 py-0.5">
                            {activeIssues.filter(i => i.severity === "high").length} High
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 py-0.5">
                            {activeIssues.filter(i => i.severity === "medium").length} Med
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-1.5 py-0.5">
                            {activeIssues.filter(i => i.severity === "low").length} Low
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20 px-1.5 py-0.5">
                            {activeIssues.filter(i => i.severity === "suggestion").length} Sug
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Assessment Card */}
                    <div className="bg-[#252525] p-4 rounded-xl border border-[#2D2D2D] space-y-1">
                      <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Overall Assessment</span>
                      <p className="text-xs text-[#E3E3E3] leading-relaxed whitespace-pre-wrap">
                        {latestReview.overallAssessment}
                      </p>
                    </div>
                  </div>

                  {activeIssues.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#2D2D2D] rounded-xl text-zinc-400 text-sm">
                      {isHistoryLoading ? "Checking comments..." : "🎉 No issues found on this PR. Clean codebase!"}
                    </div>
                  ) : (
                    <div className="space-y-4 border-t border-[#2D2D2D] pt-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Review Findings</h4>
                      <div className="space-y-4">
                        {activeIssues.map((issue) => (
                          <div key={issue.id} className={cn(
                            "p-4 rounded-xl border space-y-3.5 text-xs transition-colors",
                            issue.severity === "blocking" ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30" :
                              issue.severity === "high" ? "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/30" :
                                issue.severity === "medium" ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30" :
                                  issue.severity === "low" ? "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30" :
                                    "border-zinc-700 bg-zinc-800/10 hover:border-zinc-600"
                          )}>
                            <div className="flex justify-between items-start gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "text-[8px] font-extrabold uppercase px-1.5 py-0.5",
                                  issue.severity === "blocking" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                    issue.severity === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                      issue.severity === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                        issue.severity === "low" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                  {issue.severity}
                                </Badge>
                                <span className="font-bold text-white text-xs">{issue.title}</span>
                              </div>
                              {issue.file && (
                                <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded break-all">
                                  {issue.file}{issue.line ? `:${issue.line}` : ""}
                                </span>
                              )}
                            </div>

                            <div className="space-y-2.5 text-xs">
                              <div>
                                <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Why It Matters</span>
                                <p className="text-zinc-300 mt-0.5 leading-relaxed">{issue.whyItMatters}</p>
                              </div>

                              {issue.suggestedFix && (
                                <div>
                                  <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Suggested Fix</span>
                                  <pre className="text-xs text-emerald-400 mt-0.5 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-[#2D2D2D]/60 font-mono whitespace-pre-wrap">
                                    {issue.suggestedFix}
                                  </pre>
                                </div>
                              )}

                              {issue.expectedResult && (
                                <div>
                                  <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Expected Result</span>
                                  <p className="text-zinc-300 mt-0.5 leading-relaxed">{issue.expectedResult}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 border border-dashed border-[#2D2D2D] rounded-xl text-zinc-400 text-sm">
                  {isHistoryLoading ? "Checking comments..." : "🎉 No reviews recorded yet for this PR."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accordion for PRD & Tasks */}
          <Accordion className="space-y-4 w-full border-none bg-transparent">
            {prd ? (
              <AccordionItem value="prd" className="border border-[#2D2D2D] bg-[#202020] rounded-xl overflow-hidden px-0">
                <AccordionTrigger className="hover:no-underline font-bold text-sm text-white px-5 py-4 border-b border-[#2D2D2D]/60">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#F59E0B]" />
                    Product Requirements Document (PRD)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-5 text-zinc-300">
                  <div className="space-y-4 max-w-full">
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Problem Statement</h4>
                      <p className="text-xs leading-relaxed text-[#9B9B9B] whitespace-pre-wrap">{prd.problemStatement || "None specified."}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Goals</h4>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-[#9B9B9B]">
                        {(prd.goals as string[] || []).map((g, idx) => <li key={idx}>{g}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Acceptance Criteria</h4>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-[#9B9B9B]">
                        {(prd.acceptanceCriteria as string[] || []).map((c, idx) => <li key={idx}>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Edge Cases</h4>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-[#9B9B9B]">
                        {(prd.edgeCases as string[] || []).map((e, idx) => <li key={idx}>{e}</li>)}
                      </ul>
                    </div>
                    <Link href={`/dashboard/prds/${prd.id}`}>
                      <Button variant="outline" size="sm" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium">
                        Open in Full Editor &rarr;
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Card className="bg-[#202020] border-[#2D2D2D] p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs text-zinc-400 font-medium">No PRD linked to this feature.</span>
                </div>
              </Card>
            )}

            {tasks && tasks.length > 0 ? (
              <AccordionItem value="tasks" className="border border-[#2D2D2D] bg-[#202020] rounded-xl overflow-hidden px-0">
                <AccordionTrigger className="hover:no-underline font-bold text-sm text-white px-5 py-4 border-b border-[#2D2D2D]/60">
                  <span className="flex items-center gap-2">
                    <Kanban className="h-4 w-4 text-[#818CF8]" />
                    Generated Engineering Tasks ({tasks.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-5">
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg bg-[#252525] border border-[#2D2D2D] flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="text-xs font-bold text-[#E3E3E3]">{task.title}</div>
                          <p className="text-[10px] text-[#9B9B9B] max-w-md truncate">{task.description || "No description provided."}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[9px] uppercase font-bold",
                            task.status === "done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              task.status === "in_progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                "bg-zinc-800 text-zinc-400"
                          )}>
                            {task.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold bg-zinc-950 text-zinc-400">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link href={`/dashboard/tasks/${prd?.id}`}>
                      <Button variant="outline" size="sm" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium">
                        Open Board View &rarr;
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Card className="bg-[#202020] border-[#2D2D2D] p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Kanban className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs text-zinc-400 font-medium">No engineering tasks generated.</span>
                </div>
              </Card>
            )}
          </Accordion>

          {/* Review History Audit Log Timeline */}
          <Card className="bg-[#202020] border-[#2D2D2D]">
            <CardHeader className="pb-4 border-b border-[#2D2D2D]/60 flex flex-row items-center gap-2.5">
              <History className="h-4.5 w-4.5 text-[#818CF8]" />
              <div>
                <CardTitle className="text-sm font-bold text-white">Review Iteration History</CardTitle>
                <CardDescription className="text-xs text-[#9B9B9B]">Tracking review comments for each commit</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {!reviewHistory || !reviewHistory.history || reviewHistory.history.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-sm">
                  {isHistoryLoading ? "Loading review history..." : "No reviews recorded yet."}
                </div>
              ) : (
                <div className="space-y-6">
                  {reviewHistory.history.map((iter: any, idx: number) => {
                    const blockingCount = iter.issues.filter((i: any) => i.severity === "blocking").length;
                    const totalCount = iter.issues.length;

                    return (
                      <div key={iter.id} className="flex gap-4 items-start relative cursor-pointer" onClick={() => setSelectedReview(iter)}>
                        {idx !== reviewHistory.history.length - 1 && (
                          <div className="absolute top-8 bottom-0 left-4.5 w-0.5 bg-[#2D2D2D] -translate-x-1/2" />
                        )}
                        <div className={cn(
                          "h-9 w-9 rounded-full border shrink-0 flex items-center justify-center z-10 transition-colors",
                          iter.status === "ready-for-approval" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                        )}>
                          <FileCheck className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 space-y-1 bg-[#252525] p-4 rounded-xl border border-[#2D2D2D] hover:border-zinc-700 transition-colors">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-[#9B9B9B]">
                              Commit: {iter.commitSha?.slice(0, 7)}
                            </span>
                            <span className="text-[10px] text-[#9B9B9B]">
                              {new Date(iter.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-between">
                            <span>Review Run Details</span>
                            <Badge variant="outline" className={cn(
                              "text-[9px] font-bold px-2 py-0.5",
                              iter.status === "ready-for-approval" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}>
                              {iter.status === "ready-for-approval" ? "Ready for Approval" : "Fix Required"}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center justify-between flex-wrap gap-2 pt-0.5">
                            <span>Issues: {totalCount} total ({blockingCount} blocking)</span>
                            <span className="font-semibold text-indigo-400">Score: {iter.score}/100</span>
                          </div>
                          <div className="text-[10px] text-[#9B9B9B] space-y-0.5 mt-2 border-t border-[#2D2D2D]/60 pt-2">
                            <div>
                              <span className="font-semibold text-zinc-500">Pull Request:</span> #{iter.pullRequest?.prNumber} &middot; {iter.pullRequest?.title}
                            </div>
                            {iter.featureRequest && (
                              <div>
                                <span className="font-semibold text-zinc-500">Feature Request:</span> {iter.featureRequest?.title}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-[#E3E3E3] mt-2.5 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-[#2D2D2D]/60 truncate">
                            {iter.overallAssessment}
                          </p>
                          <div className="text-[10px] text-[#38BDF8] font-semibold pt-1 flex justify-end hover:underline">
                            Click to view full review &rarr;
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">

          {/* Linked Feature Request Card */}
          <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md">
            <CardHeader className="pb-3 border-b border-[#2D2D2D]/60 flex flex-row items-center gap-2.5">
              <Lightbulb className="h-4.5 w-4.5 text-[#38BDF8]" />
              <div>
                <CardTitle className="text-sm font-bold">Feature Link</CardTitle>
                <CardDescription className="text-[10px] text-[#9B9B9B]">Associated feature request context</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {featureRequest ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Feature Request</span>
                    <Link href={`/dashboard/feature-requests/${featureRequest.id}`} className="text-xs font-bold text-white hover:underline leading-relaxed block mt-0.5">
                      {featureRequest.title}
                    </Link>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Current Status</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase font-bold mt-1 px-2 py-0.5",
                      featureRequest.status === "ready-for-approval" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        featureRequest.status === "fix-needed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          featureRequest.status === "clarifying" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                            "bg-zinc-800 text-zinc-400"
                    )}>
                      {featureRequest.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Linked PRD</span>
                    {prd ? (
                      <Link href={`/dashboard/prds/${prd.id}`} className="text-xs font-semibold text-[#38BDF8] hover:underline block mt-0.5">
                        PRD ({prd.status})
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 block mt-0.5">No PRD generated</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Engineering Tasks</span>
                    <span className="text-xs font-semibold text-white block mt-0.5">
                      {tasks ? `${tasks.filter(t => t.status === "done").length} / ${tasks.length} Completed` : "0 / 0 Completed"}
                    </span>
                  </div>
                  <Link href={`/dashboard/feature-requests/${featureRequest.id}`}>
                    <Button size="sm" variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-semibold py-4 text-xs">
                      Open Feature Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#9B9B9B] leading-relaxed">
                    This pull request was not matched to any active feature request.
                  </p>
                  <Button disabled size="sm" variant="outline" className="w-full border-zinc-800 text-zinc-600 bg-zinc-900/50 text-xs">
                    No linked feature
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub Connection Details Card */}
          <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md">
            <CardHeader className="pb-3 border-b border-[#2D2D2D]/60 flex flex-row items-center gap-2.5">
              <GitPullRequest className="h-4.5 w-4.5 text-purple-400" />
              <div>
                <CardTitle className="text-sm font-bold">GitHub App Status</CardTitle>
                <CardDescription className="text-[10px] text-[#9B9B9B]">Repository and authorization details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Repository Owner</span>
                  <span className="text-xs font-semibold text-white block mt-0.5">{pr.repoOwner}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Repository Name</span>
                  <span className="text-xs font-semibold text-white block mt-0.5">{pr.repoName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Target Branch</span>
                  <span className="font-mono text-xs text-white bg-zinc-800/80 px-2 py-0.5 rounded inline-block mt-1 truncate max-w-full">
                    {pr.branch}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Latest Review Commit</span>
                  <span className="font-mono text-xs text-white bg-zinc-800/80 px-2 py-0.5 rounded inline-block mt-1 truncate max-w-full">
                    {pr.headSha.slice(0, 7)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wider block font-bold">Webhook Updates</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Listening for push webhooks
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for historical review details */}
      <Dialog open={selectedReview !== null} onOpenChange={(open) => { if (!open) setSelectedReview(null); }}>
        <DialogContent className="bg-[#1C1C1C] border-[#2D2D2D] text-[#E3E3E3] max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-[#818CF8]" />
              Review Run Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9B9B9B] font-mono">
              Commit: {selectedReview?.commitSha} &middot; Run: {selectedReview?.createdAt ? new Date(selectedReview.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6 pt-4">
              {/* Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#222] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                  <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Overall Status</span>
                  <div className={cn(
                    "text-sm font-bold mt-1.5 flex items-center gap-1.5",
                    selectedReview.status === "ready-for-approval" ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {selectedReview.status === "ready-for-approval" ? (
                      <>
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                        Ready for Approval
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                        Fix Required
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[#222] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                  <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Merge Readiness / Score</span>
                  <div className="text-sm font-extrabold text-white mt-1 flex items-baseline gap-1">
                    <span className="text-lg text-[#818CF8]">{selectedReview.score}%</span>
                    <span className="text-[10px] text-zinc-500">({selectedReview.score}/100)</span>
                  </div>
                </div>

                <div className="bg-[#222] p-4 rounded-xl border border-[#2D2D2D] flex flex-col justify-center">
                  <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Issue Counts</span>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20 px-1.5 py-0">
                      {selectedReview.issues?.filter((i: any) => i.severity === "blocking").length} Blocking
                    </Badge>
                    <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 py-0">
                      {selectedReview.issues?.filter((i: any) => i.severity !== "blocking").length} Suggestions
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Linked Context Card */}
              <div className="bg-[#222] p-4 rounded-xl border border-[#2D2D2D] space-y-2">
                <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider block">Linked Context</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 font-bold block">Pull Request</span>
                    <span className="text-white">#{selectedReview.pullRequest?.prNumber} &middot; {selectedReview.pullRequest?.title}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block">Feature Request</span>
                    {selectedReview.featureRequest ? (
                      <span className="text-white">{selectedReview.featureRequest.title}</span>
                    ) : (
                      <span className="text-zinc-500">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assessment Card */}
              <div className="bg-[#222] p-4 rounded-xl border border-[#2D2D2D] space-y-1">
                <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider">Overall Assessment</span>
                <p className="text-xs text-[#E3E3E3] leading-relaxed whitespace-pre-wrap">
                  {selectedReview.overallAssessment}
                </p>
              </div>

              {/* Issues List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-[#2D2D2D] pb-2">Findings ({selectedReview.issues?.length})</h4>
                {selectedReview.issues?.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    No issues detected in this review.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedReview.issues?.map((issue: any) => (
                      <div key={issue.id} className={cn(
                        "p-4 rounded-xl border space-y-3 text-xs",
                        issue.severity === "blocking" ? "border-rose-500/20 bg-rose-500/5" : "border-zinc-700 bg-zinc-800/10"
                      )}>
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-[8px] font-extrabold uppercase px-1.5 py-0",
                              issue.severity === "blocking" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                issue.severity === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                  issue.severity === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    issue.severity === "low" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}>
                              {issue.severity}
                            </Badge>
                            <span className="font-bold text-white text-xs">{issue.title}</span>
                          </div>
                          {issue.file && (
                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded break-all">
                              {issue.file}{issue.line ? `:${issue.line}` : ""}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Why It Matters</span>
                            <p className="text-zinc-300 mt-0.5 leading-relaxed">{issue.whyItMatters}</p>
                          </div>

                          {issue.suggestedFix && (
                            <div>
                              <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Suggested Fix</span>
                              <pre className="text-xs text-emerald-400 mt-0.5 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-[#2D2D2D]/60 font-mono whitespace-pre-wrap">
                                {issue.suggestedFix}
                              </pre>
                            </div>
                          )}

                          {issue.expectedResult && (
                            <div>
                              <span className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Expected Result</span>
                              <p className="text-zinc-300 mt-0.5 leading-relaxed">{issue.expectedResult}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
