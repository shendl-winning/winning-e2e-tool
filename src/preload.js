// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
var exec = require('child_process').exec;
const bin = require('path');

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('Kelp', {
  execute: async (cmd, loading) => {
    return new Promise(async (resolve, reject) => {
      await exec(cmd, function (error, stdout, stderr) {
        if (error) {
          reject(error)
        } else {
          resolve(true);
        }
      });

    })
  },
  path: (dir) => {
    return app.isPackaged ? bin.join(__dirname, dir) : dir;
  }
});