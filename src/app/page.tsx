import { PlaygroundDemo } from "@/playground/PlaygroundDemo";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <PlaygroundDemo />
    </main>
  );
}
