import { useRef, useState } from "react";
import Modal from "./Modal.jsx";
import { makeHash } from "../utils/payload.js";

const TTL_OPTIONS = [
  { value: 15, label: "15 Seconds (Fast Test)" },
  { value: 30, label: "30 Seconds" },
  { value: 60, label: "1 Minute" },
  { value: 300, label: "5 Minutes" },
  { value: 900, label: "15 Minutes" },
];

const EMPTY_FORM = {
  type: "text",
  name: "",
  textValue: "",
  urlValue: "",
  ttl: 300,
};

/**
 * Controlled form used to add ("Tambah") a new Payload to the buffer.
 *
 * All inputs are controlled components; only the file input is read through a ref
 * because browsers do not allow programmatic value control for file fields.
 *
 * @param {Function} onAddPayload Receives a fully-built Payload entity.
 * @param {Function} onClose      Closes the form modal.
 */
export default function PayloadForm({ onAddPayload, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const update = (field) => (event) => {
    const value = field === "ttl" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Silakan isi nama / label item terlebih dahulu!");
      return;
    }
    if (form.type === "link" && !form.urlValue.trim()) {
      setError("URL tujuan tidak boleh kosong untuk payload link!");
      return;
    }
    if (form.type === "text" && !form.textValue.trim()) {
      setError("Konten payload teks / clipboard tidak boleh kosong!");
      return;
    }

    setError("");

    const payload = {
      id: "user-" + Date.now().toString(36),
      type: form.type,
      name,
      device: "Workstation (Desktop)",
      totalTTL: form.ttl,
      remainingTTL: form.ttl,
      createdAt: "Just now",
      hash: makeHash(),
    };

    if (form.type === "file") {
      const chosenFile = fileRef.current?.files?.[0];
      if (chosenFile) {
        payload.name = chosenFile.name;
        payload.size = (chosenFile.size / 1024).toFixed(1) + " KB";
        payload.mime = chosenFile.type || "application/octet-stream";
        payload.content = "[Uploaded File Buffer: " + chosenFile.name + "]";
      } else {
        payload.size = "256 KB";
        payload.mime = "application/octet-stream";
        payload.content = "[Simulated File Payload: " + name + "]";
      }
    } else if (form.type === "link") {
      payload.url = form.urlValue.trim();
    } else {
      payload.content = form.textValue.trim();
    }

    onAddPayload(payload);
    onClose();
  };

  const inputClass =
    "w-full border border-[#0a102e] bg-[#080d24] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-sublimatio-accent focus:outline-none";
  const labelClass =
    "mb-1.5 block font-chakra text-xs font-semibold uppercase tracking-wider text-slate-300";

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-[#0a102e] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-sublimatio-accent shadow-[0_0_8px_#1a39ed]" />
          <h3 className="font-chakra text-lg font-bold tracking-wider text-white">
            Transmit New Payload
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

      {error && (
        <div className="flex items-center gap-2 rounded border border-sublimatio-red/50 bg-sublimatio-red/20 p-3 font-chakra text-xs text-sublimatio-red">
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-type" className={labelClass}>
            Payload Type
          </label>
          <select
            id="add-type"
            value={form.type}
            onChange={update("type")}
            className={inputClass + " font-chakra"}
          >
            <option value="text">Text Snippet / Clipboard</option>
            <option value="link">Web Link / URL</option>
            <option value="file">File Upload / Transfer</option>
          </select>
        </div>

        <div>
          <label htmlFor="add-name" className={labelClass}>
            Item Identifier / Name{" "}
            <span className="text-sublimatio-red">*</span>
          </label>
          <input
            id="add-name"
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="e.g., API Secret Token, Staging DB URL"
            className={inputClass}
          />
        </div>

        {form.type === "text" && (
          <div>
            <label htmlFor="add-text-input" className={labelClass}>
              Text Payload Content{" "}
              <span className="text-sublimatio-red">*</span>
            </label>
            <textarea
              id="add-text-input"
              rows="4"
              value={form.textValue}
              onChange={update("textValue")}
              placeholder="Paste sensitive text, credentials, or notes..."
              className={inputClass + " font-mono"}
            />
          </div>
        )}

        {form.type === "link" && (
          <div>
            <label htmlFor="add-url-input" className={labelClass}>
              Target URL <span className="text-sublimatio-red">*</span>
            </label>
            <input
              id="add-url-input"
              type="url"
              value={form.urlValue}
              onChange={update("urlValue")}
              placeholder="https://example.com/temporary-room"
              className={inputClass + " font-mono"}
            />
          </div>
        )}

        {form.type === "file" && (
          <div>
            <label htmlFor="add-file-input" className={labelClass}>
              Choose File
            </label>
            <input
              id="add-file-input"
              type="file"
              ref={fileRef}
              className="w-full border border-[#0a102e] bg-[#080d24] px-3.5 py-2 font-mono text-sm text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-blue-900/60 file:px-3 file:py-1.5 file:font-chakra file:text-xs file:text-cyan-300"
            />
          </div>
        )}

        <div>
          <label htmlFor="add-ttl" className={labelClass}>
            TTL Expiration
          </label>
          <select
            id="add-ttl"
            value={form.ttl}
            onChange={update("ttl")}
            className={inputClass + " font-chakra"}
          >
            {TTL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#0a102e] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 px-4 py-2 font-chakra text-xs uppercase tracking-wider text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-sublimatio-accent px-5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(26,57,237,0.4)] transition-all hover:bg-blue-600"
          >
            Tambah Payload
          </button>
        </div>
      </form>
    </Modal>
  );
}
