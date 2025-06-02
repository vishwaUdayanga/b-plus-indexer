const { spawn } = require("child_process");
const { copyFileSync } = require("fs");
const path = require("path");
const chokidar = require("chokidar");

// Paths
const src = path.join(__dirname, "electron", "splash.html");
const dest = path.join(__dirname, "build", "splash.html");

// Function to copy splash.html
function copySplash() {
  try {
    copyFileSync(src, dest);
    console.log("splash.html copied to build/");
  } catch (err) {
    console.error("Failed to copy splash.html:", err);
  }
}

// Start tsup watcher
const tsup = spawn("npx", ["tsup", "--watch"], { stdio: "inherit", shell: true });

// Initially copy splash.html once
copySplash();

// Watch for changes in build/main.js and copy splash.html again on rebuild
const watcher = chokidar.watch(dest, { ignoreInitial: true });

// Watch build folder for changes to main.js or preload.js
chokidar
  .watch(path.join(__dirname, "build", "main.js"))
  .on("add", copySplash)
  .on("change", copySplash);

tsup.on("error", (err) => {
  console.error("tsup watcher error:", err);
});

tsup.on("exit", (code, signal) => {
  console.log(`tsup watcher exited with code ${code} and signal ${signal}`);
});
