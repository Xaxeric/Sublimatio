import { useState } from "react";
import Modal from "./Modal.jsx";

/**
 * Modal to edit / update an existing Payload entity.
 * Calls PATCH /payloads/:id on NestJS backend.
 *
 * @param {object} payload Existing payload being edited.
 * @param {Function} onUpdatePayload Async function that sends update to backend.
 * @param {Function} onClose Closes the modal.
 */
export default function EditPayloadModal({ payload, onUpdatePayload, onClose }) {
  const [name, setName] = useState(payload.name || "");
  const [remainingTTL, setRemainingTTL] = useState(payload.remainingTTL || 300);
  const [isPinned, setIsPinned] = useState(Boolean(payload.isPinned));
  const [content, setContent] = useState(payload.content || "");
  const [url, setUrl] = useState(payload.url || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setError("Nama payload minimal harus memiliki 3 karakter!");
      return;
    }
    if (remainingTTL <= 0) {
      setError("Remaining TTL harus bernilai angka positif (> 0)!");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const updateData = {
        name: trimmedName,
        remainingTTL: Number(remainingTTL),
        isPinned,
      };

      if (payload.type === "link" && url.trim()) {
        updateData.url = url.trim();
      } else if (payload.type === "text" && content.trim()) {
        updateData.content = content.trim();
      }

      await onUpdatePayload(payload.id, updateData);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal memperbarui payload");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "ui-input px-3.5 py-2 text-sm";
  const labelClass =
    "mb-1 block font-chakra text-xs font-semibold uppercase tracking-wider text-slate-300";

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between border-b border-[#0a102e] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-sublimatio-accent" />
          <h3 className="font-chakra text-base font-bold uppercase tracking-wider text-white">
            Ubah Data Payload (PATCH /payloads/:id)
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-xl leading-none text-slate-400 hover:text-white"
        >
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded border border-red-500/60 bg-red-950/40 p-2.5 font-chakra text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>
            Nama Payload <span className="text-indigo-400 font-mono text-[10px]">(min. 3 karakter)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Remaining TTL (detik)</label>
            <input
              type="number"
              min="1"
              value={remainingTTL}
              onChange={(e) => setRemainingTTL(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Status Pin (Proteksi Purge)</label>
            <div className="flex items-center h-10 px-3 bg-[#080d24] border border-[#0a102e]">
              <label className="flex items-center gap-2 cursor-pointer font-chakra text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-[#0a102e] text-indigo-400 focus:ring-0"
                />
                <span>Pinned (Tahan Sublimasi)</span>
              </label>
            </div>
          </div>
        </div>

        {payload.type === "link" && (
          <div>
            <label className={labelClass}>URL Tujuan</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {payload.type === "text" && (
          <div>
            <label className={labelClass}>Konten Snippet Teks</label>
            <textarea
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0a102e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-chakra text-xs uppercase font-bold text-slate-400 hover:text-white"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="ui-btn-primary rounded px-5 py-2"
          >
            {submitting ? "Menyimpan (PATCH)..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
