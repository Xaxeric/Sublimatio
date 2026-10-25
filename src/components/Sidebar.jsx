import { NavLink, Link } from "react-router-dom";

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
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    ),
    iconClass: "text-slate-400",
  },
];

/**
 * Fixed navigation sidebar shared by every authenticated view.
 */
export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-[233px] flex-col justify-between border-r-2 border-[#0a102e] bg-gradient-to-r from-black/50 to-[#111a3d]/50 pt-8 backdrop-blur-[1.7rem]">
      <div>
        <div className="border-b border-[#0a102e]/80 px-7 pt-2 pb-6">
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

        <nav className="mt-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "flex items-center gap-3 px-7 py-2 font-chakra text-sm uppercase " +
                (isActive
                  ? "!bg-[#152052]/40 text-sublimatio-accent border-r-2 border-sublimatio-accent"
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

          <Link
            to="/"
            className="flex items-center gap-3 px-7 py-2 font-chakra text-sm uppercase text-sublimatio-red hover:text-sublimatio-red/50"
          >
            <svg
              className="h-4 w-4 text-sublimatio-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Link>
        </nav>
      </div>
    </aside>
  );
}
