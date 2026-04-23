import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-24 max-w-7xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Team Activity Hub
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight font-heading">
              Build Teams.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Play Together.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Instantly generate balanced teams, run timers, and track scores -
              all in one sleek dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/teams"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="20"
                  height="20"
                >
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Generate Teams
              </Link>
              <Link
                href="/scoreboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors border border-border"
              >
                View Scoreboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="32"
                height="32"
                className="text-primary"
              >
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="7" r="4" />
                <path
                  d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Smart Team Generator"
            desc="Shuffle & distribute players into balanced teams instantly. Supports fixed number of teams or fixed team size."
            link="/teams"
            linkLabel="Generate ->"
          />
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="32"
                height="32"
                className="text-accent"
              >
                <polyline
                  points="22 12 18 12 15 21 9 3 6 12 2 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Live Scoreboard"
            desc="Track each team's score in real-time with intuitive +/- controls and direct editable inputs."
            link="/scoreboard"
            linkLabel="View Scores ->"
          />
        </div>
      </section>

      {/* Players preview */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold font-heading">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              18 Players
            </span>{" "}
            Ready to Compete
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Head over to Team Generator to randomly split them into action.
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-12 py-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl text-lg"
          >
            Shuffle & Generate Teams
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link: string;
  linkLabel: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  desc,
  link,
  linkLabel,
}) => {
  return (
    <Link
      href={link}
      className="group relative block p-8 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-4 font-heading">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{desc}</p>
      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
        {linkLabel}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

export default HomePage;
