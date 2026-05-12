import { CheckCircle2, Users, Target, Sparkles } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: Users,
      title: "친구와 공유",
      description: "목표를 커뮤니티와 공유하며 책임감을 유지하세요",
    },
    {
      icon: Target,
      title: "진행 상황 추적",
      description: "아름다운 진행 차트로 성과를 시각화하세요",
    },
    {
      icon: Sparkles,
      title: "동기부여 유지",
      description: "다른 사람들의 성취를 보며 영감을 얻으세요",
    },
  ]

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-sky-500/10" />
        
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ShareTodo</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight xl:text-5xl text-balance">
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              함께
            </span>
            {" 더 많이 성취하세요"}
          </h1>

          <p className="mb-12 text-lg text-muted-foreground max-w-md leading-relaxed">
            소셜 책임감으로 생산성을 혁신하세요. 목표를 공유하고, 
            성과를 축하하며, 커뮤니티와 함께 동기부여를 유지하세요.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/80 border border-border/50">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ShareTodo</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
