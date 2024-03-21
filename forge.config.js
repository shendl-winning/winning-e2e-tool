const path = require('path');
const fs = require('fs');

module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'shendl-winning',
          name: 'winning-e2e-tool'
        },
        prerelease: false,  //此发行版是否应标记为预发行版
        draft: false,       //此版本是否应标记为草稿
        authToken:"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"
      }
    }
  ],
  packagerConfig: {
      icon: path.join(__dirname, 'src/assets/image/bitbug_favicon'),
      //extraResource:path.join(__dirname, 'node_modules/.bin')
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {
    //     iconUrl : path.join(__dirname, 'src/assets/image/bitbug_favicon.ico'),
    //     setupIcon: path.join(__dirname, 'src/assets/image/bitbug_favicon.ico'),
    //     loadingGif:path.join(__dirname, 'src/assets/image/loading.gif')
    //   },
    // },
    {
      name: '@electron-forge/maker-zip',
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      var src = path.join(__dirname, 'cypress');
      var dst = path.join(buildPath, '../../cypress');
      fs.cpSync(src, dst, {recursive: true});
      var src = path.join(__dirname, 'node_modules');
      var dst = path.join(buildPath, '../../node_modules');
      fs.cpSync(src, dst, {recursive: true});
      var src = path.join(__dirname, 'package.json');
      var dst = path.join(buildPath, '../../package.json');
      fs.cpSync(src, dst, {recursive: true});
      var src = path.join(__dirname, 'cypress.config.js');
      var dst = path.join(buildPath, '../../cypress.config.js');
      fs.cpSync(src, dst, {recursive: true});
    }
  },
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
  ],
};
