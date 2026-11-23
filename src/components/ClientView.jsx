import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  makeHash,
} from "../utils/payload.js";

const PENDING_TRANSMIT_KEY = "sublimatio_pending_transmit";

const ALLOWED_MIME_LABEL = "image/png, image/jpeg, application/pdf";

/**
 * Client view: minimal transmit form for a peer device.
 * The payload is handed over to the dashboard through localStorage.
 */
export default function ClientView({ pushToast }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const chosenFile = fileRef.current?.files?.[0];
    if (!chosenFile && !text.trim()) {
      setError(
        "Silakan pilih file atau masukkan teks clipboard sebelum transmisi!",
      );
      return;
    }

    if (chosenFile && chosenFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        "Ukuran file maksimal 10 MB. File " +
          chosenFile.name +
          " terlalu besar untuk ditransmisikan!",
      );
      return;
    }

    if (chosenFile && !ALLOWED_MIME_TYPES.includes(chosenFile.type)) {
      setError(
        "Tipe file tidak didukung. Hanya " +
          ALLOWED_MIME_LABEL +
          " yang diizinkan!",
      );
      return;
    }

    setError("");

    let payloadItem;
    if (chosenFile) {
      payloadItem = {
        id: "client-f-" + Date.now().toString(36),
        type: "file",
        name: chosenFile.name,
        size: (chosenFile.size / 1024).toFixed(1) + " KB",
        mime: chosenFile.type || "application/octet-stream",
        content: "[Client Upload Buffer: " + chosenFile.name + "]",
        desc: "Payload uploaded from client terminal",
        device: "Mobile (Client Node)",
        totalTTL: 300,
        remainingTTL: 300,
        createdAt: "Just now",
        hash: makeHash(),
      };
    } else {
      payloadItem = {
        id: "client-t-" + Date.now().toString(36),
        type: "text",
        name: "Client Clipboard Payload",
        content: text.trim(),
        desc: "Text snippet transmitted from client terminal",
        device: "Mobile (Client Node)",
        totalTTL: 180,
        remainingTTL: 180,
        createdAt: "Just now",
        hash: makeHash(),
      };
    }

    try {
      localStorage.setItem(PENDING_TRANSMIT_KEY, JSON.stringify(payloadItem));
    } catch (err) {
      console.warn(err);
    }

    pushToast(
      `Transmisi "${payloadItem.name}" dikirim ke mesh buffer.`,
      "success",
      "Payload Transmitted",
    );
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Card className="relative z-10 w-full max-w-lg gap-0 p-6 py-6">
        <div className="pb-3">
          <h2 className="text-lg font-bold tracking-wide text-foreground">
            Client Node Transmission
          </h2>
          <p className="text-xs text-muted-foreground">
            Send ephemeral payload directly to mesh buffer
          </p>
        </div>
        <Separator />

        {error && (
          <Alert
            variant="destructive"
            className="mt-4 text-xs"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label
              htmlFor="fileupload_id"
              className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground"
            >
              Upload File
            </Label>
            <Input
              id="fileupload_id"
              type="file"
              ref={fileRef}
              accept="image/png, image/jpeg, application/pdf"
              className="h-auto px-3 py-2 text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-xs file:text-foreground"
            />
          </div>

          <div>
            <Label
              htmlFor="textform_id"
              className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground"
            >
              Text / Clipboard Content:
            </Label>
            <Textarea
              id="textform_id"
              rows="4"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type or paste payload here..."
              className="px-3 py-2 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button variant="link" asChild className="px-0 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <Link to="/dashboard">&larr; Back to Dashboard</Link>
            </Button>
            <Button type="submit" className="px-6 py-2">
              Transmit to Buffer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
