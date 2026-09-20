const { app, BrowserWindow, shell, session } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

let mainWindow;
let localServer;

function appRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, "mobile-dist") : path.join(__dirname, "..", "mobile-dist");
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
    ".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",
    ".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif",".ico":"image/x-icon",
    ".woff":"font/woff",".woff2":"font/woff2"
  })[ext] || "application/octet-stream";
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    localServer = http.createServer((req,res) => {
      try {
        let pathname = decodeURIComponent(url.parse(req.url || "/").pathname || "/");
        if (pathname === "/") pathname = "/index.html";
        const root = path.resolve(appRoot());
        const filePath = path.resolve(root, "." + pathname);
        if (filePath !== root && !filePath.startsWith(root + path.sep)) { res.writeHead(403); return res.end("Forbidden"); }
        fs.stat(filePath,(err,stat)=>{
          if(err || !stat.isFile()){res.writeHead(404);return res.end("Not Found");}
          res.writeHead(200,{"Content-Type":mimeType(filePath),"Cache-Control":"no-cache"});
          fs.createReadStream(filePath).pipe(res);
        });
      } catch (_) { res.writeHead(500); res.end("Server Error"); }
    });
    localServer.on("error",reject);
    localServer.listen(0,"127.0.0.1",()=>resolve("http://127.0.0.1:"+localServer.address().port));
  });
}

function configureChildWindow(child) {
  child.setMenuBarVisibility(false);
  child.setTitle("Puter");
  child.setSize(620, 820);
  child.setMinimumSize(420, 620);
  child.center();
  child.show();

  child.webContents.setWindowOpenHandler(({ url: childUrl }) => {
    if (/^https?:/i.test(childUrl)) return { action: "allow" };
    return { action: "deny" };
  });

  child.webContents.on("will-navigate",(event,targetUrl)=>{
    if (!/^https?:/i.test(targetUrl)) event.preventDefault();
  });

  child.webContents.on("did-fail-load",(_event,errorCode,errorDescription,validatedURL)=>{
    console.error("Puter auth load failed:",errorCode,errorDescription,validatedURL);
  });
}

function createWindow(localUrl) {
  mainWindow = new BrowserWindow({
    width:1280,height:900,minWidth:980,minHeight:700,backgroundColor:"#050812",
    title:"AGT Product AI",autoHideMenuBar:true,show:false,
    webPreferences:{
      contextIsolation:true,sandbox:true,preload:path.join(__dirname,"preload.js"),
      partition:"persist:agt-product-ai"
    }
  });

  mainWindow.once("ready-to-show",()=>mainWindow.show());

  // Let Chromium create real child windows for Puter OAuth/auth flows.
  // This preserves window.opener/postMessage, unlike manually-created BrowserWindows.
  mainWindow.webContents.setWindowOpenHandler(({url:targetUrl})=>{
    if (/^https?:/i.test(targetUrl)) return { action:"allow" };
    return { action:"deny" };
  });

  mainWindow.webContents.on("did-create-window",(childWindow)=>{
    configureChildWindow(childWindow);
  });

  mainWindow.webContents.on("will-navigate",(event,targetUrl)=>{
    if (/^https?:\/\/127\.0\.0\.1:/i.test(targetUrl)) return;
    if (/^https?:/i.test(targetUrl)) { event.preventDefault(); shell.openExternal(targetUrl); }
  });

  mainWindow.webContents.on("will-download",(_event,item)=>{
    item.setSaveDialogOptions({title:"AGT Product AI — Görseli Kaydet",defaultPath:item.getFilename()});
  });

  mainWindow.loadURL(localUrl+"/index.html");
}

app.whenReady().then(async()=>{
  session.fromPartition("persist:agt-product-ai").setPermissionRequestHandler(
    (_wc,permission,callback)=>callback(permission==="notifications"||permission==="media")
  );
  const localUrl=await startLocalServer();
  createWindow(localUrl);
  app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow(localUrl);});
});

app.on("window-all-closed",()=>{
  if(localServer) localServer.close();
  if(process.platform!=="darwin") app.quit();
});
