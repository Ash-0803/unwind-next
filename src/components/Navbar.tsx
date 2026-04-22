import React from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/"
            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
          >
            <div className="w-8 h-8">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <polygon
                  points="16,2 30,12 25,28 7,28 2,12"
                  fill="url(#brand-grad)"
                  opacity="0.9"
                />
                <defs>
                  <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <polyline
                  points="10,17 14,21 22,13"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Unwind</span>
          </NavLink>

          <div className="flex items-center gap-6">
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
              >
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="7" r="4" />
                <path
                  d="M23 21v-2a4 4 0 0 0-3-3.87"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13a4 4 0 0 1 0 7.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Teams
            </NavLink>
            <NavLink
              to="/scoreboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
              >
                <polyline
                  points="22 12 18 12 15 21 9 3 6 12 2 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Scoreboard
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
