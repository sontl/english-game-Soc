import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import AnimatedBackdrop from "./AnimatedBackdrop";
import { useAppStore } from "../store/appStore";

const navItems = [
  { path: "/", label: "Play" },
  { path: "/admin", label: "Admin" }
];

const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { dyslexiaMode } = useAppStore();

  return (
    <div
      className={
        "relative flex min-h-screen flex-col overflow-hidden " +
        (dyslexiaMode ? "font-dyslexic" : "font-fun")
      }
    >
      <AnimatedBackdrop />
      <header className="relative z-10 mx-auto mt-6 w-[94%] max-w-6xl rounded-3xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-5 text-white shadow-xl shadow-primary/30 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold drop-shadow-sm md:text-4xl">English Garden</h1>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80 md:text-xs">
              Grow words • Spark joy • Play together
            </p>
          </div>
          <nav className="flex items-center gap-3 text-base md:text-lg">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full px-5 py-2 font-semibold shadow-sm transition-all duration-300 ${
                    isActive
                      ? "bg-white text-primary drop-shadow-bubbly"
                      : "bg-white/20 text-white hover:bg-white/30 hover:drop-shadow-glow"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto mt-6 w-[94%] max-w-6xl flex-1 px-2 pb-16 sm:px-4">
        {children}
      </main>
      <footer className="relative z-10 mx-auto mb-6 w-[92%] max-w-5xl rounded-3xl bg-white/80 px-6 py-4 text-center text-sm font-semibold text-slate-600 shadow-lg shadow-secondary/40 backdrop-blur">
        © {new Date().getFullYear()} English Garden · Let&apos;s learn with a smile!
      </footer>
    </div>
  );
};

export default Layout;
