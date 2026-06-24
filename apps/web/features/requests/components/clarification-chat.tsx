"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";

export function ClarificationChat({ featureRequestId }: { featureRequestId: string }) {
  const [answerInput, setAnswerInput] = useState("");
  
  const utils = trpc.useUtils();
  
  const { data: questions, isLoading } = trpc.featureRequests.getQuestions.useQuery({
    featureRequestId,
  });

  const submitAnswer = trpc.featureRequests.submitAnswer.useMutation({
    onSuccess: () => {
      setAnswerInput("");
      utils.featureRequests.getQuestions.invalidate({ featureRequestId });
      utils.featureRequests.getById.invalidate({ id: featureRequestId });
    },
  });

  if (isLoading) {
    return <div className="text-zinc-500 animate-pulse text-sm">Loading clarification context...</div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-sm text-zinc-500 italic">
        No clarification questions generated yet. We are analyzing the request...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">AI Clarifications</h3>
      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
          const isPending = q.status === "pending";
          const isCurrent = idx === questions.findIndex(qt => qt.status === "pending");

          return (
            <div
              key={q.id}
              className={`flex flex-col gap-3 rounded-xl border p-5 transition-all duration-300 ease-in-out ${
                isCurrent
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                  : isPending
                  ? "border-zinc-800/50 bg-zinc-950/50 opacity-50"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isPending && !isCurrent ? "bg-zinc-800 text-zinc-500" : isCurrent ? "bg-indigo-500 text-white" : "bg-zinc-700 text-zinc-300"
                }`}>
                  {idx + 1}
                </div>
                <p className={`text-sm leading-relaxed ${isCurrent ? "text-indigo-100" : "text-zinc-300"}`}>
                  {q.question}
                </p>
              </div>

              {q.status === "answered" ? (
                <div className="ml-9 mt-2 flex items-start gap-3 rounded-lg bg-black/40 p-3 border border-zinc-800/50">
                  <span className="mt-0.5 text-xs font-semibold text-emerald-500">You:</span>
                  <p className="text-sm text-zinc-300">{q.answer}</p>
                </div>
              ) : isCurrent ? (
                <div className="ml-9 mt-3 flex flex-col gap-3">
                  <textarea
                    className="w-full rounded-lg border border-indigo-500/30 bg-black/50 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:bg-black transition-all resize-none"
                    placeholder="Type your answer here..."
                    rows={2}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-indigo-500 text-white hover:bg-indigo-600"
                      disabled={!answerInput.trim() || submitAnswer.isPending}
                      onClick={() =>
                        submitAnswer.mutate({ questionId: q.id, answer: answerInput })
                      }
                    >
                      {submitAnswer.isPending ? "Submitting..." : "Submit Answer"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
