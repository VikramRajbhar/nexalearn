import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Zap, Activity, Users, Terminal, Swords, Trophy, Radio } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base relative overflow-hidden page-enter">
      {/* Decorative Grid Background - Purple/Green Dots */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2A2A3F_1px,transparent_1px),linear-gradient(to_bottom,#2A2A3F_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-base/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary text-text-primary font-bold text-xl">
              N
            </div>
            <span className="font-grotesk font-bold text-xl text-text-primary tracking-tight">NexaLearn</span>
          </div>
          <nav>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10">
        {/* Terminal Status Bar */}
        <div className="inline-flex items-center space-x-2 bg-bg-surface-2 px-4 py-2 rounded-full border border-accent-primary/30 mb-8">
          <Terminal className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-mono text-accent-primary font-bold tracking-widest uppercase">System Online // PvP Engine Active</span>
          <span className="flex h-2 w-2 rounded-full bg-accent-primary animate-pulse"></span>
        </div>

        {/* HUD Corners */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-accent-primary/50 rounded-tl-lg"></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-accent-primary/50 rounded-tr-lg"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-accent-primary/50 rounded-bl-lg"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-accent-primary/50 rounded-br-lg"></div>

          <h1 className="text-5xl md:text-7xl font-bold font-grotesk tracking-tight text-white max-w-4xl leading-tight">
            Battle Your Way to <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-accent-green inline-block relative">
              Mastery
            </span>
          </h1>
        </div>

        <p className="mt-8 text-xl text-text-secondary max-w-2xl">
          The real-time 1v1 CS battle platform for Computer Science students. Sharpen your skills, climb the leaderboard, and dominate.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 relative">
          <Link href="/signup">
            {/* Esports Heavy CTA */}
            <Button size="lg" className="text-lg px-8 h-14 font-black uppercase tracking-wider shadow-[0_0_20px_rgba(108,99,255,0.4)] hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] border-2 border-accent-primary">
              <Swords className="mr-2 h-5 w-5" /> Start Battling
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
          <Card highlighted className="group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="h-24 w-24 text-accent-primary" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-10 w-10 text-accent-primary" />
                <div className="flex items-center space-x-1 bg-accent-red/10 px-2 py-1 rounded text-accent-red text-xs font-bold font-mono">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>LIVE MATCHES</span>
                </div>
              </div>
              <CardTitle>Real-time Battles</CardTitle>
              <CardDescription>Challenge peers to intense 1v1 coding and CS theory showdowns in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mini-ticker for Real-Time Context */}
              <div className="bg-bg-surface-2 rounded-md p-3 text-xs font-mono border border-border-default mt-2">
                <div className="flex justify-between items-center text-text-secondary mb-1">
                  <span>Match #8492</span>
                  <span className="text-accent-primary animate-pulse uppercase tracking-wider text-[10px]">In Progress</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text-primary">Priya_CS</span>
                  <Swords className="h-3 w-3 text-text-secondary" />
                  <span className="text-text-primary">Rahul_99</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card highlighted className="group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="h-24 w-24 text-accent-primary" />
            </div>
            <CardHeader>
              <Activity className="h-10 w-10 text-accent-primary mb-4" />
              <CardTitle>Skill Tracking</CardTitle>
              <CardDescription>Watch your rank grow with advanced analytics across DSA, Databases, and Core CS.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-16 mt-2 pb-2">
                <div className="w-1/5 bg-accent-primary/20 hover:bg-accent-primary/40 rounded-t-sm h-[40%] transition-colors"></div>
                <div className="w-1/5 bg-accent-primary/40 hover:bg-accent-primary/60 rounded-t-sm h-[60%] transition-colors"></div>
                <div className="w-1/5 bg-accent-primary/60 hover:bg-accent-primary/80 rounded-t-sm h-[75%] transition-colors"></div>
                <div className="w-1/5 bg-accent-primary/80 hover:bg-accent-primary rounded-t-sm h-[90%] transition-colors"></div>
                <div className="w-1/5 bg-accent-primary rounded-t-sm h-[100%] shadow-[0_-4px_10px_rgba(108,99,255,0.3)]"></div>
              </div>
            </CardContent>
          </Card>

          <Card highlighted className="group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="h-24 w-24 text-accent-primary" />
            </div>
            <CardHeader>
              <Users className="h-10 w-10 text-accent-primary mb-4" />
              <CardTitle>Guild System</CardTitle>
              <CardDescription>Join forces. Build a guild, conquer rivals, and claim the top spot on campus.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <Button variant="secondary" className="w-full text-xs h-9 border-dashed font-mono tracking-widest uppercase">
                  [+] Find Clan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Leaderboard Preview */}
        <div className="mt-28 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl text-left">

          {/* Terminal Stats Box */}
          <div className="lg:col-span-2 rounded-2xl bg-bg-surface-2 border border-accent-primary/30 p-8 flex flex-col justify-center relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/20">
              <div className="h-1 bg-accent-primary w-1/3 animate-shimmer"></div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10 w-full">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-accent-primary font-grotesk drop-shadow-[0_0_10px_rgba(108,99,255,0.5)]">500+</span>
                <span className="text-text-secondary font-mono text-sm tracking-widest mt-2 uppercase">Curated Qs</span>
              </div>
              <div className="hidden md:block w-px h-16 bg-accent-primary/20"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-accent-primary font-grotesk drop-shadow-[0_0_10px_rgba(108,99,255,0.5)]">10+</span>
                <span className="text-text-secondary font-mono text-sm tracking-widest mt-2 uppercase">CS Topics</span>
              </div>
              <div className="hidden md:block w-px h-16 bg-accent-primary/20"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-accent-primary font-grotesk drop-shadow-[0_0_10px_rgba(108,99,255,0.5)] flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent-red animate-pulse mr-1"></span> Live
                </span>
                <span className="text-text-secondary font-mono text-sm tracking-widest mt-2 uppercase">Battles Active</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <Card className="bg-bg-surface/50 backdrop-blur-sm border-accent-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 font-mono uppercase tracking-widest text-lg">
                <Trophy className="h-5 w-5 text-accent-gold" /> Top Commandos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3 mt-4">
                {[
                  { name: "0xKunal", rank: "Diamond", elo: "2450", color: "text-league-diamond" },
                  { name: "Anita_M", rank: "Platinum", elo: "2120", color: "text-league-platinum" },
                  { name: "Dev_Demon", rank: "Gold", elo: "1890", color: "text-league-gold" },
                ].map((player, i) => (
                  <div key={i} className="flex items-center justify-between bg-bg-surface-3 rounded-lg p-2 border border-border-default">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-muted font-bold text-xs w-3">{i + 1}.</span>
                      <Avatar size="sm" fallback={player.name.substring(0, 2).toUpperCase()} isOnline={i === 0} />
                      <span className="font-bold text-sm text-text-primary">{player.name}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold ${player.color}`}>{player.elo}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs font-mono uppercase tracking-widest border border-dashed border-border-default hover:border-accent-primary hover:bg-accent-primary/5">
                View Full Ladder
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-border-subtle bg-bg-surface relative z-10">
        <p className="text-text-secondary text-sm font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} NexaLearn // CS Combat Engine
        </p>
      </footer>
    </div>
  );
}
