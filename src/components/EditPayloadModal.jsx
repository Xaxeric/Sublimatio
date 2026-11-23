import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

  const labelClass =
    "mb-1 block font-chakra text-xs font-semibold uppercase tracking-wider text-slate-300";

  return (
    <Modal
      onClose={onClose}
      maxWidth="max-w-lg"
      description="Perbarui data payload pada backend NestJS"
      title={
        <>
          <span className="h-2.5 w-2.5 bg-sublimatio-accent" />
          <span>Ubah Data Payload (PATCH /payloads/:id)</span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert
            variant="destructive"
            className="animate-slide-down border-red-500/60 bg-red-950/40 font-chakra text-xs text-red-300"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="edit-name" className={labelClass}>
            Nama Payload <span className="font-mono text-[10px] text-indigo-400">(min. 3 karakter)</span>
          </Label>
          <Input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input px-3.5 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="edit-ttl" className={labelClass}>
              Remaining TTL (detik)
            </Label>
            <Input
              id="edit-ttl"
              type="number"
              min="1"
              value={remainingTTL}
              onChange={(e) => setRemainingTTL(e.target.value)}
              className="ui-input px-3.5 py-2 text-sm"
              required
            />
          </div>

          <div>
            <Label className={labelClass}>Status Pin (Proteksi Purge)</Label>
            <div className="flex h-10 items-center gap-2 border border-[#0a102e] bg-[#080d24] px-3">
              <Switch
                id="edit-pinned"
                checked={isPinned}
                onCheckedChange={setIsPinned}
              />
              <Label
                htmlFor="edit-pinned"
                className="cursor-pointer font-chakra text-xs text-slate-200"
              >
                Pinned (Tahan Sublimasi)
              </Label>
            </div>
          </div>
        </div>

        {payload.type === "link" && (
          <div>
            <Label htmlFor="edit-url" className={labelClass}>
              URL Tujuan
            </Label>
            <Input
              id="edit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="ui-input px-3.5 py-2 text-sm"
            />
          </div>
        )}

        {payload.type === "text" && (
          <div>
            <Label htmlFor="edit-content" className={labelClass}>
              Konten Snippet Teks
            </Label>
            <Textarea
              id="edit-content"
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="ui-input px-3.5 py-2 text-sm"
            />
          </div>
        )}

        <Separator className="bg-[#0a102e]" />
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="px-4 py-2 font-chakra text-xs font-bold uppercase text-slate-400 hover:text-white"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="ui-btn-primary rounded px-5 py-2"
          >
            {submitting ? "Menyimpan (PATCH)..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
