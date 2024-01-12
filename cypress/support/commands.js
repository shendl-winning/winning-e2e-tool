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
import 'cypress-iframe'

let inputs = {};
Cypress.Commands.add('exeInput', (data,  body) => {
    let $body =  body ? cy.wrap(body) : cy.get("body")
    if(!inputs[data.fieldInputMethod.value]){
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
    new Function('$body','name','mock', inputs[data.fieldInputMethod.value])($body, data.fieldCode, Mock.mock(data.mock));
});


Cypress.Commands.add('exeAction', (datas, step, body) => {
    if (step.action == "visit") {
        cy.visit(step.key);
    }
    if (step.action == "fill") {
        datas.forEach((data) => {
            cy.exeInput(data, body);
        });
    }
    if (step.action == "click") {
        body ? cy.wrap(body).find(step.key).realClick() : cy.get(step.key).realClick()
    }
    if (step.action == "hover") {
        body ? cy.wrap(body).find(step.key).realHover(): cy.get(step.key).realMouseUp()
    }
});


//等待iframe加载完，并返回jq的body对象 
Cypress.Commands.add('getIframeBody', { prevSubject: 'element' }, $iframe => {
	// 定义getIframeBody方法
  // and retry until the body element is not empty
  return cy
          .get('iframe', { log: false })
          .its('0.contentDocument.body', { log: false }).should('not.be.empty')
          .then((body) => cy.wrap(body, { log: false }))
});

Cypress.Commands.add('onIframeLoad', { prevSubject: 'element' }, ($iframe,  nextkey) => {
    if($iframe.contents().find(nextkey).length > 0){
        return cy.wrap($iframe.contents())
    }else{
        return new Cypress.Promise(resolve => {
            $iframe.on('load', () => {
                resolve($iframe.contents());
            });
        });
    }
  });