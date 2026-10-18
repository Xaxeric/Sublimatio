// Sublimatio Dashboard Engine
// Real-time ephemeral buffer management with circular progress expiration

(function () {
  "use strict";

  // Initial Mock Data
  const INITIAL_ITEMS = [
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
      remainingTTL: 35, // Expiring very soon with live circular countdown!
      createdAt: "10s ago",
      hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    },
    {
      id: "sub-t-01",
      type: "text",
      name: "Staging Database Connection URL",
      desc: "Ephemeral connection string with short-lived service role secret",
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
      desc: "Kernel memory trace package captured before client hibernation",
      size: "5.1 MB",
      mime: "application/gzip",
      content: "[GZIP Archive Binary: 5.1 MB]",
      device: "Node #4 (Gateway)",
      totalTTL: 900,
      remainingTTL: 680,
      createdAt: "3m ago",
      hash: "sha256:1a8565a9da720485d2381a37498be9c7d826529c72179d461fd307a615e10eef",
    },
    {
      id: "sub-l-02",
      type: "link",
      name: "Link Google Meet",
      url: "https://github.com/sublimatio",
      desc: "",
      device: "Mobile (Asus Zenfone)",
      totalTTL: 1200,
      remainingTTL: 980,
      createdAt: "5m ago",
      hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "sub-t-02",
      type: "text",
      name: "Lorem Ipsum",
      content: "bla bla bla",
      device: "Mobile (Pixel 8)",
      totalTTL: 600,
      remainingTTL: 510,
      createdAt: "2m ago",
      hash: "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    },
  ];

  const INITIAL_LOGS = [
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
      reason: "Manual Sublimation",
      timestamp: "8m ago",
    },
  ];

  // Application State
  let items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
  let sublimatedLogs = JSON.parse(JSON.stringify(INITIAL_LOGS));
  let currentFilter = "all";
  let searchQuery = "";
  let timerInterval = null;
  const CIRCLE_RADIUS = 15;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~94.25

  // DOM Elements cache
  const el = {
    itemList: document.getElementById("item-list"),
    emptyState: document.getElementById("empty-state"),
    statActive: document.getElementById("stat-active"),
    statExpiring: document.getElementById("stat-expiring"),
    statSublimated: document.getElementById("stat-sublimated"),
    statStorage: document.getElementById("stat-storage"),
    filterBtns: document.querySelectorAll(".filter-btn"),
    searchInput: document.getElementById("search-input"),
    resetBtn: document.getElementById("btn-reset-data"),
    fastTestBtn: document.getElementById("btn-fast-test"),
    btnOpenModal: document.getElementById("btn-open-modal"),
    modalAdd: document.getElementById("modal-add"),
    modalInspect: document.getElementById("modal-inspect"),
    formAdd: document.getElementById("form-add-item"),
    toastContainer: document.getElementById("toast-container"),
    auditList: document.getElementById("audit-list"),
    auditCount: document.getElementById("audit-count"),
  };

  // Helper formatters
  function formatTTL(seconds) {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  }

  function formatShortTTL(seconds) {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  }

  function calculateProgress(item) {
    if (item.totalTTL <= 0) return 1;
    const ratio = Math.max(0, Math.min(1, item.remainingTTL / item.totalTTL));
    return ratio;
  }

  function getUrgencyLevel(remainingSeconds) {
    if (remainingSeconds <= 15) return "critical";
    if (remainingSeconds <= 60) return "warning";
    return "normal";
  }

  // Toast Notification System
  function showToast(message, type = "info", title = "") {
    if (!el.toastContainer) return;

    const toast = document.createElement("div");
    const borderColors = {
      info: "border-blue-500/60 bg-[#080f33]/90 text-sublimatio-text",
      success: "border-emerald-500/60 bg-[#061e1b]/90 text-emerald-200",
      warning: "border-amber-500/60 bg-[#241705]/90 text-amber-200",
      danger: "border-rose-500/70 bg-[#2a0813]/90 text-rose-200",
    };

    const icons = {
      info: '<svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      success:
        '<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',
      warning:
        '<svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
      danger:
        '<svg class="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
    };

    toast.className = `flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${borderColors[type] || borderColors.info}`;
    toast.innerHTML = `
      <div class="mt-0.5 flex-shrink-0">${icons[type] || icons.info}</div>
      <div class="flex-1 min-w-0">
        ${title ? `<p class="font-chakra text-xs font-bold tracking-wider uppercase mb-0.5">${title}</p>` : ""}
        <p class="font-rajdhani text-sm leading-snug break-words">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-white transition-colors text-xs p-1" onclick="this.parentElement.remove()">&times;</button>
    `;

    el.toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Render individual item row
  function createItemRow(item) {
    const row = document.createElement("div");
    row.id = `row-${item.id}`;
    row.dataset.itemId = item.id;
    row.dataset.type = item.type;
    row.className =
      "item-row group relative glass-card glass-card-hover rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 overflow-hidden";

    // Type styling & icon
    let typeBadge = "";
    let typeIcon = "";
    let previewContent = "";

    if (item.type === "file") {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-blue-950/80 text-blue-400 border border-blue-800/60">FILE</span>';
      typeIcon = `
        <div class="w-10 h-10 rounded-lg bg-blue-950/50 border border-blue-900/60 flex items-center justify-center text-blue-400 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>`;
      previewContent = `<span class="text-xs font-mono text-slate-400">${item.size || "0 KB"}</span> &bull; <span class="text-xs text-slate-400">${item.desc}</span>`;
    } else if (item.type === "link") {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">LINK</span>';
      typeIcon = `
        <div class="w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-900/60 flex items-center justify-center text-cyan-400 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>`;
      previewContent = `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-sm truncate">${item.url} <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>`;
    } else {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">SNIPPET</span>';
      typeIcon = `
        <div class="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-900/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>`;
      const charCount = (item.content || "").length;
      previewContent = `<span class="text-xs font-mono text-indigo-300 bg-black/40 px-1.5 py-0.5 rounded border border-indigo-900/40 truncate max-w-md inline-block font-medium">${escapeHtml(item.content || "")}</span> &bull; <span class="text-xs text-slate-400">${charCount} chars</span>`;
    }

    const ratio = calculateProgress(item);
    const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
    const urgency = getUrgencyLevel(item.remainingTTL);

    let ringColor = "stroke-cyan-400 text-cyan-400";
    let ringBg = "stroke-slate-800/80";
    let pulseClass = "";

    if (urgency === "critical") {
      ringColor = "stroke-rose-500 text-rose-500";
      pulseClass = "animate-pulse";
    } else if (urgency === "warning") {
      ringColor = "stroke-amber-400 text-amber-400";
    }

    row.innerHTML = `
      <!-- Left side: Icon, Metadata & Title -->
      <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        ${typeIcon}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h3 class="font-chakra text-sm sm:text-base font-bold text-[#c6cfff] tracking-wide truncate group-hover:text-white transition-colors">
              ${escapeHtml(item.name)}
            </h3>
            ${typeBadge}
            <span class="text-[11px] font-rajdhani text-sublimatio-muted flex items-center gap-1">
              <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              ${item.device}
            </span>
          </div>
          <div class="text-xs text-sublimatio-muted truncate flex items-center gap-2">
            ${previewContent}
          </div>
        </div>
      </div>

      <!-- Right side: Circular Progress TTL Countdown & Action Toolbar -->
      <div class="flex items-center justify-between md:justify-end gap-5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#0a102e]/60">
        <!-- Circular Load Progress Indicator -->
        <div class="flex items-center gap-3" title="Expires in ${formatTTL(item.remainingTTL)} (Total TTL: ${formatTTL(item.totalTTL)})">
          <div class="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
            <svg class="w-12 h-12 circular-progress-ring -rotate-90" viewBox="0 0 36 36">
              <!-- Background Ring -->
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                class="${ringBg}"
                stroke-width="2.8"
              />
              <!-- Animated Progress Indicator Ring -->
              <circle
                id="ring-${item.id}"
                cx="18"
                cy="18"
                r="15"
                fill="none"
                class="transition-all duration-1000 ease-linear ${ringColor} ${pulseClass}"
                stroke-width="2.8"
                stroke-dasharray="${CIRCLE_CIRCUMFERENCE}"
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"
              />
            </svg>
            <!-- Center Time Label -->
            <span id="label-${item.id}" class="absolute font-mono text-[11px] font-bold tracking-tight ${ringColor.split(" ")[1]}">
              ${formatShortTTL(item.remainingTTL)}
            </span>
          </div>
          <div class="text-left">
            <div id="status-${item.id}" class="text-[10px] font-chakra uppercase font-bold tracking-wider ${urgency === "critical" ? "text-rose-400" : "text-slate-400"}">
              ${urgency === "critical" ? "EXPIRES SOON" : "TTL BUFFER"}
            </div>
            <div id="full-ttl-${item.id}" class="text-xs font-mono text-slate-300">
              ${formatTTL(item.remainingTTL)}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          ${getActionButtons(item)}
          <!-- Sublimate / Wipe Button -->
          <button
            type="button"
            class="btn-sublimate px-2.5 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 hover:border-rose-600/70 text-rose-300 hover:text-white transition-all text-xs font-chakra uppercase tracking-wider flex items-center gap-1.5"
            data-id="${item.id}"
            title="Sublimate immediately (Delete from RAM)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="hidden sm:inline">Vanish</span>
          </button>
        </div>
      </div>
    `;

    return row;
  }

  function getActionButtons(item) {
    let specificBtn = "";

    if (item.type === "file") {
      specificBtn = `
        <button
          type="button"
          class="btn-download px-2.5 py-1.5 rounded bg-blue-950/50 hover:bg-blue-900/70 border border-blue-800/60 text-blue-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1"
          data-id="${item.id}"
          title="Download mock file payload"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Fetch</span>
        </button>
      `;
    } else if (item.type === "link") {
      specificBtn = `
        <button
          type="button"
          class="btn-copy-url px-2.5 py-1.5 rounded bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800/60 text-cyan-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1"
          data-url="${escapeHtml(item.url)}"
          title="Copy URL to clipboard"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span class="hidden sm:inline">Copy</span>
        </button>
      `;
    } else if (item.type === "text") {
      specificBtn = `
        <button
          type="button"
          class="btn-copy-text px-2.5 py-1.5 rounded bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-800/60 text-indigo-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1"
          data-id="${item.id}"
          title="Copy text snippet to clipboard"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="hidden sm:inline">Copy</span>
        </button>
      `;
    }

    return `
      ${specificBtn}
      <!-- Inspect Details Button -->
      <button
        type="button"
        class="btn-inspect px-2 py-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs"
        data-id="${item.id}"
        title="Inspect item cryptographic payload & details"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    `;
  }

  // Render complete items list
  function renderList() {
    if (!el.itemList) return;

    el.itemList.innerHTML = "";

    const filtered = items.filter((item) => {
      const matchType = currentFilter === "all" || item.type === currentFilter;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery)) ||
        (item.content && item.content.toLowerCase().includes(searchQuery)) ||
        (item.url && item.url.toLowerCase().includes(searchQuery));
      return matchType && matchSearch;
    });

    if (filtered.length === 0) {
      if (el.emptyState) el.emptyState.classList.remove("hidden");
    } else {
      if (el.emptyState) el.emptyState.classList.add("hidden");
      filtered.forEach((item) => {
        el.itemList.appendChild(createItemRow(item));
      });
    }

    updateStats();
    attachEventListeners();
  }

  // Live Timer Tick function (updates every second)
  function handleTimerTick() {
    let expiredItems = [];

    items.forEach((item) => {
      item.remainingTTL -= 1;

      if (item.remainingTTL <= 0) {
        expiredItems.push(item);
      } else {
        // Update live SVG progress ring & labels
        const ring = document.getElementById(`ring-${item.id}`);
        const label = document.getElementById(`label-${item.id}`);
        const fullTtl = document.getElementById(`full-ttl-${item.id}`);
        const statusEl = document.getElementById(`status-${item.id}`);

        if (ring && label) {
          const ratio = calculateProgress(item);
          const offset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
          ring.style.strokeDashoffset = offset;

          label.textContent = formatShortTTL(item.remainingTTL);
          if (fullTtl) fullTtl.textContent = formatTTL(item.remainingTTL);

          const urgency = getUrgencyLevel(item.remainingTTL);
          if (urgency === "critical") {
            ring.className = `transition-all duration-1000 ease-linear stroke-rose-500 text-rose-500 animate-pulse`;
            label.className = `absolute font-mono text-[11px] font-bold tracking-tight text-rose-500`;
            if (statusEl) {
              statusEl.textContent = "EXPIRES SOON";
              statusEl.className =
                "text-[10px] font-chakra uppercase font-bold tracking-wider text-rose-400";
            }
          } else if (urgency === "warning") {
            ring.className = `transition-all duration-1000 ease-linear stroke-amber-400 text-amber-400`;
            label.className = `absolute font-mono text-[11px] font-bold tracking-tight text-amber-400`;
            if (statusEl) {
              statusEl.textContent = "EXPIRING";
              statusEl.className =
                "text-[10px] font-chakra uppercase font-bold tracking-wider text-amber-400";
            }
          }
        }
      }
    });

    // Handle expired items: trigger dissolution & deletion
    if (expiredItems.length > 0) {
      expiredItems.forEach((expItem) => {
        triggerSublimation(expItem.id, "TTL Expired (0s)");
      });
    }

    updateStats();
  }

  // Sublimate / Delete an item with visual dissolution
  function triggerSublimation(itemId, reason = "Manual Vanish") {
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = items[itemIndex];
    const row = document.getElementById(`row-${itemId}`);

    // Update circular ring to red 0s immediately
    const ring = document.getElementById(`ring-${itemId}`);
    const label = document.getElementById(`label-${itemId}`);
    const statusEl = document.getElementById(`status-${itemId}`);

    if (ring) {
      ring.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
      ring.className = "stroke-rose-600 text-rose-600";
    }
    if (label) {
      label.textContent = "0s";
      label.className =
        "absolute font-mono text-[11px] font-bold tracking-tight text-rose-500";
    }
    if (statusEl) {
      statusEl.textContent = "SUBLIMATED";
      statusEl.className =
        "text-[10px] font-chakra uppercase font-bold tracking-wider text-rose-500";
    }

    // Apply dissolution keyframes
    if (row) {
      row.style.pointerEvents = "none";
      row.classList.add("animate-fade-sublimate");
    }

    // Archive into sublimated logs
    sublimatedLogs.unshift({
      name: item.name,
      type: item.type,
      size: item.size || `${(item.content || "").length} B`,
      reason: reason,
      timestamp: "Just now",
    });
    renderAuditLogs();

    // Show toast
    const isFile = item.type === "file";
    showToast(
      `Temporary ${item.type} "${item.name}" has expired and sublimated from server memory.`,
      "danger",
      "Item Sublimated",
    );

    // Remove from array after animation completes
    setTimeout(() => {
      items = items.filter((i) => i.id !== itemId);
      if (row) row.remove();

      if (items.length === 0 && el.emptyState) {
        el.emptyState.classList.remove("hidden");
      }
      updateStats();
    }, 800);
  }

  // Update statistics dashboard indicators
  function updateStats() {
    if (el.statActive) el.statActive.textContent = items.length;

    const expiringCount = items.filter((i) => i.remainingTTL <= 60).length;
    if (el.statExpiring) {
      el.statExpiring.textContent = expiringCount;
      if (expiringCount > 0) {
        el.statExpiring.classList.add("text-rose-400");
        el.statExpiring.classList.remove("text-slate-200");
      } else {
        el.statExpiring.classList.remove("text-rose-400");
        el.statExpiring.classList.add("text-slate-200");
      }
    }

    if (el.statSublimated)
      el.statSublimated.textContent = sublimatedLogs.length;

    // Approximate size calculation
    let totalMB = 0;
    items.forEach((i) => {
      if (i.size && i.size.includes("MB")) totalMB += parseFloat(i.size);
      else if (i.size && i.size.includes("KB"))
        totalMB += parseFloat(i.size) / 1024;
      else totalMB += 0.05;
    });
    if (el.statStorage) el.statStorage.textContent = `${totalMB.toFixed(1)} MB`;
  }

  // Render Sublimated audit logs
  function renderAuditLogs() {
    if (!el.auditList) return;
    if (el.auditCount) el.auditCount.textContent = `(${sublimatedLogs.length})`;

    el.auditList.innerHTML = "";
    sublimatedLogs.slice(0, 6).forEach((log) => {
      const entry = document.createElement("div");
      entry.className =
        "flex items-center justify-between text-xs py-2 border-b border-[#0a102e]/70 text-slate-400 font-mono";
      entry.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
          <span class="truncate text-slate-300 font-medium">${escapeHtml(log.name)}</span>
          <span class="text-[10px] text-slate-500 uppercase px-1 rounded bg-black/40 border border-slate-800">${log.type}</span>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0 text-[11px]">
          <span class="text-rose-400/80">${log.reason}</span>
          <span class="text-slate-500">${log.timestamp}</span>
        </div>
      `;
      el.auditList.appendChild(entry);
    });
  }

  // Attach button and interaction listeners
  function attachEventListeners() {
    // Sublimate manual vanish buttons
    document.querySelectorAll(".btn-sublimate").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        triggerSublimation(id, "User Triggered Vanish");
      };
    });

    // Copy URL
    document.querySelectorAll(".btn-copy-url").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        navigator.clipboard
          .writeText(url)
          .then(() => {
            showToast(
              `Copied URL to clipboard: ${url}`,
              "success",
              "Link Copied",
            );
          })
          .catch(() => {
            showToast("Failed to write to clipboard", "warning");
          });
      };
    });

    // Copy Text
    document.querySelectorAll(".btn-copy-text").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = items.find((i) => i.id === id);
        if (item && item.content) {
          navigator.clipboard.writeText(item.content).then(() => {
            showToast(
              `Copied snippet "${item.name}" to clipboard`,
              "success",
              "Text Copied",
            );
          });
        }
      };
    });

    // Download mock file
    document.querySelectorAll(".btn-download").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const blob = new Blob(
          [item.content || "Sublimatio Ephemeral File Payload"],
          {
            type: item.mime || "application/octet-stream",
          },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(
          `Downloaded temporary payload for ${item.name}`,
          "info",
          "File Download",
        );
      };
    });

    // Inspect details
    document.querySelectorAll(".btn-inspect").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openInspectModal(id);
      };
    });

    // Row click to inspect
    document.querySelectorAll(".item-row").forEach((row) => {
      row.onclick = (e) => {
        // avoid double clicking if clicking interactive buttons
        if (e.target.closest("button") || e.target.closest("a")) return;
        const id = row.dataset.itemId;
        openInspectModal(id);
      };
    });
  }

  // Inspect Modal
  function openInspectModal(id) {
    const item = items.find((i) => i.id === id);
    if (!item || !el.modalInspect) return;

    document.getElementById("inspect-name").textContent = item.name;
    document.getElementById("inspect-type").textContent =
      item.type.toUpperCase();
    document.getElementById("inspect-device").textContent = item.device;
    document.getElementById("inspect-ttl").textContent =
      `${formatTTL(item.remainingTTL)} (Total: ${formatTTL(item.totalTTL)})`;
    document.getElementById("inspect-hash").textContent = item.hash || "N/A";
    document.getElementById("inspect-desc").textContent =
      item.desc || "No description provided";

    const contentBox = document.getElementById("inspect-content");
    if (item.type === "link") {
      contentBox.textContent = `TARGET URL:\n${item.url}`;
    } else if (item.type === "text") {
      contentBox.textContent = item.content || "(empty)";
    } else {
      contentBox.textContent = `FILE METADATA:\nName: ${item.name}\nSize: ${item.size}\nMIME: ${item.mime}\n\nRAW CONTENT PREVIEW:\n${item.content || "[Binary stream buffer]"}`;
    }

    el.modalInspect.classList.remove("hidden");
  }

  // Escape HTML string
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initialize event handlers
  function initHandlers() {
    // Filter buttons
    el.filterBtns.forEach((btn) => {
      btn.onclick = () => {
        el.filterBtns.forEach((b) => {
          b.classList.remove(
            "bg-sublimatio-accent/30",
            "text-white",
            "border-blue-500",
          );
          b.classList.add("text-sublimatio-muted", "border-[#0a102e]");
        });
        btn.classList.add(
          "bg-sublimatio-accent/30",
          "text-white",
          "border-blue-500",
        );
        btn.classList.remove("text-sublimatio-muted", "border-[#0a102e]");

        currentFilter = btn.dataset.filter;
        renderList();
      };
    });

    // Search Input
    if (el.searchInput) {
      el.searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderList();
      };
    }

    // Reset Mock Data Button
    if (el.resetBtn) {
      el.resetBtn.onclick = () => {
        items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
        showToast(
          "Restored all default mock data items with fresh timers",
          "info",
          "Buffer Reset",
        );
        renderList();
      };
    }

    // Fast Test: 15-second expiring file
    if (el.fastTestBtn) {
      el.fastTestBtn.onclick = () => {
        const id = "fast-" + Date.now().toString(36);
        const fastItem = {
          id: id,
          type: "file",
          name: `fast-expiring-voucher-${Math.floor(Math.random() * 900 + 100)}.pdf`,
          desc: "Temporary sensitive transfer payload. Watch circular loader count down and vanish!",
          size: "340 KB",
          mime: "application/pdf",
          content: "%PDF-1.4 [Ephemeral Sublimatio Temporary Voucher Document]",
          device: "Mobile (Pixel 8)",
          totalTTL: 15,
          remainingTTL: 15,
          createdAt: "Just now",
          hash:
            "sha256:" +
            Math.random().toString(36).substring(2) +
            Math.random().toString(36).substring(2),
        };

        items.unshift(fastItem);
        showToast(
          "Added fast-expiring temporary file (15s TTL). Watch it sublimate!",
          "warning",
          "Fast Expire Test",
        );
        renderList();
      };
    }

    // Modal controls: Open Add
    if (el.btnOpenModal && el.modalAdd) {
      el.btnOpenModal.onclick = () => {
        el.modalAdd.classList.remove("hidden");
      };
    }

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.onclick = () => {
        if (el.modalAdd) el.modalAdd.classList.add("hidden");
        if (el.modalInspect) el.modalInspect.classList.add("hidden");
      };
    });

    // Handle Add Form Submission
    if (el.formAdd) {
      // Toggle form fields based on type select
      const typeSelect = document.getElementById("add-type");
      const fileGroup = document.getElementById("group-file");
      const urlGroup = document.getElementById("group-url");
      const textGroup = document.getElementById("group-text");

      if (typeSelect) {
        typeSelect.onchange = () => {
          const val = typeSelect.value;
          fileGroup.classList.toggle("hidden", val !== "file");
          urlGroup.classList.toggle("hidden", val !== "link");
          textGroup.classList.toggle("hidden", val !== "text");
        };
      }

      el.formAdd.onsubmit = (e) => {
        e.preventDefault();
        const type = typeSelect.value;
        const name = document.getElementById("add-name").value.trim();
        const ttl = parseInt(document.getElementById("add-ttl").value, 10);
        const device =
          document.getElementById("add-device").value.trim() || "Local Client";

        let newItem = {
          id: "user-" + Date.now().toString(36),
          type: type,
          name: name,
          desc:
            document.getElementById("add-desc").value.trim() ||
            "Shared item via dashboard",
          device: device,
          totalTTL: ttl,
          remainingTTL: ttl,
          createdAt: "Just now",
          hash: "sha256:" + Math.random().toString(36).substring(2),
        };

        if (type === "file") {
          const fileInput = document.getElementById("add-file-input");
          const fileName = fileInput.files[0] ? fileInput.files[0].name : name;
          newItem.name = fileName;
          newItem.size = fileInput.files[0]
            ? `${(fileInput.files[0].size / 1024).toFixed(1)} KB`
            : "128 KB";
          newItem.mime = fileInput.files[0]
            ? fileInput.files[0].type
            : "application/octet-stream";
          newItem.content = `[File binary buffer: ${newItem.name}]`;
        } else if (type === "link") {
          newItem.url = document.getElementById("add-url-input").value.trim();
        } else {
          newItem.content = document
            .getElementById("add-text-input")
            .value.trim();
        }

        items.unshift(newItem);
        el.modalAdd.classList.add("hidden");
        el.formAdd.reset();
        // trigger type change to reset fields
        typeSelect.dispatchEvent(new Event("change"));

        showToast(
          `Published "${newItem.name}" to temporary buffer (${formatTTL(ttl)} TTL)`,
          "success",
          "Item Shared",
        );
        renderList();
      };
    }
  }

  // Start continuous loop
  function startEngine() {
    renderList();
    renderAuditLogs();
    initHandlers();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(handleTimerTick, 1000);
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startEngine);
  } else {
    startEngine();
  }
})();
