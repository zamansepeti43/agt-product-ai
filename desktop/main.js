const { app, BrowserWindow, shell, session } = require("electron");
const path = require("path");
let mainWindow;
function appRoot(){return app.isPackaged?path.join(process.resourcesPath,"mobile-dist"):path.join(__dirname,"..","mobile-dist");}
function createPopup(parent,url){
  const popup=new BrowserWindow({width:520,height:760,minWidth:380,minHeight:560,parent,backgroundColor:"#050812",title:"AGT Product AI — Sign in",webPreferences:{contextIsolation:true,sandbox:true,partition:"persist:agt-product-ai"}});
  popup.once("ready-to-show",()=>popup.show());
  popup.loadURL(url);
  popup.webContents.setWindowOpenHandler(({url:childUrl})=>{if(/^https?:/i.test(childUrl))createPopup(popup,childUrl);return{action:"deny"};});
  return popup;
}
function createWindow(){
  mainWindow=new BrowserWindow({width:1280,height:900,minWidth:980,minHeight:700,backgroundColor:"#050812",title:"AGT Product AI",autoHideMenuBar:true,show:false,webPreferences:{contextIsolation:true,sandbox:true,preload:path.join(__dirname,"preload.js"),partition:"persist:agt-product-ai"}});
  mainWindow.once("ready-to-show",()=>mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/i.test(url))createPopup(mainWindow,url);return{action:"deny"};});
  mainWindow.webContents.on("will-navigate",(event,url)=>{if(/^https?:/i.test(url)){event.preventDefault();shell.openExternal(url);}});
  mainWindow.webContents.on("will-download",(_event,item)=>item.setSaveDialogOptions({title:"AGT Product AI — Görseli Kaydet",defaultPath:item.getFilename()}));
  mainWindow.loadFile(path.join(appRoot(),"index.html"));
}
app.whenReady().then(()=>{session.fromPartition("persist:agt-product-ai").setPermissionRequestHandler((_wc,permission,callback)=>callback(permission==="notifications"||permission==="media"));createWindow();app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
