describe('Kelp E2E Testing', () => {

	beforeEach("设置窗口大小", () => {
		cy.viewport(1920, 1080);
	})

	let testsuite = null;
	Cypress.$.ajax({
		url: 'http://172.16.7.148:9200/testrecord/_doc/' + Cypress.env().id,
		type: 'get',
		async: false,
		cache: true,
		success: function (response) {
			testsuite = response._source
		}
	});

	context(testsuite.name, () => {



		testsuite.testcase.forEach((testcaseid) => {
			let testcase = null;
			Cypress.$.ajax({
				url: 'http://172.16.7.148:9200/testcase/_doc/' + testcaseid,
				type: 'get',
				async: false,
				cache: true,
				success: function (response) {
					testcase = response._source
				}
			});

			context(testcase.name, () => {
				testcase.steps.forEach((step) => {
					if (step.check) {
						it(step.name, () => {
							if (step.iframekey) {
								const iframesStr = step.iframekey;
								let iframe = null;
								iframesStr.forEach((iframeStr) => {
									if (!iframe) {
										iframe = cy.get(iframeStr);
									} else {
										iframe = iframe.onIframeLoad(iframeStr).find(iframeStr);
									}
								});
								iframe.onIframeLoad(step.key).then((iframebody) => {
									cy.exeAction(step.datas, step, iframebody)
								});
							} else {
								cy.exeAction(step.datas, step)
							}
						});
					}
				});
			});

		});
	});
})