"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="relative flex-grow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-sky-500/5" />
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10">
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

          {/* Hero Content - 센터 정렬 및 크기 확대 */}
          <div className="mx-auto max-w-7xl px-4 py-100 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              {/* 제목 크기 대폭 확대 */}
              <h1 className="max-w-4xl text-9xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-balance leading-tight">
                <span className="text-primary">함께</span> 더 많이 성취하세요
              </h1>

              {/* 설명 문구 크기 및 여백 조정 */}
              <p className="mt-8 max-w-2xl text-3xl text-muted-foreground leading-relaxed">
                ShareTodo를 이용해 생산성을 높이세요. <br />
                목표를 공유하고, 함께 진행 상황을 추적하며, 친구들과 함께
                성장하세요.
              </p>

              {/* 시작하기 버튼 크기 및 그림자 효과 추가 */}
              <div className="mt-10">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg shadow-lg hover:scale-105 transition-transform"
                  >
                    지금 시작하기
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
