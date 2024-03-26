// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
var exec = require('child_process').exec;
const bin = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { contextBridge } = require('electron')

const envPath = bin.join(__dirname, 'kelp.env');
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
  },
  setEnv: (envs) => {
    writeEnv(envs); // 写入新的环境变量到.env文件
  },
  getEnv: (envKey) => {
    try {
      const data = fs.readFileSync(envPath, 'utf8');
      return dotenv.parse(data)[envKey];
    } catch (err) {
      console.error(err);
    }
  }
});

// 写入.env文件
function writeEnv(newValues) {
  try {
    const env = dotenv.config();
    const currentEnv = { ...env.parsed, ...newValues };
    const output = Object.keys(currentEnv).map((key) => `${key}=${currentEnv[key]}`).join('\n');
    fs.writeFileSync(envPath, output);
  } catch (err) {
    console.error(err);
  }
}