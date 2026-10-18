(function () {
  "use strict";

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
      url: "https://github.com/sublimatio",
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
      size: "N/A",
      reason: "Manual Sublimation",
      timestamp: "8m ago",
    },
  ];

  let items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
  let sublimatedLogs = JSON.parse(JSON.stringify(INITIAL_LOGS));
  let currentFilter = "all";
  let currentSort = "ttl-asc";
  let searchQuery = "";
  let timerInterval = null;

  // SVG circular progress ring geometry constants
  const CIRCLE_RADIUS = 15;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~94.25

  /**
   * Pure data processing function: calculates buffer metrics (active count, expiring count, RAM usage).
   */
  function calculateBufferStats(itemList, logsList) {
    const totalActive = itemList.length;
    const expiringCount = itemList.filter(function (item) {
      return item.remainingTTL <= 60;
    }).length;
    const totalSublimated = logsList.length;

    let totalMB = 0;
    itemList.forEach(function (item) {
      if (item.size && item.size.indexOf("MB") !== -1) {
        totalMB += parseFloat(item.size);
      } else if (item.size && item.size.indexOf("KB") !== -1) {
        totalMB += parseFloat(item.size) / 1024;
      } else if (item.content) {
        totalMB += item.content.length / (1024 * 1024);
      } else {
        totalMB += 0.05;
      }
    });

    return {
      totalActive: totalActive,
      expiringCount: expiringCount,
      totalSublimated: totalSublimated,
      storageMB: totalMB.toFixed(1) + " MB",
    };
  }

  /**
   * Filters items by category (all/file/link/text) and search keyword.
   */
  function filterItems(itemList, filterType, query) {
    return itemList.filter(function (item) {
      const matchesType = filterType === "all" || item.type === filterType;

      let matchesSearch = true;
      if (query && query.length > 0) {
        const q = query.toLowerCase();
        const inName = item.name && item.name.toLowerCase().indexOf(q) !== -1;
        const inContent =
          item.content && item.content.toLowerCase().indexOf(q) !== -1;
        const inUrl = item.url && item.url.toLowerCase().indexOf(q) !== -1;
        matchesSearch = inName || inContent || inUrl;
      }

      return matchesType && matchesSearch;
    });
  }

  /**
   * Sorts items by TTL or Name criteria.
   */
  function sortItems(itemList, sortBy) {
    const listCopy = itemList.slice();
    return listCopy.sort(function (a, b) {
      switch (sortBy) {
        case "ttl-asc":
          return a.remainingTTL - b.remainingTTL;
        case "ttl-desc":
          return b.remainingTTL - a.remainingTTL;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  function formatTTL(seconds) {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return seconds + "s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? mins + "m" : mins + "m " + secs + "s";
  }

  function formatShortTTL(seconds) {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return seconds + "s";
    const mins = Math.floor(seconds / 60);
    return mins + "m";
  }

  function calculateProgress(remainingTTL, totalTTL) {
    if (totalTTL <= 0) return 0;
    return Math.max(0, Math.min(1, remainingTTL / totalTTL));
  }

  function getUrgencyLevel(remainingTTL) {
    if (remainingTTL <= 15) return "critical";
    if (remainingTTL <= 60) return "warning";
    return "normal";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Generates HTML markup for an individual buffer item row.
   */
  function buildItemRowHTML(item) {
    let typeBadge = "";
    let typeIcon = "";
    let previewContent = "";

    if (item.type === "file") {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-blue-950/80 text-blue-400 border border-blue-800/60">FILE</span>';
      typeIcon =
        '<div class="w-10 h-10 rounded-lg bg-blue-950/50 border border-blue-900/60 flex items-center justify-center text-blue-400 flex-shrink-0">' +
        '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />' +
        "</svg></div>";
      previewContent =
        '<span class="text-xs font-mono text-slate-400">' +
        (item.size || "0 KB") +
        '</span> &bull; <span class="text-xs font-mono text-slate-400">' +
        escapeHtml(item.mime || "application/octet-stream") +
        "</span>";
    } else if (item.type === "link") {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">LINK</span>';
      typeIcon =
        '<div class="w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-900/60 flex items-center justify-center text-cyan-400 flex-shrink-0">' +
        '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />' +
        "</svg></div>";
      previewContent =
        '<a href="' +
        escapeHtml(item.url) +
        '" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-sm truncate">' +
        escapeHtml(item.url) +
        ' <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>';
    } else {
      typeBadge =
        '<span class="px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">SNIPPET</span>';
      typeIcon =
        '<div class="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-900/60 flex items-center justify-center text-indigo-400 flex-shrink-0">' +
        '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />' +
        "</svg></div>";
      const charCount = (item.content || "").length;
      previewContent =
        '<span class="text-xs font-mono text-indigo-300 bg-black/40 px-1.5 py-0.5 rounded border border-indigo-900/40 truncate max-w-md inline-block font-medium">' +
        escapeHtml(item.content || "") +
        '</span> &bull; <span class="text-xs text-slate-400">' +
        charCount +
        " chars</span>";
    }

    const ratio = calculateProgress(item.remainingTTL, item.totalTTL);
    const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
    const urgency = getUrgencyLevel(item.remainingTTL);

    let ringColor = "stroke-cyan-400 text-cyan-400";
    let ringBg = "stroke-slate-800/80";
    let pulseClass = "";

    if (urgency === "critical") {
      ringColor = "stroke-sublimatio-red text-sublimatio-red";
      pulseClass = "animate-pulse";
    } else if (urgency === "warning") {
      ringColor = "stroke-amber-400 text-amber-400";
    }

    let specificActionBtn = "";
    if (item.type === "file") {
      specificActionBtn =
        '<button type="button" class="btn-download px-2.5 py-1.5 rounded bg-blue-950/50 hover:bg-blue-900/70 border border-blue-800/60 text-blue-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1" data-id="' +
        item.id +
        '" title="Fetch ephemeral payload">' +
        '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>' +
        '<span class="hidden sm:inline">Fetch</span></button>';
    } else if (item.type === "link") {
      specificActionBtn =
        '<button type="button" class="btn-copy-url px-2.5 py-1.5 rounded bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800/60 text-cyan-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1" data-url="' +
        escapeHtml(item.url) +
        '" title="Copy URL to clipboard">' +
        '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>' +
        '<span class="hidden sm:inline">Copy</span></button>';
    } else {
      specificActionBtn =
        '<button type="button" class="btn-copy-text px-2.5 py-1.5 rounded bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-800/60 text-indigo-300 hover:text-white transition-all text-xs font-chakra tracking-wider flex items-center gap-1" data-id="' +
        item.id +
        '" title="Copy text to clipboard">' +
        '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>' +
        '<span class="hidden sm:inline">Copy</span></button>';
    }

    return (
      '<div id="row-' +
      item.id +
      '" data-item-id="' +
      item.id +
      '" data-type="' +
      item.type +
      '" class="item-row group relative glass-card glass-card-hover rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 overflow-hidden cursor-pointer">' +
      '<div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">' +
      typeIcon +
      '<div class="flex-1 min-w-0">' +
      '<div class="flex items-center gap-2 flex-wrap mb-1">' +
      '<h3 class="font-chakra text-sm sm:text-base font-bold text-[#c6cfff] tracking-wide truncate group-hover:text-white transition-colors">' +
      escapeHtml(item.name) +
      "</h3>" +
      typeBadge +
      '<span class="text-[11px] font-rajdhani text-sublimatio-muted flex items-center gap-1">' +
      '<svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>' +
      escapeHtml(item.device) +
      "</span></div>" +
      '<div class="text-xs text-sublimatio-muted truncate flex items-center gap-2">' +
      previewContent +
      "</div></div></div>" +
      '<div class="flex items-center justify-between md:justify-end gap-5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#0a102e]/60">' +
      '<div class="flex items-center gap-3" title="Expires in ' +
      formatTTL(item.remainingTTL) +
      '">' +
      '<div class="relative flex items-center justify-center w-12 h-12 flex-shrink-0">' +
      '<svg class="w-12 h-12 circular-progress-ring -rotate-90" viewBox="0 0 36 36">' +
      '<circle cx="18" cy="18" r="15" fill="none" class="' +
      ringBg +
      '" stroke-width="2.8" />' +
      '<circle id="ring-' +
      item.id +
      '" cx="18" cy="18" r="15" fill="none" class="transition-all duration-1000 ease-linear ' +
      ringColor +
      " " +
      pulseClass +
      '" stroke-width="2.8" stroke-dasharray="' +
      CIRCLE_CIRCUMFERENCE +
      '" stroke-dashoffset="' +
      strokeDashoffset +
      '" stroke-linecap="round" />' +
      "</svg>" +
      '<span id="label-' +
      item.id +
      '" class="absolute font-mono text-[11px] font-bold tracking-tight ' +
      (urgency === "critical"
        ? "text-sublimatio-red"
        : urgency === "warning"
          ? "text-amber-400"
          : "text-cyan-400") +
      '">' +
      formatShortTTL(item.remainingTTL) +
      "</span></div>" +
      '<div class="text-left">' +
      '<div id="status-' +
      item.id +
      '" class="text-[10px] font-chakra uppercase font-bold tracking-wider ' +
      (urgency === "critical"
        ? "text-sublimatio-red"
        : urgency === "warning"
          ? "text-amber-400"
          : "text-slate-400") +
      '">' +
      (urgency === "critical" ? "EXPIRES SOON" : "TTL BUFFER") +
      "</div>" +
      '<div id="full-ttl-' +
      item.id +
      '" class="text-xs font-mono text-slate-300">' +
      formatTTL(item.remainingTTL) +
      "</div></div></div>" +
      '<div class="flex items-center gap-1.5 flex-shrink-0">' +
      specificActionBtn +
      '<button type="button" class="btn-inspect px-2 py-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs" data-id="' +
      item.id +
      '" title="Inspect payload details">' +
      '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>' +
      '<button type="button" class="btn-sublimate px-2.5 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 hover:border-rose-600/70 text-sublimatio-red hover:text-white transition-all text-xs font-chakra uppercase tracking-wider flex items-center gap-1.5" data-id="' +
      item.id +
      '" title="Sublimate immediately (Delete from RAM)">' +
      '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>' +
      '<span class="hidden sm:inline">Vanish</span></button>' +
      "</div></div></div>"
    );
  }

  /**
   * Renders filtered and sorted buffer items to DOM.
   */
  function renderBufferList() {
    const listContainer = document.getElementById("item-list");
    const emptyState = document.getElementById("empty-state");
    if (!listContainer) return;

    const filtered = filterItems(items, currentFilter, searchQuery);
    const sorted = sortItems(filtered, currentSort);

    listContainer.innerHTML = "";

    if (sorted.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
    } else {
      if (emptyState) emptyState.style.display = "none";

      let htmlContent = "";
      sorted.forEach(function (item) {
        htmlContent += buildItemRowHTML(item);
      });
      listContainer.innerHTML = htmlContent;
    }
  }

  /**
   * Renders ephemeral sublimation history records.
   */
  function renderAuditLogsUI() {
    const auditList = document.getElementById("audit-list");
    const auditCount = document.getElementById("audit-count");
    if (!auditList) return;

    if (auditCount) {
      auditCount.textContent = "(" + sublimatedLogs.length + ")";
    }

    let logsHTML = "";
    sublimatedLogs.slice(0, 6).forEach(function (log) {
      logsHTML +=
        '<div class="flex items-center justify-between text-xs sm:text-sm py-2.5 border-b border-[#0a102e]/70 text-slate-300 font-mono">' +
        '<div class="flex items-center gap-2.5 truncate">' +
        '<span class="w-2 h-2 rounded-full bg-sublimatio-red flex-shrink-0"></span>' +
        '<span class="truncate text-slate-200 font-semibold text-sm sm:text-base font-rajdhani">' +
        escapeHtml(log.name) +
        "</span>" +
        '<span class="text-xs text-slate-400 uppercase px-1.5 py-0.5 rounded bg-black/50 border border-slate-800 font-chakra font-medium">' +
        escapeHtml(log.type) +
        "</span></div>" +
        '<div class="flex items-center gap-3.5 flex-shrink-0 text-xs sm:text-sm">' +
        '<span class="text-sublimatio-red font-mono font-medium">' +
        escapeHtml(log.reason) +
        "</span>" +
        '<span class="text-slate-400 font-mono">' +
        escapeHtml(log.timestamp) +
        "</span></div></div>";
    });

    auditList.innerHTML = logsHTML;
  }

  /**
   * 1-second countdown tick handler for real-time TTL updates.
   */
  function handleTimerTick() {
    let expiredItems = [];

    items.forEach(function (item) {
      item.remainingTTL -= 1;

      if (item.remainingTTL <= 0) {
        expiredItems.push(item);
      } else {
        const ring = document.getElementById("ring-" + item.id);
        const label = document.getElementById("label-" + item.id);
        const fullTtl = document.getElementById("full-ttl-" + item.id);
        const statusEl = document.getElementById("status-" + item.id);

        if (ring && label) {
          const ratio = calculateProgress(item.remainingTTL, item.totalTTL);
          const offset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
          ring.style.strokeDashoffset = offset;
          label.textContent = formatShortTTL(item.remainingTTL);
          if (fullTtl) fullTtl.textContent = formatTTL(item.remainingTTL);

          const urgency = getUrgencyLevel(item.remainingTTL);
          if (urgency === "critical") {
            ring.className.baseVal =
              "transition-all duration-1000 ease-linear stroke-sublimatio-red text-sublimatio-red animate-pulse";
            label.className =
              "absolute font-mono text-[11px] font-bold tracking-tight text-sublimatio-red";
            if (statusEl) {
              statusEl.textContent = "EXPIRES SOON";
              statusEl.className =
                "text-[10px] font-chakra uppercase font-bold tracking-wider text-sublimatio-red";
            }
          } else if (urgency === "warning") {
            ring.className.baseVal =
              "transition-all duration-1000 ease-linear stroke-amber-400 text-amber-400";
            label.className =
              "absolute font-mono text-[11px] font-bold tracking-tight text-amber-400";
            if (statusEl) {
              statusEl.textContent = "EXPIRING";
              statusEl.className =
                "text-[10px] font-chakra uppercase font-bold tracking-wider text-amber-400";
            }
          }
        }
      }
    });

    if (expiredItems.length > 0) {
      expiredItems.forEach(function (expItem) {
        sublimateItem(expItem.id, "TTL Expired (0s)");
      });
    }
  }

  function showToast(message, type, title) {
    type = type || "info";
    title = title || "";

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
        '<svg class="w-4 h-4 text-sublimatio-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
    };

    const colorClass = borderColors[type] || borderColors.info;
    const iconSvg = icons[type] || icons.info;

    const $toast = $(
      '<div class="flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-auto ' +
        colorClass +
        '">' +
        '<div class="mt-0.5 flex-shrink-0">' +
        iconSvg +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        (title
          ? '<p class="font-chakra text-xs font-bold tracking-wider uppercase mb-0.5">' +
            escapeHtml(title) +
            "</p>"
          : "") +
        '<p class="font-rajdhani text-sm leading-snug break-words">' +
        escapeHtml(message) +
        "</p>" +
        "</div>" +
        '<button type="button" class="btn-dismiss-toast text-slate-400 hover:text-white transition-colors text-base p-1 leading-none">&times;</button>' +
        "</div>",
    );

    $toast.hide().appendTo("#toast-container").fadeIn(300);

    $toast.find(".btn-dismiss-toast").on("click", function () {
      $toast.fadeOut(200, function () {
        $(this).remove();
      });
    });

    setTimeout(function () {
      $toast.fadeOut(400, function () {
        $(this).remove();
      });
    }, 4500);
  }

  /**
   * Purges an ephemeral item with jQuery slideUp animation and records to audit log.
   */
  function sublimateItem(itemId, reason) {
    reason = reason || "Manual Vanish";
    const itemIndex = items.findIndex(function (i) {
      return i.id === itemId;
    });
    if (itemIndex === -1) return;

    const item = items[itemIndex];
    const $row = $("#row-" + itemId);

    sublimatedLogs.unshift({
      name: item.name,
      type: item.type,
      size: item.size || item.content.length + " B",
      reason: reason,
      timestamp: "Just now",
    });
    renderAuditLogsUI();

    showToast(
      "Ephemeral " +
        item.type +
        ' "' +
        item.name +
        '" sublimated from volatile RAM memory.',
      "danger",
      "Memory Purged",
    );

    if ($row.length) {
      $row.css("pointer-events", "none").addClass("animate-fade-sublimate");
      setTimeout(function () {
        $row.slideUp(350, function () {
          $(this).remove();
          items = items.filter(function (i) {
            return i.id !== itemId;
          });

          if (items.length === 0) {
            $("#empty-state").css("display", "flex").hide().fadeIn(300);
          }
        });
      }, 400);
    } else {
      items = items.filter(function (i) {
        return i.id !== itemId;
      });
      renderBufferList();
    }
  }

  function copyToClipboard(text, successTitle, successMsg) {
    if (!navigator.clipboard) {
      showToast("Clipboard API unavailable", "warning");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(function () {
        showToast(successMsg, "success", successTitle);
      })
      .catch(function () {
        showToast("Failed to copy to clipboard", "warning");
      });
  }

  function downloadMockFile(item) {
    const blob = new Blob(
      [item.content || "Sublimatio Ephemeral File Buffer"],
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
      "Downloaded temporary file: " + item.name,
      "info",
      "File Payload",
    );
  }

  /**
   * Opens the inspect modal dialog using jQuery fadeIn.
   */
  function openInspectModal(itemId) {
    const item = items.find(function (i) {
      return i.id === itemId;
    });
    if (!item) return;

    $("#inspect-name").text(item.name);
    $("#inspect-type").text(item.type.toUpperCase());
    $("#inspect-device").text(item.device);
    $("#inspect-ttl").text(
      formatTTL(item.remainingTTL) +
        " (Total: " +
        formatTTL(item.totalTTL) +
        ")",
    );

    // SHA-256 Fingerprint: strictly shown for file payloads only
    if (item.type === "file" && item.hash) {
      $("#inspect-hash-container").show();
      $("#inspect-hash").text(item.hash);
    } else {
      $("#inspect-hash-container").hide();
    }

    $("#copy-inspect-label").text("Copy");

    const $contentBox = $("#inspect-content");
    if (item.type === "link") {
      $contentBox.text("TARGET URL:\n" + item.url);
    } else if (item.type === "text") {
      $contentBox.text(item.content || "(empty)");
    } else {
      $contentBox.text(
        "FILE METADATA:\nName: " +
          item.name +
          "\nSize: " +
          (item.size || "Unknown") +
          "\nMIME: " +
          (item.mime || "application/octet-stream") +
          "\n\nCONTENT PREVIEW:\n" +
          (item.content || "[Binary buffer stream]"),
      );
    }

    $("#modal-inspect").fadeIn(200).css("display", "flex");
  }

  /**
   * Attaches jQuery event handlers for user interactions and form validation.
   */
  function initJQueryInteractions() {
    // Filter buttons
    $(".filter-btn").on("click", function () {
      $(".filter-btn")
        .removeClass("bg-sublimatio-accent/30 text-white border-blue-500")
        .addClass("text-sublimatio-tertiary border-transparent");

      $(this)
        .addClass("bg-sublimatio-accent/30 text-white border-blue-500")
        .removeClass("text-sublimatio-tertiary border-transparent");

      currentFilter = $(this).data("filter");
      renderBufferList();
    });

    // Real-time search query input
    $("#search-input").on("input keyup", function () {
      searchQuery = $(this).val().trim().toLowerCase();
      renderBufferList();
    });

    // Sorting dropdown
    $("#sort-select").on("change", function () {
      currentSort = $(this).val();
      renderBufferList();
    });

    // Open add item modal
    $("#btn-open-modal").on("click", function () {
      $("#form-error").hide();
      $("#modal-add").fadeIn(200).css("display", "flex");
      $("#add-name").trigger("focus");
    });

    // Close modals
    $(document).on("click", ".modal-close", function () {
      $("#modal-add, #modal-inspect").fadeOut(200);
    });

    $("#modal-add, #modal-inspect").on("click", function (e) {
      if (e.target === this) {
        $(this).fadeOut(200);
      }
    });

    // Toggle LOG section visibility
    $("#btn-toggle-audit").on("click", function () {
      $("#audit-list-container").slideToggle(250, function () {
        if ($("#audit-list-container").is(":visible")) {
          $("#audit-toggle-icon").addClass("rotate-180");
        } else {
          $("#audit-toggle-icon").removeClass("rotate-180");
        }
      });
    });

    // Switch input fields based on payload type
    $("#add-type").on("change", function () {
      const selectedType = $(this).val();
      $("#group-file").toggle(selectedType === "file");
      $("#group-url").toggle(selectedType === "link");
      $("#group-text").toggle(selectedType === "text");
    });

    // Form submission with client-side validation
    $("#form-add-item").on("submit", function (e) {
      e.preventDefault();

      const name = $("#add-name").val().trim();
      const type = $("#add-type").val();
      const ttl = parseInt($("#add-ttl").val(), 10) || 300;
      const device = "Workstation (Desktop)";

      let validationError = "";

      if (!name) {
        validationError = "Silakan isi nama / label item terlebih dahulu!";
        $("#add-name").addClass("border-sublimatio-red").focus();
      } else if (type === "link") {
        const urlVal = $("#add-url-input").val().trim();
        if (!urlVal) {
          validationError = "URL tujuan tidak boleh kosong untuk payload link!";
          $("#add-url-input").addClass("border-sublimatio-red").focus();
        }
      } else if (type === "text") {
        const textVal = $("#add-text-input").val().trim();
        if (!textVal) {
          validationError =
            "Konten payload teks / clipboard tidak boleh kosong!";
          $("#add-text-input").addClass("border-sublimatio-red").focus();
        }
      }

      if (validationError) {
        $("#form-error-msg").text(validationError);
        $("#form-error").slideDown(200);
        return false;
      }

      $("#form-error").slideUp(150);
      $("#add-name, #add-url-input, #add-text-input").removeClass(
        "border-sublimatio-red",
      );

      const newItem = {
        id: "user-" + Date.now().toString(36),
        type: type,
        name: name,
        device: device,
        totalTTL: ttl,
        remainingTTL: ttl,
        createdAt: "Just now",
        hash:
          "sha256:" +
          Math.random().toString(36).substring(2) +
          Math.random().toString(36).substring(2),
      };

      if (type === "file") {
        const fileInput = document.getElementById("add-file-input");
        const chosenFile =
          fileInput && fileInput.files ? fileInput.files[0] : null;
        if (chosenFile) {
          newItem.name = chosenFile.name;
          newItem.size = (chosenFile.size / 1024).toFixed(1) + " KB";
          newItem.mime = chosenFile.type || "application/octet-stream";
          newItem.content = "[Uploaded File Buffer: " + chosenFile.name + "]";
        } else {
          newItem.size = "256 KB";
          newItem.mime = "application/octet-stream";
          newItem.content = "[Simulated File Payload: " + newItem.name + "]";
        }
      } else if (type === "link") {
        newItem.url = $("#add-url-input").val().trim();
      } else {
        newItem.content = $("#add-text-input").val().trim();
      }

      items.unshift(newItem);
      $("#modal-add").fadeOut(200);
      $("#form-add-item")[0].reset();
      $("#add-type").trigger("change");

      showToast(
        'Berhasil mempublikasikan payload "' +
          newItem.name +
          '" ke memori buffer!',
        "success",
        "Payload Transmitted",
      );
      renderBufferList();
    });

    // Delegated actions on buffer list items
    $("#item-list").on("click", ".btn-sublimate", function (e) {
      e.stopPropagation();
      const id = $(this).data("id");
      sublimateItem(id, "User Triggered Vanish");
    });

    $("#item-list").on("click", ".btn-copy-url", function (e) {
      e.stopPropagation();
      const url = $(this).data("url");
      copyToClipboard(url, "Link Copied", "URL copied to clipboard: " + url);
    });

    $("#item-list").on("click", ".btn-copy-text", function (e) {
      e.stopPropagation();
      const id = $(this).data("id");
      const item = items.find(function (i) {
        return i.id === id;
      });
      if (item && item.content) {
        copyToClipboard(
          item.content,
          "Text Copied",
          'Snippet "' + item.name + '" copied to clipboard!',
        );
      }
    });

    $("#item-list").on("click", ".btn-download", function (e) {
      e.stopPropagation();
      const id = $(this).data("id");
      const item = items.find(function (i) {
        return i.id === id;
      });
      if (item) downloadMockFile(item);
    });

    $("#item-list").on("click", ".btn-inspect", function (e) {
      e.stopPropagation();
      const id = $(this).data("id");
      openInspectModal(id);
    });

    $("#item-list").on("click", ".item-row", function (e) {
      if ($(e.target).closest("button, a, input").length) return;
      const id = $(this).data("itemId");
      openInspectModal(id);
    });

    $("#btn-copy-inspect-content").on("click", function (e) {
      e.stopPropagation();
      const content = $("#inspect-content").text();
      if (!content) return;
      copyToClipboard(
        content,
        "Payload Copied",
        "Cryptographic payload copied to clipboard",
      );
      const $label = $("#copy-inspect-label");
      $label.text("Copied!");
      setTimeout(function () {
        $label.text("Copy");
      }, 2000);
    });

    // Sync payload received from external client device via localStorage
    try {
      const pendingData = localStorage.getItem("sublimatio_pending_transmit");
      if (pendingData) {
        const parsed = JSON.parse(pendingData);
        if (parsed && parsed.name) {
          items.unshift(parsed);
          localStorage.removeItem("sublimatio_pending_transmit");
          showToast(
            'Menerima transmisi data baru dari client device: "' +
              parsed.name +
              '"',
            "success",
            "Peer Synced",
          );
        }
      }
    } catch (err) {
      console.warn("Storage sync check warning:", err);
    }
  }

  $(document).ready(function () {
    renderBufferList();
    renderAuditLogsUI();
    initJQueryInteractions();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(handleTimerTick, 1000);
  });
})();
