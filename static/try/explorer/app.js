// The page around the Explorer. The host keeps its database in LMDB under
// /data, which is IndexedDB (emscripten's IDBFS): loaded before the program
// starts, written back every few seconds and when the tab is hidden.
// Clearing the site's data clears it.

const DATA = "/data";

function start() {
  const loading = document.getElementById("loading");
  let rnt = null, syncing = false;

  function save() {
    if (!rnt || syncing) return;
    syncing = true;
    rnt.FS.syncfs(false, (err) => {
      syncing = false;
      if (err) console.error("could not save the database", err);
    });
  }

  createRNT({
    canvas: document.getElementById("canvas"),
    print: (t) => console.log(t),
    printErr: (t) => console.warn(t),
    preRun: [(m) => {
      m.FS.mkdir(DATA);
      m.FS.mount(m.FS.filesystems.IDBFS, {}, DATA);
      m.addRunDependency("idbfs");
      m.FS.syncfs(true, (err) => {
        if (err) console.error("could not load the database", err);
        m.removeRunDependency("idbfs");
      });
    }],
    postRun: [() => loading.classList.add("gone")],
    onAbort(what) { loading.classList.remove("gone"); loading.textContent = "RNT stopped: " + what; },
  }).then((m) => {
    rnt = m;
    setInterval(save, 3000);
    document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
  });
}
