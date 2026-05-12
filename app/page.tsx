"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, ArrowRight, Heart, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const interestTags = [
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

const sharedTodos = [];

export default function HomePage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredTodos =
    selectedTags.length > 0
      ? sharedTodos.filter((todo) =>
          todo.tags.some((tag) => selectedTags.includes(tag)),
        )
      : sharedTodos;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-sky-500/5" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ShareTodo</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-foreground/80 hover:text-foreground"
                >
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  시작하기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="text-center">
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                <span className="text-primary">함께</span> 더 많이 성취하세요
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                ShareTodo를 이용해 생산성을 높이세요. 목표를 공유하고, 함께 진행
                상황을 추적하며, 친구들과 함께 성장하세요.
              </p>

              <div className="mt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                  >
                    시작하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Tags Section */}
      <div className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              관심 분야를 선택하세요
            </h2>
            <p className="mt-2 text-muted-foreground">
              관심 있는 태그를 선택하면 관련 할 일을 볼 수 있어요
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {interestTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "border-border/50 hover:border-primary/50 hover:bg-primary/10"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Todos Section */}
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              공유된 할 일
            </h2>
            <p className="mt-2 text-muted-foreground">
              다른 사람들의 목표를 살펴보고 영감을 받으세요
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {todo.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{todo.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {todo.daysStreak}일 연속
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <h3 className="font-semibold mb-3">{todo.title}</h3>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {todo.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-secondary/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {todo.likes}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 gap-1 border-border/50 hover:bg-primary/10 hover:border-primary/50"
                  >
                    <Plus className="h-3 w-3" />내 목록에 추가
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTodos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              선택한 태그에 해당하는 할 일이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ShareTodo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 ShareTodo. by 천혜원, 김해원
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
