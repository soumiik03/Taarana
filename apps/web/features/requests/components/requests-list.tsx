"use client";

import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { MessageSquarePlus, ArrowRight, Clock } from "lucide-react";

export function FeatureRequestsList({ organizationId }: { organizationId: string }) {
  const { data: requests, isLoading } = trpc.featureRequests.getByOrg.useQuery({
    organizationId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "clarifying":
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
      case "rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      default:
        return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-10 bg-zinc-800 rounded w-32"></div>
        </div>
        <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Feature Requests</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your workspace requests and view AI generated clarification questions.
          </p>
        </div>
        <Link href="/dashboard/feature-requests/new" passHref>
          <Button className="bg-white text-black hover:bg-zinc-200 font-semibold flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-semibold text-white">No feature requests yet</h3>
          <p className="text-zinc-500 text-sm mt-1 mb-6">
            Create your first feature request to start gathering clarification context.
          </p>
          <Link href="/dashboard/feature-requests/new" passHref>
            <Button className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-white font-medium">
              Create Feature Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-zinc-950 border-b border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-zinc-400 font-semibold py-4 pl-6">Title</TableHead>
                <TableHead className="text-zinc-400 font-semibold py-4">Status</TableHead>
                <TableHead className="text-zinc-400 font-semibold py-4">Source</TableHead>
                <TableHead className="text-zinc-400 font-semibold py-4">Created At</TableHead>
                <TableHead className="text-zinc-400 font-semibold py-4 text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                  <TableCell className="font-semibold text-white py-4 pl-6">
                    {req.title}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="text-zinc-400 capitalize bg-zinc-900/60 border-zinc-800">
                      {req.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400 py-4">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '—'}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <Link href={`/dashboard/feature-requests/${req.id}`} passHref>
                      <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center gap-1.5 font-medium">
                        View Chat
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
