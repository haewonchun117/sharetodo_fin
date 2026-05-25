"use client";

import { useState, useEffect } from "react";
import { CircularProgress } from "@/components/circular-progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Plus,
  Bell,
  Settings,
  Heart,
  LogOut,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

// 🌟 데이터 구조 정의 개편
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface SharedTodo {
  id: number;
  userEmail: string;
  text: string;
  completed: boolean;
  // 필요시 추가 UI용 더미 데이터 매핑용
  avatar: string;
  daysStreak: number;
  tags: string[];
  likes: number;
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sharedTodos, setSharedTodos] = useState<SharedTodo[]>([]); // 🌟 다른 유저 데이터를 담을 공간 추가!
  const [newTodo, setNewTodo] = useState("");
  const [userEmail, setUserEmail] = useState("User");
  const [stats, setStats] = useState({
    achievementRate: 0,
    increaseRate: 0,
    completedCount: 0,
    maxStreak: 0,
    friendCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState([
    { week: "1주", rate: 0 },
    { week: "2주", rate: 0 },
    { week: "3주", rate: 0 },
    { week: "4주", rate: 0 },
    { week: "5주", rate: 0 },
  ]);

  // 1. 데이터 불러오기 개편
  useEffect(() => {
    const getInitialData = async () => {
      // 현재 로그인한 유저 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return; // 로그인 상태가 아니라면 데이터 호출 중단

      if (user.email) {
        setUserEmail(user.email.split("@")[0]);
      }

      // 🔒 [A] 내 할 일만 가져오기
      const { data: myData, error: myError } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id) // 🌟 내 유저 아이디 계정 정보만 필터링!
        .order("id", { ascending: true });

      if (!myError && myData) {
        const formattedTodos = myData.map((t) => ({
          id: t.id,
          text: t.content,
          completed: t.is_completed,
        }));
        setTodos(formattedTodos);
      }

      // 🌍 [B] 비슷한 관심사 (다른 사람들의 할 일 피드) 가져오기
      const { data: globalData, error: globalError } = await supabase
        .from("todos")
        .select("*")
        .neq("user_id", user.id) // 🌟 내가 아닌 다른 유저들의 글 정보만 필터링!
        .limit(10); // 개수 제한

      if (!globalError && globalData) {
        const formattedShared = globalData.map((t) => ({
          id: t.id,
          userEmail: "유저", // 데이터베이스에 작성자 정보가 있다면 매핑 가능
          text: t.content,
          completed: t.is_completed,
          avatar: "U",
          daysStreak: Math.floor(Math.random() * 5) + 1, // 테스트용 임시 랜덤 스트릭
          tags: ["공부", "일상"], // 테스트용 임시 태그
          likes: Math.floor(Math.random() * 10),
        }));
        setSharedTodos(formattedShared); // 🌟 상태에 할당!
      }
    };

    getInitialData();
  }, []);

  // 2. 내 통계 계산 로직 (기존 유지)
  useEffect(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats((prev) => ({
      ...prev,
      achievementRate: rate,
      completedCount: completed,
    }));

    setWeeklyData((prev) =>
      prev.map((d, i) => (i === prev.length - 1 ? { ...d, rate: rate } : d)),
    );
  }, [todos]);

  // 3. 내 할 일 추가하기 수정
  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return alert("로그인이 필요합니다.");

        const { data, error } = await supabase
          .from("todos")
          .insert([
            {
              content: newTodo,
              is_completed: false,
              user_id: user.id, // 🌟 저장할 때 '내 ID'를 함께 명시해 주어야 나중에 내 것만 뽑아올 수 있습니다.
            },
          ])
          .select();

        if (error) {
          console.error("Supabase 저장 에러:", error.message);
          return;
        }

        if (data) {
          setTodos([
            ...todos,
            {
              id: data[0].id,
              text: data[0].content,
              completed: data[0].is_completed,
            },
          ]);
          setNewTodo("");
        }
      } catch (err) {
        console.error("오류 발생:", err);
      }
    }
  };

  const toggleTodo = async (id: number) => {
    const todoToUpdate = todos.find((t) => t.id === id);
    if (!todoToUpdate) return;

    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !todoToUpdate.completed })
      .eq("id", id);

    if (!error) {
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ShareTodo</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-9 w-9 ml-2">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {userEmail}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">이번 달 진행률</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <CircularProgress
                value={progressPercent}
                label="완료"
                sublabel={`${totalCount}개 중 ${completedCount}개`}
              />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">월간 리뷰</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  이번 달 목표 달성률이{" "}
                  <span className="text-primary font-semibold">
                    {stats.achievementRate}%
                  </span>{" "}
                  로 지난달 대비{" "}
                  <span className="text-sky-500 font-semibold">
                    {stats.increaseRate}% 상승
                  </span>{" "}
                  했어요!
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-primary">
                      {stats.completedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      완료한 할 일
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-sky-500">
                      {stats.maxStreak}
                    </p>
                    <p className="text-xs text-muted-foreground">최대 연속</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-amber-500">
                      {stats.friendCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      함께하는 친구
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Feed + My Todos */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* 🌍 Left: Shared Feed (하드코딩 배열 대신 sharedTodos 매핑) */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2 max-h-[500px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg">비슷한 관심사의 할 일</CardTitle>
              <p className="text-sm text-muted-foreground">
                다른 사람들의 목표를 내 목록에 추가해보세요
              </p>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <div className="space-y-3">
                {sharedTodos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    공유된 할 일이 없습니다.
                  </p>
                ) : (
                  sharedTodos.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-background/50 hover:border-primary/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {item.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {item.userEmail}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.daysStreak}일 연속
                          </span>
                        </div>
                        <p className="font-medium truncate">{item.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            <Heart className="h-3 w-3" />
                            {item.likes}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1 border-border/50 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <Plus className="h-3 w-3" />
                        추가
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔒 Right: My Todo List */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-h-[500px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg">내 할 일</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 overflow-hidden flex-1">
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="새 할 일 입력..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="bg-background/50 border-border/50"
                />
                <Button
                  size="icon"
                  onClick={addTodo}
                  className="shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 transition-all ${
                      todo.completed ? "opacity-60" : ""
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border/50 shrink-0">
                <p className="text-sm text-muted-foreground text-center">
                  {completedCount}/{totalCount} 완료 ({progressPercent}%)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Weekly Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              최근 10주 달성률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`, "달성률"]}
                  />
                  <Bar
                    dataKey="rate"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
