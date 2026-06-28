"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Pencil, Trash2 } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { RotatingLoader } from "~/components/rotating-loader";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
};

const statusColumns: Array<{
  status: TaskStatus;
  label: string;
}> = [
  { status: "todo", label: "Todo" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

function priorityClass(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
}

function BoardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <div className="h-5 w-3/5 animate-pulse rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-9 w-36 animate-pulse rounded-lg bg-zinc-800" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {statusColumns.map((column) => (
          <div key={column.status} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-800" />
              <div className="h-5 w-8 animate-pulse rounded-full bg-zinc-800" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-40 animate-pulse rounded-xl bg-zinc-900" />
              <div className="h-40 animate-pulse rounded-xl bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-6 shadow-sm">
        <RotatingLoader
          messages={[
            "Generating tasks from your PRD...",
            "Breaking down requirements into tickets...",
            "Estimating task priority...",
            "Creating action items for development...",
            "Finalizing implementation task board..."
          ]}
        />
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onMove,
  onDelete,
  onSave,
}: {
  task: Task;
  onMove: (status: TaskStatus) => void;
  onDelete: () => void;
  onSave: (input: { title: string; description: string; priority: TaskPriority }) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
  }, [task.description, task.priority, task.title]);

  const handleSave = () => {
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    setIsEditing(false);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <CardHeader className="border-b border-zinc-800/80 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
                <Badge variant="outline" className={priorityClass(priority)}>
                  {priority}
                </Badge>
              </div>
            ) : (
              <>
                <div className="text-sm font-semibold text-white">{task.title}</div>
                <Badge variant="outline" className={`mt-2 ${priorityClass(task.priority)}`}>
                  {task.priority}
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSave}
                  className="h-8 w-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(task.title);
                    setDescription(task.description ?? "");
                    setPriority(task.priority);
                  }}
                  className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDelete}
                  className="h-8 w-8 text-zinc-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {isEditing ? (
          <>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600"
              placeholder="Task description"
            />
            <div className="flex flex-wrap gap-2">
              {(["low", "medium", "high"] as TaskPriority[]).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={priority === value ? "default" : "outline"}
                  onClick={() => setPriority(value)}
                  className={
                    priority === value
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                  setPriority(task.priority);
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200">
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-zinc-400">
              {task.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-2">
              {statusColumns
                .filter((column) => column.status !== task.status)
                .map((column) => (
                  <Button
                    key={column.status}
                    size="sm"
                    variant="outline"
                    onClick={() => onMove(column.status)}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Move to {column.label}
                  </Button>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TasksPage({ params }: { params: Promise<{ prdId: string }> }) {
  const { prdId } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: tasks, isLoading, error } = trpc.tasks.getByPrd.useQuery(
    { prdId },
    {
      refetchInterval: (query) => (query.state.data?.length ? false : 3000),
    }
  );



  const moveTask = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => utils.tasks.getByPrd.invalidate({ prdId }),
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => utils.tasks.getByPrd.invalidate({ prdId }),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => utils.tasks.getByPrd.invalidate({ prdId }),
  });

  const groupedTasks = useMemo(() => {
    const items = tasks ?? [];
    return {
      todo: items.filter((task) => task.status === "todo"),
      in_progress: items.filter((task) => task.status === "in_progress"),
      done: items.filter((task) => task.status === "done"),
    } satisfies Record<TaskStatus, Task[]>;
  }, [tasks]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8 text-white">
        <div className="rounded-2xl border border-red-900 bg-red-950/20 px-6 py-4 shadow-sm text-center">
          <p className="text-red-400">Error loading tasks: {error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading && !tasks) {
    return <BoardSkeleton />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-200">
                AI generated {tasks.length} tasks from your PRD. Review and approve before development starts.
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Move work across the board, edit details, or remove tasks that do not belong.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/pull-requests")}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Approve Plan
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {statusColumns.map((column) => (
            <section
              key={column.status}
              className="flex min-h-[32rem] flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
                  {column.label}
                </h2>
                <Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300">
                  {groupedTasks[column.status].length}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {groupedTasks[column.status].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
                    No tasks here yet.
                  </div>
                ) : (
                  groupedTasks[column.status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={(status) => moveTask.mutate({ id: task.id, status })}
                      onDelete={() => deleteTask.mutate({ id: task.id })}
                      onSave={(input) =>
                        updateTask.mutate({
                          id: task.id,
                          title: input.title,
                          description: input.description,
                          priority: input.priority,
                        })
                      }
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
