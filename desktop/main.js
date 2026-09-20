const { app, BrowserWindow, shell, session } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

let mainWindow;
let localServer;

function appRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "mobile-dist")
    : path.join(__dirname, "..", "mobile-dist");
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  })[ext] || "application/octet-stream";
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    localServer = http.createServer((req, res) => {
      try {
        const parsed = url.parse(req.url || "/");
        let pathname = decodeURIComponent(parsed.pathname || "/");
        if (pathname === "/") pathname = "/index.html";

        const root = path.resolve(appRoot());
        const filePath = path.resolve(root, "." + pathname);

        if (filePath !== root && !filePath.startsWith(root + path.sep)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        fs.stat(filePath, (err, stat) => {
          if (err || !stat.isFile()) {
            res.writeHead(404);
            res.end("Not Found");
            return;
          }

          res.writeHead(200, {
            "Content-Type": mimeType(filePath),
            "Cache-Control": "no-cache"
          });
          fs.createReadStream(filePath).pipe(res);
        });
      } catch (_) {
        res.writeHead(500);
        res.end("Server Error");
      }
    });

    localServer.on("error", reject);
    localServer.listen(0, "127.0.0.1", () => {
      const address = localServer.address();
      resolve("http://127.0.0.1:" + address.port);
    });
  });
}

function createPopup(parent, targetUrl) {
  const popup = new BrowserWindow({
    width: 520,
    height: 760,
    minWidth: 380,
    minHeight: 560,
    parent,
    backgroundColor: "#050812",
    title: "AGT Product AI — Sign in",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      partition: "persist:agt-product-ai"
    }
  });

  popup.once("ready-to-show", () => popup.show());
  popup.loadURL(targetUrl);

  popup.webContents.setWindowOpenHandler(({ url: childUrl }) => {
    if (/^https?:/i.test(childUrl)) createPopup(popup, childUrl);
    return { action: "deny" };
  });

  return popup;
}

function createWindow(localUrl) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: "#050812",
    title: "AGT Product AI",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
      partition: "persist:agt-product-ai"
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (/^https?:/i.test(targetUrl)) createPopup(mainWindow, targetUrl);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (/^https?:/i.test(targetUrl) && !/^https?:\/\/127\.0\.0\.1:/i.test(targetUrl)) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  mainWindow.webContents.on("will-download", (_event, item) => {
    item.setSaveDialogOptions({
      title: "AGT Product AI — Görseli Kaydet",
      defaultPath: item.getFilename()
    });
  });

  mainWindow.loadURL(localUrl + "/index.html");
}

app.whenReady().then(async () => {
  session.fromPartition("persist:agt-product-ai").setPermissionRequestHandler(
    (_wc, permission, callback) => callback(permission === "notifications" || permission === "media")
  );

  const localUrl = await startLocalServer();
  createWindow(localUrl);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(localUrl);
  });
});

app.on("window-all-closed", () => {
  if (localServer) localServer.close();
  if (process.platform !== "darwin") app.quit();
});
