// Seed data for the Payload entity — the main data entity of the Sublimatio app.
// Every payload is a transient file, link, or text snippet stored in the mesh buffer.

export const INITIAL_PAYLOADS = [
  {
    id: "sub-f-01",
    type: "file",
    name: "session-auth-token.pem",
    size: "184 KB",
    mime: "application/x-pem-file",
    content:
      "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0w9mX8q2p...\n[EPHEMERAL RAM BUFFER - ZERO KNOWLEDGE]\n-----END RSA PRIVATE KEY-----",
    device: "Mobile (Pixel 8)",
    totalTTL: 45,
    remainingTTL: 35,
    createdAt: "10s ago",
    hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  },
  {
    id: "sub-t-01",
    type: "text",
    name: "Staging Database Connection URL",
    content:
      "DATABASE_URL=postgres://sync_daemon:q9#N_v98Z01@10.24.8.19:5432/sublimatio_ephemeral?sslmode=verify-full",
    device: "Desktop (Workstation)",
    totalTTL: 240,
    remainingTTL: 140,
    createdAt: "1m ago",
    hash: "sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
  },
  {
    id: "sub-f-03",
    type: "file",
    name: "crash-dump-telemetry.gz",
    size: "5.1 MB",
    mime: "application/gzip",
    content: "[GZIP Archive Binary: 5.1 MB Ephemeral Telemetry Dump]",
    device: "Node #4 (Gateway)",
    totalTTL: 900,
    remainingTTL: 680,
    createdAt: "3m ago",
    hash: "sha256:1a8565a9da720485d2381a37498be9c7d826529c72179d461fd307a615e10eef",
  },
  {
    id: "sub-l-02",
    type: "link",
    name: "Sublimatio Project Repository",
    url: "https://github.com/Xaxeric/Sublimatio",
    device: "Mobile (Asus Zenfone)",
    totalTTL: 1200,
    remainingTTL: 980,
    createdAt: "5m ago",
    hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "sub-t-02",
    type: "text",
    name: "Zero-Knowledge Session Handshake",
    content:
      "CLIENT_NONCE=4e8a1c90f23b7;EPOCH_EXPIRY=1729230500;SIGNATURE=v1.ecdsa.8f92ab",
    device: "Mobile (Pixel 8)",
    totalTTL: 60,
    remainingTTL: 20,
    createdAt: "40s ago",
    hash: "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  },
];

export const INITIAL_LOGS = [
  {
    name: "quick-client-auth.json",
    type: "file",
    size: "4.2 KB",
    reason: "TTL Expired (0s)",
    timestamp: "2m ago",
  },
  {
    name: "https://dev.portal/quick-invite/99a",
    type: "link",
    size: "N/A",
    reason: "Manual Sublimation",
    timestamp: "8m ago",
  },
];

// Entity attribute descriptors — keeps the dashboard labels in one place.
export const PAYLOAD_TYPE_LABELS = {
  file: "FILE",
  link: "LINK",
  text: "SNIPPET",
};

export const ENTITY_NAME = "Payload";
