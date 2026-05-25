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

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
}

interface SharedTodo {
  id: number;
  userEmail: string;
  text: string;
  completed: boolean;
  avatar: string;
  daysStreak: number;
  tags: string[];
  likes: number;
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sharedTodos, setSharedTodos] = useState<SharedTodo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // 👈 선택된 해시태그 상태
  const [userEmail, setUserEmail] = useState("User");
  const [userInterest, setUserInterest] = useState<string>("");

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

  const tagsList = [
    "공부",
    "운동",
    "개발",
    "영어",
    "독서",
    "다이어트",
    "자격증",
    "습관",
    "명상",
    "글쓰기",
  ];

  // 1. 내 기본 정보 및 내 할 일 초기 로드 (페이지 처음 켜질 때 1번만 실행)
  const fetchMyData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (user.email) {
      setUserEmail(user.email.split("@")[0]);
    }

    // [A] 내 할 일 가져오기
    const { data: myData, error: myError } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    if (!myError && myData) {
      const formattedTodos = myData.map((t) => ({
        id: t.id,
        text: t.content,
        completed: t.is_completed,
        category: t.category || "기타",
      }));
      setTodos(formattedTodos);
    }

    // [B] 내 프로필 가입 당시 관심사 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("interest")
      .eq("id", user.id)
      .single();

    if (!profileError && profileData?.interest) {
      setUserInterest(profileData.interest);
      // 🔥 처음 진입 시에는 프로필 관심사를 기본 선택 태그로 지정해 줍니다!
      setSelectedTag(profileData.interest);
    }
  };

  // 2. 🌟 [핵심 변경] 선택된 태그(selectedTag)가 바뀔 때마다 실시간으로 왼쪽 피드를 갱신하는 함수
  const fetchSharedFeed = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let globalQuery = supabase
      .from("todos")
      .select("*")
      .neq("user_id", user.id); // 내 할 일은 제외

    // 💡 선택한 태그가 있으면 그 태그로 Supabase 검색, 없으면 전체 검색
    if (selectedTag) {
      globalQuery = globalQuery.eq("category", selectedTag);
    }

    const { data: globalData, error: globalError } = await globalQuery
      .order("id", { descending: true })
      .limit(10);

    if (!globalError && globalData) {
      const formattedShared = globalData.map((t) => ({
        id: t.id,
        userEmail: t.user_email ? t.user_email.split("@")[0] : "유저",
        text: t.content,
        completed: t.is_completed,
        avatar: t.user_email ? t.user_email[0].toUpperCase() : "U",
        daysStreak: Math.floor(Math.random() * 5) + 1,
        tags: t.category ? [t.category] : ["기타"],
        likes: Math.floor(Math.random() * 10),
      }));
      setSharedTodos(formattedShared);
    } else {
      setSharedTodos([]);
    }
  };

  // 컴포넌트 마운트 시 내 데이터 최초 로드
  useEffect(() => {
    fetchMyData();
  }, []);

  // 🔥 selectedTag 상태가 변경될 때마다 자동으로 실행되어 왼쪽 피드를 바꿉니다!
  useEffect(() => {
    fetchSharedFeed();
  }, [selectedTag]);

  // 3. 통계 계산 로직
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

  // 4. 내 할 일 추가하기 함수
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    if (!selectedTag) {
      alert("이 할 일의 관심사 태그를 먼저 선택해 주세요!");
      return;
    }

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
            user_id: user.id,
            category: selectedTag,
            user_email: user.email,
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
            category: data[0].category || "기타",
          },
        ]);
        setNewTodo("");
        // 할 일 추가 후 피드 리로드
        fetchSharedFeed();
      }
    } catch (err) {
      console.error("오류 발생:", err);
    }
  };

  // 5. 내 할 일 완료 상태 토글
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

  // 6. 내 할 일 삭제하기 함수
  const deleteTodo = async (id: number) => {
    if (!confirm("이 할 일을 정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.error("Supabase 삭제 에러:", error.message);
        return;
      }

      setTodos(todos.filter((t) => t.id !== id));
      fetchSharedFeed();
    } catch (err) {
      console.error("삭제 중 오류 발생:", err);
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
          {/* 🌍 Left: Shared Feed (★ 선택한 태그에 따라 타이틀과 내용이 유동적으로 변화!) */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2 max-h-[500px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                🔥{" "}
                {selectedTag
                  ? `'#${selectedTag}' 분야를 목표로 달리는 유저들`
                  : "실시간 유저들의 할 일 피드"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedTag
                  ? `나와 똑같이 '${selectedTag}' 카테고리를 선택한 유저들의 실시간 리스트입니다.`
                  : "선택된 태그가 없습니다. 하단에서 관심사 태그를 선택해 보세요!"}
              </p>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <div className="space-y-3">
                {sharedTodos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    {selectedTag
                      ? `아직 "#${selectedTag}" 카테고리에 등록된 다른 유저의 할 일이 없습니다.`
                      : "공유된 할 일이 없습니다."}
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
                              className="text-xs bg-blue-500/10 text-blue-500 border-none"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        git
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔒 Right: My Todo List */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-h-[500px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg">내 할 일 목록</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 overflow-hidden flex-1">
              <div className="shrink-0">
                <div className="flex gap-2">
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

                {/* 해시태그 선택 영역 (★ 누르면 왼쪽 피드 쿼리도 자동 갱신됨) */}
                <div className="flex flex-wrap gap-1 mt-2.5 max-h-[65px] overflow-y-auto py-0.5">
                  {tagsList.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                            : "bg-secondary/40 text-muted-foreground border-border/60 hover:bg-secondary"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 내 할 일 리스트 (해시태그 배지 + 텍스트 정렬) */}
              <div className="space-y-2 overflow-y-auto flex-1">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:border-primary/20 cursor-pointer transition-all w-full ${
                      todo.completed ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-none shrink-0 font-semibold"
                      >
                        #{todo.category}
                      </Badge>
                      <span
                        className={`text-sm font-medium truncate ${
                          todo.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      ✕
                    </Button>
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
