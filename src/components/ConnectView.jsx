import { Link } from "react-router-dom";

/**
 * Connect view: shows the QR code used to pair a mobile client device.
 */
export default function ConnectView() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-5">
      <div className="grid-img-decoration mask-img-w-radial" />

      <section className="glass-card relative z-10 flex w-full max-w-[432px] flex-col items-center justify-center gap-5 p-8">
        <h2 className="text-center font-chakra text-base font-bold tracking-wide text-sublimatio-text">
          Try to scan this QR image with your phone
        </h2>
        <img
          src="/assets/qr-code.jpg"
          alt="QR Link for connecting between device"
          className="h-[300px] w-[300px] border border-[#0a102e] object-contain"
        />
        <Link
          to="/dashboard"
          className="min-w-[90px] border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-3 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125"
        >
          Return to Dashboard
        </Link>
      </section>
    </div>
  );
}
