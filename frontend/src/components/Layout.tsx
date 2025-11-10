import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";

const navItems = [
  { path: "/", label: "Play" },
  { path: "/admin", label: "Admin" }
];

const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { dyslexiaMode } = useAppStore();

  return (
    <div className={"flex min-h-screen flex-col " + (dyslexiaMode ? "font-dyslexic" : "font-rounded")}>
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-white shadow-lg">
        <h1 className="text-2xl font-bold">English Garden</h1>
        <nav className="flex gap-3 text-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-full px-3 py-1 transition-colors ${
                location.pathname === item.path ? "bg-white text-primary" : "bg-primary/30"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      <footer className="bg-secondary/60 px-4 py-3 text-sm text-stone-700">
        © {new Date().getFullYear()} English Garden. Parental guidance recommended.
      </footer>
    </div>
  );
};

export default Layout;
