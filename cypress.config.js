const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    //禁止运行完第一个case之后会自动跳转至空白页面。
	  testIsolation: false
  },
  reporter: 'mochawesome',
  reporterOptions:{
		overwrite: true,
		html: true,
		json: false,
  },
  video:true,
  videoCompression:10,
  trashAssetsBeforeRuns:true,
  defaultCommandTimeout:30000,
  "viewportWidth": 1920,
  "viewportHeight": 1080
});
