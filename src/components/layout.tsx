import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  LayoutGrid,
  Package,
  PackagePlus,
  Shirt,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventory } from "@/lib/store";

const NAV = [
  { to: "/", label: "Inicio", icon: LayoutGrid },
  { to: "/entregar", label: "Entregar", icon: Users },
  { to: "/entradas", label: "Entradas", icon: PackagePlus },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/historial", label: "Historial", icon: ClipboardList },
  { to: "/kits", label: "Kits", icon: Shirt },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sync = useInventory((s) => s.sync);
  const persistent = useInventory((s) => s.persistent);
  const hydrated = useInventory((s) => s.hydrated);
  const error = useInventory((s) => s.error);
  const [minimumSplashDone, setMinimumSplashDone] = useState(false);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setMinimumSplashDone(true), 1400);
    void sync();
    const timer = window.setInterval(() => void sync(), 10000);
    const onFocus = () => void sync();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(splashTimer);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sync]);

  if (!minimumSplashDone || !hydrated) {
    return (
      <div className="app-splash" role="status" aria-label="Cargando sistema de uniformes">
        <div className="app-splash__mark">
          <img src="/brands/cesantoni-symbol.png" alt="Cesantoni" />
        </div>
        <p className="app-splash__text">Cargando sistema...</p>
      </div>
    );
  }

  return (
    <div className="app-shell-enter min-h-dvh bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/brands/cesantoni-symbol.png"
              alt="Cesantoni"
              className="cesantoni-brand-logo size-10 shrink-0 object-contain sm:hidden"
            />
            <div className="min-w-0">
              <img
                src="/brands/cesantoni-wordmark.png"
                alt="Cesantoni Porcelanato Premium"
                className="cesantoni-brand-logo hidden h-11 w-auto max-w-[230px] object-contain object-left sm:block"
              />
              <p className="mt-0.5 text-[11px] tracking-wide text-muted sm:text-xs">
                Uniformes de colaboradores
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {hydrated ? (
              <span
                className={cn(
                  "hidden rounded-full border px-2.5 py-1 text-[11px] sm:inline-flex",
                  error
                    ? "border-danger/30 bg-danger-bg text-danger"
                    : persistent
                      ? "border-ok/30 bg-ok-bg text-ok"
                      : "border-warn/30 bg-warn-bg text-warn",
                )}
                title={
                  error
                    ? error
                    : persistent
                      ? "Datos compartidos en la nube"
                      : "Configura DATABASE_URL en Vercel para conservar y compartir los datos"
                }
              >
                {error ? "Error de sincronización" : persistent ? "Nube sincronizada" : "Base temporal"}
              </span>
            ) : null}
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-[var(--radius-sm)] px-3 py-2 text-sm",
                      active ? "bg-primary text-primary-fg" : "text-muted hover:bg-bg hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface md:hidden">
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[9px]",
                  active ? "text-primary" : "text-subtle",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
