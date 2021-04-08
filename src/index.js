const { app, BrowserWindow } = require('electron')
const path = require('path')

if (require('electron-squirrel-startup')) app.quit()

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 800,
    minHeight: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
};

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
