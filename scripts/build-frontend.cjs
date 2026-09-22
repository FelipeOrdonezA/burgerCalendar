const { copyFile, mkdir } = require("node:fs/promises");
const { resolve } = require("node:path");

async function build() {
  const root = resolve(__dirname, "..");
  await mkdir(resolve(root, "public"), { recursive: true });
  for (const file of ["index.html", "app.js", "styles.css"]) {
    await copyFile(resolve(root, "frontend", file), resolve(root, "public", file));
  }
  console.log("Frontend prepared in public/");
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
