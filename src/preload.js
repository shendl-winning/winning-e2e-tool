// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
var exec = require('child_process').exec;

const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('Kelp', {
  execute: function(cmd){
    exec(cmd, function(error, stdout, stderr) {
        if(error){
            console.error(error);
        }else{
            console.log("success");
        }
    });
  }
})