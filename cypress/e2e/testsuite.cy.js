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

			const ids = [];
			testcase.steps.map((step) => {
				ids.push('"' + step.id + '"');
			});

			Cypress.$.ajax({
				url: 'http://172.16.7.148:9200/step/_doc/_search',
				type: 'post',
				async: false,
				cache: true,
				dataType: "json",
				contentType: 'application/json;charset=utf-8',
				data: '{"query": {"terms": {"id":[' + ids + ']}}}',
				success: function (response) {
					const id_name = {};
					response.hits.hits.map((element) => {
						let step = element._source;
						id_name[step.id] = step;
					});

					testcase.steps.forEach((step) => {
						step.name = id_name[step.id].name
						step.action = id_name[step.id].action
						step.key = id_name[step.id].key
						step.iframekey = id_name[step.id].iframekey
					});
				},
				error: function (error) {
					alert(JSON.stringify(error))
				}

			});

			context(testcase.name, () => {
				testcase.steps.forEach((step, index) => {
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
									cy.exeAction(step, iframebody)
								});
							} else {
								cy.exeAction(step)
							}

							//最后一步可能录制不下来，等待2秒。
							if(testcase.steps.length == index+1){
								cy.wait(2000);
							}
						});
					}
				});
			});

		});
	});
})