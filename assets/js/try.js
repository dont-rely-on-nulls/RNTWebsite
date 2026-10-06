// The Try it page. The Explorer is a page of its own under try/explorer/;
// it loads into the stage only when the visitor presses Start. Its database
// is IndexedDB on this origin, named after its mount point, so this page can
// delete it.

(function () {
  const DB = "/data";

  const stage = document.getElementById("stage");
  const veil = document.getElementById("stage-veil");
  const dot = document.getElementById("try-dot");
  const status = document.getElementById("try-status");
  const startBtn = document.getElementById("try-start");
  const fullBtn = document.getElementById("try-full");
  const resetBtn = document.getElementById("try-reset");
  const stopBtn = document.getElementById("try-stop");
  let frame = null;

  function show(phase, text) {
    stage.dataset.phase = phase;
    status.textContent = text;
    fullBtn.disabled = phase !== "running";
    stopBtn.disabled = phase === "idle";
  }

  // The Explorer's own page hides #loading once the program runs, and
  // writes what stopped it there if it aborts.
  function watch(doc) {
    const loading = doc.getElementById("loading");
    if (!loading) return;
    const update = () => {
      if (loading.classList.contains("gone")) {
        show("running", "running · database saved in this browser");
      } else if (loading.textContent.startsWith("RNT stopped")) {
        show("stopped", loading.textContent);
      }
    };
    new MutationObserver(update).observe(loading, { attributes: true, childList: true, characterData: true, subtree: true });
    update();
  }

  function start() {
    if (frame) return;
    frame = document.createElement("iframe");
    frame.className = "stage__frame";
    frame.title = "RNT Explorer";
    frame.src = stage.dataset.src;
    frame.addEventListener("load", () => {
      frame.focus();
      watch(frame.contentDocument);
    });
    stage.appendChild(frame);
    veil.hidden = true;
    show("loading", "loading the kernel…");
  }

  function stop() {
    if (frame) frame.remove();
    frame = null;
    veil.hidden = false;
    show("idle", "not started");
  }

  function reset() {
    if (!confirm("Delete the database this browser keeps for RNT? Everything you made in it will be gone.")) return;
    const running = !!frame;
    stop();
    const request = indexedDB.deleteDatabase(DB);
    request.onsuccess = () => {
      show("idle", "database deleted");
      if (running) start();
    };
    request.onerror = () => show("idle", "could not delete the database");
    request.onblocked = () => show("idle", "the database is open in another tab; close it and try again");
  }

  startBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);
  resetBtn.addEventListener("click", reset);
  fullBtn.addEventListener("click", () => {
    if (frame) frame.requestFullscreen().then(() => frame.focus(), () => {});
  });
  show("idle", "not started");
})();
