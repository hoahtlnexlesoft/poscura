// moves the built app to dist-preview/app.html and adds the viewer as index.html
import { renameSync, copyFileSync, rmSync, existsSync } from "node:fs";
const out = "dist-preview";
if (existsSync(`${out}/preview/app.html`)) { renameSync(`${out}/preview/app.html`, `${out}/app.html`); rmSync(`${out}/preview`, { recursive: true, force: true }); }
copyFileSync("preview/viewer.html", `${out}/index.html`);
console.log("preview ready:", out);
