describe('Kelp E2E Testing', () => {

	beforeEach("设置窗口大小", () => {
		cy.viewport(1920, 1080);
	})

	context('测试套件', () => {

		let testcase = null;
		Cypress.$.ajax({
			url: 'http://172.16.7.148:9200/testcase/_doc/c982a1d7-e2c6-4f9e-a7fe-84f68463fe40',
			type: 'get',
			async: false,
			cache: true,
			success: function (response) {
				testcase = response._source
			}
		});

		context(testcase.name, () => {

			testcase.steps.forEach((step) => {
				it(step.name, () => {
					if (step.iframekey) {
						const iframesStr = step.iframekey;
						let iframe = null;
						iframesStr.forEach((iframeStr) => {
							if (!iframe) {
								iframe = cy.get(iframeStr);
							} else {
								iframe = iframe.onIframeLoad().find(iframeStr)
							}
						});
						iframe.onIframeLoad().then((iframebody) => {
							cy.exeAction(step.datas, step, iframebody)
						});
					} else {
						cy.exeAction(step.datas, step)
					}
				})
			});
		});

	});
})