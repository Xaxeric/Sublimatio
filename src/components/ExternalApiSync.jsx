import { useCallback, useEffect, useState } from "react";
import { makeHash } from "../utils/payload.js";

const API_ENDPOINT = "https://jsonplaceholder.typicode.com/posts";

/**
 * ExternalApiSync Component (Tugas 7 - Ajax & Konsumsi API Eksternal/Mock).
 *
 * Mengambil data payload dari API eksternal (JSONPlaceholder) secara asinkron
 * menggunakan native fetch() dengan penanganan lengkap state:
 * - Loading
 * - Success (render list .map() dengan key unik)
 * - Error dengan tombol "Coba Lagi" (Retry)
 * - Form transmisi data baru menggunakan HTTP POST ke mock API
 */
export default function ExternalApiSync({ onImportPayload }) {
  // State manajemen AJAX
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk simulasi error (memudahkan pengambilan screenshot kondisi error)
  const [simulateError, setSimulateError] = useState(false);

  // State untuk form interaksi POST ke mock API
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);

  /**
   * Mengambil data asinkron dari API eksternal menggunakan fetch().
   * Menangani siklus state: loading -> success / error.
   */
  const fetchRemotePayloads = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);

    // Jika sedang dalam mode simulasi error dan bukan aksi klik "Coba Lagi"
    const targetUrl = simulateError && !isRetry
      ? "https://jsonplaceholder.typicode.com/invalid-mesh-endpoint-500"
      : `${API_ENDPOINT}?_limit=4`;

    try {
      const response = await fetch(targetUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `Gagal menghubungi gateway remote: HTTP ${response.status} ${response.statusText}`,
        );
      }

      const json = await response.json();

      // Transformasi data JSON API ke entitas Payload Sublimatio
      const mapped = json.map((post) => ({
        id: `ext-api-${post.id}`,
        apiId: post.id,
        name: `Packet #${post.id}: ${post.title.slice(0, 32)}...`,
        content: post.body,
        type: "text",
        device: `Peer Gateway (Node #${post.id})`,
        size: `${(post.body.length * 1.5).toFixed(0)} B`,
        hash: makeHash(),
        totalTTL: 180,
        remainingTTL: 180,
      }));

      setItems(mapped);
    } catch (err) {
      setError(
        err.message || "Terjadi kesalahan jaringan saat mengambil data dari API eksternal.",
      );
    } finally {
      setLoading(false);
    }
  }, [simulateError]);

  // Load data pertama kali saat komponen dimuat
  useEffect(() => {
    fetchRemotePayloads();
  }, [fetchRemotePayloads]);

  /**
   * Tombol "Coba Lagi" saat kondisi error (Instruksi 4 Tugas 7).
   */
  const handleRetry = () => {
    setSimulateError(false);
    fetchRemotePayloads(true);
  };

  /**
   * Mengirim data baru ke Mock API menggunakan HTTP POST (Instruksi 4 Tugas 7).
   */
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    setPosting(true);
    setPostResult(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          title: postTitle.trim(),
          body: postBody.trim(),
          userId: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const created = await response.json();
      setPostResult({
        success: true,
        data: created,
        message: `Berhasil mengirim payload ke mock API (ID: ${created.id})!`,
      });
      setPostTitle("");
      setPostBody("");
    } catch (err) {
      setPostResult({
        success: false,
        message: `Gagal mengirim ke mock API: ${err.message}`,
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="glass-card rounded-xl border border-[#0a102e] p-5 sm:p-6 space-y-4">
      {/* Header section dengan judul & kontrol aksi */}
      <div className="flex flex-col gap-3 border-b border-[#0a102e] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-chakra text-sm sm:text-base font-bold tracking-wide text-white">
              Remote Peer API Stream (AJAX External Sync)
            </h2>
          </div>
          <p className="mt-0.5 font-rajdhani text-xs text-sublimatio-tertiary">
            Konsumsi data asinkron dari API eksternal (JSONPlaceholder) via{" "}
            <code className="rounded bg-black/40 px-1 font-mono text-cyan-300">
              fetch()
            </code>
          </p>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle simulasi error untuk screenshot */}
          <button
            type="button"
            onClick={() => {
              setSimulateError((prev) => !prev);
              setTimeout(() => fetchRemotePayloads(), 50);
            }}
            title="Klik untuk mensimulasikan kegagalan jaringan demi kebutuhan screenshot kondisi error"
            className={
              "rounded px-2.5 py-1.5 font-chakra text-[10px] uppercase font-semibold transition-all " +
              (simulateError
                ? "border border-red-500 bg-red-950/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                : "border border-[#1a2868] bg-[#0c1333] text-slate-400 hover:text-white")
            }
          >
            {simulateError ? "Simulasi Error: AKTIF" : "Tes Simulasi Error"}
          </button>

          {/* Toggle form POST */}
          <button
            type="button"
            onClick={() => setShowPostForm((prev) => !prev)}
            className="border border-blue-500/60 bg-blue-950/40 px-2.5 py-1.5 font-chakra text-[10px] uppercase font-semibold text-blue-300 hover:border-blue-400 hover:text-white transition-all rounded"
          >
            {showPostForm ? "Tutup Form POST" : "+ Kirim Data (POST API)"}
          </button>

          {/* Refresh / Fetch ulang */}
          <button
            type="button"
            disabled={loading}
            onClick={() => fetchRemotePayloads()}
            className="flex items-center gap-1.5 border border-cyan-500/60 bg-cyan-950/40 px-3 py-1.5 font-chakra text-[10px] uppercase font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition-all rounded disabled:opacity-50"
          >
            <svg
              className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Memuat..." : "Refresh Stream"}
          </button>
        </div>
      </div>

      {/* Form POST ke Mock API (Instruksi 4: Interaksi POST) */}
      {showPostForm && (
        <form
          onSubmit={handlePostSubmit}
          className="rounded-lg border border-[#1a2868] bg-[#060a1f] p-4 space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#0d163d] pb-2">
            <span className="font-chakra text-xs font-bold uppercase tracking-wider text-cyan-300">
              Transmit New Packet via HTTP POST
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Target: {API_ENDPOINT}
            </span>
          </div>

          <div>
            <label className="block font-chakra text-[10px] uppercase text-slate-300 mb-1">
              Judul Packet / Title:
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Masukkan judul data untuk dikirim ke API..."
              className="w-full rounded border border-[#0d163d] bg-[#040714] px-3 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-chakra text-[10px] uppercase text-slate-300 mb-1">
              Isi Payload / Body Content:
            </label>
            <textarea
              rows="2"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Tuliskan payload teks yang akan dikirim via POST..."
              className="w-full rounded border border-[#0d163d] bg-[#040714] px-3 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-rajdhani text-xs text-slate-400">
              Data dikirim secara asinkron ke server mock JSONPlaceholder
            </span>
            <button
              type="submit"
              disabled={posting}
              className="border border-cyan-400 bg-sublimatio-accent px-4 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {posting ? "Mengirim (POST)..." : "Kirim via POST"}
            </button>
          </div>

          {postResult && (
            <div
              className={
                "mt-2 rounded p-2.5 font-chakra text-xs flex items-center justify-between " +
                (postResult.success
                  ? "border border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                  : "border border-red-500/50 bg-red-950/30 text-red-300")
              }
            >
              <span>{postResult.message}</span>
              {postResult.data && (
                <span className="font-mono text-[10px] text-slate-400">
                  Response Code: 201 Created
                </span>
              )}
            </div>
          )}
        </form>
      )}

      {/* ========================================================= */}
      {/* KONDISI 1: STATE LOADING                                   */}
      {/* ========================================================= */}
      {loading && (
        <div
          data-testid="loading-state"
          className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#0d163d] bg-[#05091c]/70 py-12"
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-500/30" />
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
          <p className="font-chakra text-xs uppercase tracking-wider text-cyan-300 animate-pulse">
            Memuat Data Dari API Eksternal...
          </p>
          <span className="font-mono text-[10px] text-sublimatio-tertiary">
            GET {API_ENDPOINT}?_limit=4
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* KONDISI 2: STATE ERROR (DENGAN TOMBOL "COBA LAGI")        */}
      {/* ========================================================= */}
      {!loading && error && (
        <div
          data-testid="error-state"
          className="rounded-lg border border-sublimatio-red/60 bg-sublimatio-red/10 p-5 shadow-[0_0_20px_rgba(243,38,38,0.2)]"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-sublimatio-red mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div className="flex-1 space-y-1">
              <h3 className="font-chakra text-sm font-bold uppercase tracking-wider text-sublimatio-red">
                Gagal Mengambil Data Dari API Eksternal
              </h3>
              <p className="font-rajdhani text-xs text-slate-300 leading-relaxed">
                {error}
              </p>
              <p className="font-mono text-[10px] text-sublimatio-muted pt-1">
                Kondisi error terdeteksi. Silakan periksa koneksi jaringan atau klik tombol di bawah untuk mengulang permintaan.
              </p>
            </div>

            {/* Tombol "Coba Lagi" (Instruksi 4 Tugas 7) */}
            <button
              type="button"
              onClick={handleRetry}
              className="flex-shrink-0 rounded border border-sublimatio-red bg-sublimatio-red/30 px-4 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-sublimatio-red hover:shadow-[0_0_15px_rgba(243,38,38,0.4)] transition-all"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* KONDISI 3: STATE SUCCESS (RENDER LIST DENGAN .map() & KEY) */}
      {/* ========================================================= */}
      {!loading && !error && items.length > 0 && (
        <div data-testid="success-state" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="font-chakra text-[10px] uppercase tracking-wider text-sublimatio-tertiary">
              Daftar Paket Terenkripsi dari Remote Peer ({items.length} Data Berhasil Dimuat):
            </span>
            <span className="rounded bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              HTTP 200 OK
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-lg border border-[#0d163d] bg-[#060a20]/70 p-3.5 transition-all hover:border-cyan-500/60 hover:bg-[#0a1236]/70 shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-cyan-400">
                      ID: #{item.apiId}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {item.size}
                    </span>
                  </div>

                  <h4 className="font-chakra text-xs font-bold text-white group-hover:text-cyan-200 line-clamp-1">
                    {item.name}
                  </h4>

                  <p className="font-rajdhani text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#0a102e] pt-2">
                  <span className="font-mono text-[9px] text-sublimatio-muted truncate max-w-[150px]">
                    {item.device}
                  </span>

                  {onImportPayload && (
                    <button
                      type="button"
                      onClick={() => onImportPayload(item)}
                      title="Salin dan sinkronkan payload ini ke volatile buffer RAM"
                      className="rounded border border-[#1a2868] bg-[#0c1333] px-2 py-1 font-chakra text-[10px] uppercase font-bold text-sublimatio-glow hover:border-cyan-400 hover:text-white transition-all"
                    >
                      + Impor ke Buffer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
