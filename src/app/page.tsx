export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      
      {/* A themed card using your custom colors */}
      <div className="p-8 border rounded-xl bg-card border-border shadow-lg">
        
        {/* Main text using 'foreground' */}
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to <span className="text-primary">ALYMERA</span>
        </h1>
        
        {/* Subtitle using 'muted-foreground' */}
        <p className="mt-4 text-xl text-muted-foreground">
          A techy, purple-themed platform.
        </p>
        
        <div className="flex gap-4 mt-8">
          {/* A button using the bright 'primary' background and 'primary-foreground' text */}
          <button className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
            Get Started
          </button>
          
          {/* A secondary button using the 'secondary' background */}
          <button className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-medium hover:opacity-90">
            Learn More
          </button>
        </div>

      </div>
    </main>
  );
}