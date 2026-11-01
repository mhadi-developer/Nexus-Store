// Auto-rebuilds the frontend Docker image when frontend source files change.
// Usage: node scripts/watch-frontend-rebuild.js
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const DEBOUNCE_MS = 3000;

const watchDirs = [path.join(FRONTEND, "src")];
const watchFiles = [
  path.join(FRONTEND, "index.html"),
  path.join(FRONTEND, "nginx.conf"),
  path.join(FRONTEND, "Dockerfile"),
  path.join(FRONTEND, "package.json"),
];

let due = null;
let building = false;
let again = false;

function log(msg) {
  console.log(`[watcher ${new Date().toLocaleTimeString()}] ${msg}`);
}

function isIgnored(p) {
  return /[\\/](node_modules|dist|\.git)[\\/]/.test(p);
}

function run(cmdArgs) {
  return new Promise((resolve) => {
    const [cmd, ...args] = cmdArgs;
    const child = spawn(cmd, args, { cwd: ROOT, stdio: "inherit" });
    child.on("close", (code) => resolve(code));
  });
}

async function rebuild() {
  building = true;
  log("change detected -> docker compose build frontend");
  const buildCode = await run(["docker", "compose", "build", "frontend"]);
  if (buildCode === 0) {
    const upCode = await run(["docker", "compose", "up", "-d", "frontend"]);
    log(upCode === 0
      ? "frontend redeployed -> http://localhost:8081"
      : "ERROR: frontend container failed to start");
  } else {
    log("ERROR: docker build failed (fix the code; watcher keeps running)");
  }
  building = false;
  if (again) {
    again = false;
    schedule();
  }
}

function schedule() {
  if (building) {
    again = true; // changed mid-build: rebuild once more afterwards
    return;
  }
  clearTimeout(due);
  due = setTimeout(rebuild, DEBOUNCE_MS);
}

for (const dir of watchDirs) {
  fs.watch(dir, { recursive: true }, (_event, filename) => {
    if (filename && !isIgnored(path.join(dir, filename))) schedule();
  });
}
for (const file of watchFiles) {
  if (fs.existsSync(file)) fs.watch(file, () => schedule());
}

log(`watching ${watchDirs.join(", ")} + ${watchFiles.length} config files`);
log("press Ctrl+C to stop");
