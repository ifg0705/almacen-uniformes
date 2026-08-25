import { type ReactNode, useEffect } from "react";
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

  useEffect(() => {
    void sync();
    const timer = window.setInterval(() => void sync(), 10000);
    const onFocus = () => void sync();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sync]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-elevated/95 shadow-[0_8px_30px_rgba(15,61,74,0.08)] backdrop-blur">
        <div className="h-1.5 bg-[linear-gradient(90deg,#76b947_0%,#76b947_32%,#0f5264_32%,#0f5264_68%,#f08a2e_68%,#f08a2e_100%)]" />

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex min-h-[88px] items-center justify-between gap-5 py-3">
            <Link to="/" className="flex min-w-0 items-center gap-4" aria-label="Ir al inicio">
              <img
                src="/brands/cesantoni.svg"
                alt="Cesantoni Cerámica"
                className="h-11 w-auto max-w-[205px] object-contain sm:h-12 sm:max-w-[255px]"
              />
              <span className="hidden h-11 w-px bg-border lg:block" aria-hidden="true" />
              <img
                src="/brands/grupo-industrial.svg"
                alt="Grupo Industrial Cesantoni"
                className="hidden h-11 w-auto max-w-[190px] object-contain lg:block"
              />
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              {hydrated ? (
                <span
                  className={cn(
                    "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:inline-flex",
                    error
                      ? "border-danger/25 bg-danger-bg text-danger"
                      : persistent
                        ? "border-ok/25 bg-ok-bg text-ok"
                        : "border-warn/25 bg-warn-bg text-warn",
                  )}
                  title={
                    error
                      ? error
                      : persistent
                        ? "Datos compartidos en la nube"
                        : "Configura DATABASE_URL en Vercel para conservar y compartir los datos"
                  }
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      error ? "bg-danger" : persistent ? "bg-ok" : "bg-warn",
                    )}
                  />
                  {error ? "Error de sincronización" : persistent ? "Nube sincronizada" : "Base temporal"}
                </span>
              ) : null}
              <div className="hidden text-right xl:block">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Control interno</p>
                <p className="text-[11px] text-muted">Almacén de uniformes</p>
              </div>
            </div>
          </div>

          <div className="hidden border-t border-border/70 md:block">
            <nav className="flex min-h-14 items-center gap-1 overflow-x-auto py-2" aria-label="Navegación principal">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-primary-fg shadow-sm"
                        : "text-muted hover:bg-primary/7 hover:text-primary",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.9} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 pb-24 md:px-6 md:py-8 md:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-elevated/95 shadow-[0_-8px_30px_rgba(15,61,74,0.08)] backdrop-blur md:hidden">
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[9px] font-semibold",
                  active ? "text-primary" : "text-subtle",
                )}
              >
                {active ? <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent" /> : null}
                <Icon className="size-4" strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
