/**
 * Minimal modal shell: dark backdrop, glass card and click-outside / close handling.
 */
export default function Modal({ children, onClose, maxWidth = "max-w-lg" }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={
          "glass-card relative w-full space-y-5 border border-sublimatio-accent p-6 shadow-2xl " +
          maxWidth
        }
      >
        {children}
      </div>
    </div>
  );
}
