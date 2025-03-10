import { app as a, BrowserWindow as m, ipcMain as w, dialog as E } from "electron";
import { fileURLToPath as v } from "node:url";
import o, { resolve as y } from "node:path";
import * as f from "node:fs";
import { exec as u } from "child_process";
import T from "http";
const g = o.dirname(v(import.meta.url));
let c = null;
process.env.APP_ROOT = o.join(g, "..");
const h = process.env.VITE_DEV_SERVER_URL, L = o.join(process.env.APP_ROOT, "dist-electron"), R = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = h ? o.join(process.env.APP_ROOT, "public") : R;
let i = m ?? null;
function _() {
  i = new m({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(g, "preload.mjs")
    }
  }), i.webContents.on("did-finish-load", () => {
    i == null || i.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), h ? i.loadURL(h) : i.loadFile(o.join(R, "index.html"));
}
a.on("window-all-closed", () => {
  process.platform !== "darwin" && (a.quit(), i = null);
});
a.on("activate", () => {
  m.getAllWindows().length === 0 && _();
});
w.handle("readFile", async (n, s) => (console.log(s), o.resolve("."), f.readFile(o.join("C:\\Users\\yiche\\screentime\\v3\\express-webserver\\", s), "utf8")));
w.on("setAppPort", (n, s) => {
  c = s, console.log("APP_PORT", c);
});
w.handle("check-trayapp-status", async (n) => {
  let s = !1;
  return s = await new Promise((r) => {
    u("tasklist", (e, t, l) => {
      if (e) {
        console.error(`Error executing tasklist: ${e}`), r(!1);
        return;
      }
      r(t.toLowerCase().includes("trayapp.exe"));
    });
  }), s;
});
async function j() {
  const n = "1.0.0", s = "http://localhost:3000/";
  try {
    const e = await (await fetch(s).catch((t) => console.log(t.message))).json();
    if (console.log(e.latest), e.latest !== n)
      for (const t of e.sources) {
        const l = await F(t, e.latest);
        console.log(l), console.log("finished one iteration"), U(e.latest);
      }
  } catch (r) {
    console.error("Error:", r);
  }
}
async function F(n, s) {
  const r = o.join(process.env.PUBLIC, "ScreenTime"), e = o.join(r, s + ".exe");
  if (console.log(r), console.log(e), f.existsSync(e))
    return console.log("File already exists"), Promise.resolve("File already exists");
  try {
    const t = await fetch(n);
    if (!t.ok)
      throw new Error(`Error fetching the file: ${t.status} ${t.statusText}`);
    const l = f.createWriteStream(e), p = T.get(n, (d) => {
      d.pipe(l), l.on("finish", () => {
        l.close(), console.log("File downloaded successfully"), y("File downloaded successfully");
      });
    });
    return Promise.resolve("File downloaded successfully");
  } catch (t) {
    return console.error("Download failed:", t), Promise.reject("Download failed");
  }
}
function U(n) {
  const s = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: n,
    detail: "A new version has been downloaded. Restart the application to apply the updates."
  };
  E.showMessageBox(s).then((r) => {
    const e = "trayapp.exe";
    if (r.response === 0) {
      console.log("restarting application");
      const t = o.join(process.env.PUBLIC, "ScreenTime"), l = o.join(t, n + ".exe");
      console.log("starting file path ", l), c && fetch("http://localhost:" + c + "/stop/"), u(`taskkill /F /IM ${e}`, (p, d, P) => {
        if (p) {
          console.error(`Error killing process: ${p.message}`);
          return;
        }
        if (P) {
          console.error(`Error output: ${P}`);
          return;
        }
        console.log(`Process killed successfully: ${d}`);
      }), u(l + " /silent");
    }
  });
}
j();
a.whenReady().then(_);
export {
  L as MAIN_DIST,
  R as RENDERER_DIST,
  h as VITE_DEV_SERVER_URL
};
