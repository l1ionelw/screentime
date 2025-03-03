import { app as n, BrowserWindow as i, ipcMain as a } from "electron";
import { fileURLToPath as p } from "node:url";
import e from "node:path";
import * as d from "node:fs/promises";
const t = e.dirname(p(import.meta.url));
process.env.APP_ROOT = e.join(t, "..");
const s = process.env.VITE_DEV_SERVER_URL, v = e.join(process.env.APP_ROOT, "dist-electron"), l = e.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? e.join(process.env.APP_ROOT, "public") : l;
let o = i ?? null;
function c() {
  o = new i({
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: e.join(t, "preload.mjs")
    }
  }), o.webContents.on("did-finish-load", () => {
    o == null || o.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), s ? o.loadURL(s) : o.loadFile(e.join(l, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), o = null);
});
n.on("activate", () => {
  i.getAllWindows().length === 0 && c();
});
a.handle("readFile", async (m, r) => (console.log(r), e.resolve("."), d.readFile(e.join("C:\\Users\\yiche\\screentime\\v3\\express-webserver\\", r), "utf8")));
n.whenReady().then(c);
export {
  v as MAIN_DIST,
  l as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
