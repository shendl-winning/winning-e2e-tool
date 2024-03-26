// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import Mock from 'mockjs'


let inputs = {};

const fillMock = (data, body, environment, callback) => {
    let $body = body ? cy.wrap(body) : cy.get("body")
    if (!inputs[data.fieldInputMethod.value]) {
        Cypress.$.ajax({
            url: 'http://172.16.7.148:9200/inputmethod/_doc/' + data.fieldInputMethod.value,
            type: 'get',
            async: false,
            cache: true,
            success: function (response) {
                inputs[data.fieldInputMethod.value] = response._source.method
            }
        });
    }
    const regex = /\W/g; // 正则表达式
    if(regex.test(data.mock) && data.inputDataType == "3"){
        const matches = data.mock.match(regex);
        data.mock = data.mock.split(matches[0])
    }
    new Function('$body', 'name', 'mock', 'callback', inputs[data.fieldInputMethod.value])($body, data.fieldCode, Mock.mock(environment[data.mock] || data.mock), callback);
}
const fillMockRecursion = (data, body, environment) => {
    
    if(data.inputDataType == "0" || data.inputDataType == "3" || data.inputDataType == "4"){
        fillMock(data, body, environment);
    }
    if(data.inputDataType == "1"){
        fillMock(data, body, environment, (inner) => {
            data.children.forEach((data1) => {
                fillMockRecursion(data1, inner?inner:body, environment);
            });
        });
    }
    if(data.inputDataType == "2"){
        data.children.forEach((data1) => {
            fillMock(data, body, environment, (inner) => {
                data1.children.forEach((data2) => {
                    fillMockRecursion(data2, inner?inner:body, environment);
                });
            });
        });
    }
}
Cypress.Commands.add('exeInput', (data, body, environment) => {
    fillMockRecursion(data, body, environment);
});

Cypress.Commands.add('exeAsser', (asser, body, environment) => {

    switch (asser.asser.value) {
        case "contain":
            body ? cy.wrap(body).find(asser.selector).should(asser.asser.value, asser.content) : cy.get(asser.selector).should(asser.asser.value, asser.content);
            break;
        case "not.contain":
            body ? cy.wrap(body).find(asser.selector).should(asser.asser.value, asser.content) : cy.get(asser.selector).should(asser.asser.value, asser.content);
            break;
        case "have.value":
            body ? cy.wrap(body).find(asser.selector).should(asser.asser.value, asser.content) : cy.get(asser.selector).should(asser.asser.value, asser.content);
            break;
        case "have.length":
            body ? cy.wrap(body).find(asser.selector).should(asser.asser.value, asser.content) : cy.get(asser.selector).should(asser.asser.value, asser.content);
            break;
        default:
            body ? cy.wrap(body).find(asser.selector).should(asser.asser.value) : cy.get(asser.selector).should(asser.asser.value);
    }

})


Cypress.Commands.add('exeAction', (step, body, environment) => {

    const action = new Cypress.Promise(resolve => {

        switch (step.action) {
            case "visit":
                cy.visit(environment[step.key] || step.key);
                break;
            case "fill":
                step.datas.forEach((data) => {
                    cy.exeInput(data, body, environment);
                });
                break;
            case "click":
                body ? cy.wrap(body).find(step.key).scrollIntoView().click({force: true}) : cy.get(step.key).scrollIntoView().click({force: true});
                break;
            case "realClick":
                body ? cy.wrap(body).find(step.key).scrollIntoView().realClick({force: true}) : cy.get(step.key).scrollIntoView().realClick({force: true});
                break;
            case "realHover":
                body ? cy.wrap(body).find(step.key).scrollIntoView().realHover() : cy.get(step.key).scrollIntoView().realHover();
                break;
            case "dblclick":
                body ? cy.wrap(body).find(step.key).scrollIntoView().dblclick({force: true}) : cy.get(step.key).scrollIntoView().dblclick({force: true});
                break;
                
        }
        resolve(true);
    });

    action.then(() => {
        step.assertion.forEach((asser) => {
            if (asser.enable) {
                cy.wait(500);
                if (asser.iframekey) {
					const iframesStr = asser.iframekey;
					let iframe = null;
					iframesStr.forEach((iframeStr) => {
						if (!iframe) {
							iframe = cy.get(iframeStr);
						} else {
							iframe = iframe.onIframeLoad().find(iframeStr);
						}
					});
					iframe.onIframeLoad().then((iframebody) => {
						cy.exeAsser(asser, iframebody, environment)
					});
				} else {
					cy.exeAsser(asser, null, environment)
				}
            }
        });
    });

});

Cypress.Commands.add('onIframeLoad', { prevSubject: 'element' }, ($iframe) => {
    return new Cypress.Promise(resolve => {
        if($iframe.contents().find("body").children().length > 0){
          resolve($iframe.contents());
        }else{
           $iframe.on('load', () => {
            resolve($iframe.contents());
           });
        }
    });
});

