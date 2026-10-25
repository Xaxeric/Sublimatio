import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Login view. Controlled inputs + client-side validation before entering the buffer.
 */
export default function LoginView() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password must be fill before login!");
      return;
    }

    setError("");
    setSubmitting(true);
    setTimeout(() => navigate("/dashboard"), 400);
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-5">
      <div className="grid-img-decoration mask-img-w-radial" />

      <section className="glass-card relative z-10 flex w-full max-w-[432px] flex-col gap-5 p-8">
        <header className="flex w-full flex-col gap-2">
          <h1 className="font-chakra text-2xl font-bold tracking-wide text-sublimatio-text">
            Authentication
          </h1>
          <h2 className="font-chakra text-sm font-semibold tracking-wider text-sublimatio-tertiary">
            Sublimatio - Sync. Sublimate. Vanish.
          </h2>
        </header>

        {error && (
          <div className="flex items-center rounded border border-sublimatio-red/50 bg-sublimatio-red/20 p-2.5 font-chakra text-xs text-sublimatio-red">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-sublimatio-muted">
            Please use login using your preconfigured credential
          </p>

          <div>
            <label
              htmlFor="username_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Username
            </label>
            <input
              id="username_id"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Input your username"
              className="my-2 w-full border border-[#0b1233] bg-[#09090c3f] p-2 font-mono text-[13px] text-sublimatio-subtle outline-none hover:text-[#afb8e9] focus:border-sublimatio-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Password
            </label>
            <input
              id="password_id"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Input your password here"
              className="my-2 w-full border border-[#0b1233] bg-[#09090c3f] p-2 font-mono text-[13px] text-sublimatio-subtle outline-none hover:text-[#afb8e9] focus:border-sublimatio-accent"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="min-w-[90px] border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-3 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125 active:brightness-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-w-[90px] border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-3 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125 active:brightness-50 disabled:opacity-60"
            >
              {submitting ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
