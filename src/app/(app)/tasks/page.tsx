import { createClient } from "@/lib/supabase/server";
import { createTask } from "@/app/(app)/tasks/actions";
import { TaskCheckbox } from "@/components/tasks/task-checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/supabase/types";

const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "低", medium: "中", high: "高" };
const PRIORITY_VARIANT: Record<TaskPriority, "default" | "warning" | "destructive"> = {
  low: "default",
  medium: "warning",
  high: "destructive",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("is_done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <h1 className="text-xl font-semibold">タスク管理</h1>
          <p className="text-sm text-muted-foreground">商談・顧客に紐づくタスクの一覧</p>
        </div>

        <div className="space-y-2">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-border p-3",
                  task.is_done && "opacity-50"
                )}
              >
                <TaskCheckbox id={task.id} isDone={task.is_done} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", task.is_done && "line-through")}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">期限: {formatDate(task.due_date)}</p>
                  )}
                </div>
                <Badge variant={PRIORITY_VARIANT[task.priority as TaskPriority]}>
                  {PRIORITY_LABEL[task.priority as TaskPriority]}
                </Badge>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              タスクがまだありません。
            </p>
          )}
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">タスクを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">タイトル *</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">優先度</Label>
              <Select id="priority" name="priority" defaultValue="medium">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">期限</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              追加する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
