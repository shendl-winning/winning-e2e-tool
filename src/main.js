const { app, BrowserWindow, autoUpdater, dialog  } = require('electron');
const path = require('path');
// const { updateElectronApp, UpdateSourceType } = require('update-electron-app')

// updateElectronApp({
//   updateSource: {
//     type: UpdateSourceType.ElectronPublicUpdateService,
//     repo: 'shendl-winning/winning-e2e-tool',
//     host: 'https://update.electronjs.org'
//   }
// })

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['重启', '稍后'],
//     title: '应用更新',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: '应用已经更新了，请重启'
//   }

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if(returnValue.response === 0) autoUpdater.quitAnd()
//   })
// });

// autoUpdater.on('error', message => {
//   console.error('There was a problem updating the application')
//   console.error(message)
// })


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
//console.log(__filename);
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../src/assets/image/test.png'),
    show: false,
    autoHideMenuBar:true,
    center:true,
    darkTheme:true,
    title:"Kelp",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.maximize();
  mainWindow.focus();
  mainWindow.show();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if(!app.isPackaged){
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.