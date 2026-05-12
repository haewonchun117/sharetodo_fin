"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Flame } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  sharedWith: number;
  streak?: number;
  dueTime?: string;
}

const initialTasks: Task[] = [];

const priorityColors = {
  low: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const priorityLabels = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:bg-card/80 ${
            task.completed ? "opacity-60" : ""
          }`}
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />

          <div className="flex-1 min-w-0">
            <p
              className={`font-medium truncate ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {task.streak && (
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-3 w-3" />
                  {task.streak}일 연속
                </span>
              )}
              {task.dueTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`text-xs ${priorityColors[task.priority]}`}
            >
              {priorityLabels[task.priority]}
            </Badge>

            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(task.sharedWith, 3) }).map(
                  (_, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-card">
                      <AvatarFallback className="text-xs bg-secondary">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ),
                )}
              </div>
              {task.sharedWith > 3 && (
                <span className="text-xs ml-1">+{task.sharedWith - 3}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
