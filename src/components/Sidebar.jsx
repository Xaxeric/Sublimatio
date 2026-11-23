import { NavLink, Link } from "react-router-dom";
import { ChevronsLeft, LogOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    ),
    iconClass: "text-sublimatio-accent",
  },
  {
    to: "/client",
    label: "Client Send",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    ),
    iconClass: "text-slate-400",
  },
  {
    to: "/connect",
    label: "Connect Mobile",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
    iconClass: "text-slate-400",
  },
];

// Predefined mesh devices representing the connected peer network
const KNOWN_DEVICES = [
  {
    id: "dev-pixel8",
    name: "Mobile (Pixel 8)",
    type: "mobile",
    role: "Mobile Client",
    ip: "192.168.1.42",
  },
  {
    id: "dev-workstation",
    name: "Desktop (Workstation)",
    type: "desktop",
    role: "Primary Host",
    ip: "192.168.1.10",
  },
  {
    id: "dev-gateway",
    name: "Node #4 (Gateway)",
    type: "server",
    role: "Mesh Gateway",
    ip: "10.24.8.19",
  },
  {
    id: "dev-zenfone",
    name: "Mobile (Asus Zenfone)",
    type: "mobile",
    role: "Mobile Peer",
    ip: "192.168.1.58",
  },
  {
    id: "dev-client",
    name: "Mobile (Client Node)",
    type: "mobile",
    role: "Client Node",
    ip: "192.168.1.89",
  },
];

function DeviceIcon({ type }) {
  if (type === "mobile") {
    return (
      <svg
        className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }
  if (type === "desktop") {
    return (
      <svg
        className="h-3.5 w-3.5 flex-shrink-0 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>
  );
}

/**
 * Fixed or collapsible navigation sidebar with active device list and toggle panel controls.
 */
export default function Sidebar({
  payloads = [],
  isOpen = true,
  onToggle,
  onClose,
}) {
  const handleLogout = () => {
    try {
      sessionStorage.removeItem("sublimatio_auth");
      localStorage.removeItem("sublimatio_auth");
    } catch {
      // Ignore storage errors
    }
  };

  // Compute active payload count for each device
  const deviceList = KNOWN_DEVICES.map((dev) => {
    const payloadCount = payloads.filter((p) => p.device === dev.name).length;
    return {
      ...dev,
      payloadCount,
      isOnline: true,
    };
  });

  return (
    <>
      {/* Mobile backdrop overlay to close sidebar when clicked */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={
          "fixed top-0 left-0 z-40 flex h-screen w-[240px] flex-col justify-between border-r-2 border-[#0a102e] bg-gradient-to-r from-black/80 via-[#0a102b]/90 to-[#111a3d]/80 pt-6 pb-4 backdrop-blur-[1.7rem] transition-transform duration-300 ease-in-out " +
          (isOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex flex-col overflow-y-auto no-scrollbar">
          {/* Header branding & panel collapse toggle */}
          <div className="flex items-start justify-between px-6 pt-1 pb-5">
            <div>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-0 text-sublimatio-text"
              >
                <span className="h-3 w-3 animate-pulse bg-sublimatio-accent shadow-[0_0_10px_#1a39ed]" />
                <span className="font-chakra text-xl font-bold tracking-wider">
                  SUBLIMATIO
                </span>
              </Link>
              <span className="mt-1 block font-chakra text-[10px] uppercase tracking-widest text-sublimatio-tertiary">
                Ephemeral Mesh v1.0
              </span>
            </div>

            {/* Toggle dashboard sidebar panel button */}
            {onToggle && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onToggle}
                title="Collapse sidebar panel"
                className="h-7 w-7 border border-[#1a2868] bg-[#0c1333] text-sublimatio-subtle hover:border-sublimatio-accent hover:text-white"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Separator className="bg-[#0a102e]/80" />

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1">
            <span className="block px-6 pb-1 font-chakra text-[10px] uppercase tracking-wider text-sublimatio-tertiary">
              Menu Navigation
            </span>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  "flex items-center gap-3 px-6 py-2 font-chakra text-xs uppercase tracking-wide transition-colors " +
                  (isActive
                    ? "!bg-[#152052]/40 text-sublimatio-accent border-r-2 border-sublimatio-accent font-semibold"
                    : "text-sublimatio-subtle hover:text-white")
                }
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={
                        "h-4 w-4 " +
                        (isActive ? "text-sublimatio-accent" : item.iconClass)
                      }
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.icon}
                    </svg>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Connected Device List Section */}
          <div className="mt-6 px-6 pt-4">
            <Separator className="mb-2.5 bg-[#0a102e]/80" />
            <div className="flex items-center justify-between pb-2.5">
              <span className="font-chakra text-[10px] font-bold uppercase tracking-wider text-sublimatio-subtle">
                Connected Devices
              </span>
              <Badge
                variant="outline"
                className="gap-1 rounded border-indigo-800/40 bg-indigo-950/30 px-1.5 py-0.5 font-mono text-[9px] text-indigo-300"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                {deviceList.length} Nodes
              </Badge>
            </div>

            <ScrollArea className="h-[220px] pr-1">
              <div className="pb-1">
                <div className="space-y-1.5">
                  {deviceList.map((dev) => (
                  <div
                    key={dev.id}
                    className="group flex items-center justify-between rounded border border-[#0d163d]/50 bg-[#070b20]/60 p-2 transition-all hover:border-sublimatio-accent/60 hover:bg-[#0c143d]/60"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <DeviceIcon type={dev.type} />
                      <div className="min-w-0">
                        <p className="truncate font-chakra text-[11px] font-semibold text-slate-200 group-hover:text-white">
                          {dev.name}
                        </p>
                        <p className="truncate font-mono text-[9px] text-sublimatio-tertiary">
                          {dev.role} &bull; {dev.ip}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end pl-1.5">
                      {dev.payloadCount > 0 ? (
                        <Badge
                          variant="secondary"
                          className="rounded bg-sublimatio-accent/30 px-1 py-0 font-mono text-[9px] font-bold text-blue-200"
                        >
                          {dev.payloadCount} data
                        </Badge>
                      ) : (
                        <span className="font-mono text-[9px] text-slate-500">
                          idle
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          </div>
        </div>

        {/* Footer actions: Logout */}
        <div className="px-6 pt-3">
          <Separator className="mb-3 bg-[#0a102e]/80" />
          <Button
            variant="ghost"
            asChild
            className="justify-start gap-3 px-1 py-1.5 font-chakra text-xs uppercase text-sublimatio-red hover:text-sublimatio-red/70"
          >
            <Link to="/" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-sublimatio-red" />
              Logout Node
            </Link>
          </Button>
        </div>
      </aside>
    </>
  );
}
