import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Modal from "./Modal.jsx";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  makeHash,
} from "../utils/payload.js";

const ALLOWED_MIME_LABEL = "image/png, image/jpeg, application/pdf";

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

  const updateValue = (field, value) => {
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

    const chosenFile = fileRef.current?.files?.[0];

    if (form.type === "file" && chosenFile) {
      if (chosenFile.size > MAX_FILE_SIZE_BYTES) {
        setError(
          "Ukuran file maksimal 10 MB. File " +
            chosenFile.name +
            " terlalu besar untuk ditransmisikan!",
        );
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(chosenFile.type)) {
        setError(
          "Tipe file tidak didukung. Hanya " +
            ALLOWED_MIME_LABEL +
            " yang diizinkan!",
        );
        return;
      }
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

  const labelClass =
    "mb-1.5 block font-chakra text-xs font-semibold uppercase tracking-wider text-slate-300";

  return (
    <Modal
      onClose={onClose}
      description="Tambahkan payload baru ke buffer ephemeral"
      title={
        <>
          <span className="h-2.5 w-2.5 bg-sublimatio-accent shadow-[0_0_8px_#1a39ed]" />
          <span>Transmit New Payload</span>
        </>
      }
    >
      {error && (
        <Alert
          variant="destructive"
          className="flex animate-slide-down items-center gap-2 border-sublimatio-red/50 bg-sublimatio-red/20 font-chakra text-xs text-sublimatio-red"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="add-type" className={labelClass}>
            Payload Type
          </Label>
          <Select
            value={form.type}
            onValueChange={(value) => updateValue("type", value)}
          >
            <SelectTrigger id="add-type" className="ui-input px-3.5 py-2.5 font-chakra">
              <SelectValue placeholder="Pilih tipe payload" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Snippet / Clipboard</SelectItem>
              <SelectItem value="link">Web Link / URL</SelectItem>
              <SelectItem value="file">File Upload / Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="add-name" className={labelClass}>
            Item Identifier / Name <span className="text-sublimatio-red">*</span>
          </Label>
          <Input
            id="add-name"
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="e.g., API Secret Token, Staging DB URL"
            className="ui-input px-3.5 py-2.5"
          />
        </div>

        {form.type === "text" && (
          <div>
            <Label htmlFor="add-text-input" className={labelClass}>
              Text Payload Content <span className="text-sublimatio-red">*</span>
            </Label>
            <Textarea
              id="add-text-input"
              rows="4"
              value={form.textValue}
              onChange={update("textValue")}
              placeholder="Paste sensitive text, credentials, or notes..."
              className="ui-input px-3.5 py-2.5 font-mono"
            />
          </div>
        )}

        {form.type === "link" && (
          <div>
            <Label htmlFor="add-url-input" className={labelClass}>
              Target URL <span className="text-sublimatio-red">*</span>
            </Label>
            <Input
              id="add-url-input"
              type="url"
              value={form.urlValue}
              onChange={update("urlValue")}
              placeholder="https://example.com/temporary-room"
              className="ui-input px-3.5 py-2.5 font-mono"
            />
          </div>
        )}

        {form.type === "file" && (
          <div>
            <Label htmlFor="add-file-input" className={labelClass}>
              Choose File
            </Label>
            <Input
              id="add-file-input"
              type="file"
              ref={fileRef}
              accept={ALLOWED_MIME_LABEL}
              className="h-auto w-full border-[#0a102e] bg-[#080d24] px-3.5 py-2 font-mono text-sm text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-blue-900/60 file:px-3 file:py-1.5 file:font-chakra file:text-xs file:text-indigo-300"
            />
          </div>
        )}

        <div>
          <Label htmlFor="add-ttl" className={labelClass}>
            TTL Expiration
          </Label>
          <Select
            value={String(form.ttl)}
            onValueChange={(value) => updateValue("ttl", Number(value))}
          >
            <SelectTrigger id="add-ttl" className="ui-input px-3.5 py-2.5 font-chakra">
              <SelectValue placeholder="Pilih TTL" />
            </SelectTrigger>
            <SelectContent>
              {TTL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-[#0a102e]" />
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="bg-slate-800 px-4 py-2 font-chakra text-xs uppercase tracking-wider text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button type="submit" className="ui-btn-primary rounded px-5 py-2">
            Tambah Payload
          </Button>
        </div>
      </form>
    </Modal>
  );
}
