/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.visit('');
  const pwd: string = password ? password : Cypress.env('password');
  const usr: string = email ? email : Cypress.env('username');
  cy.get('input').first().type(usr).should('have.value', usr);
  cy.get('input[type=password]')
    .type(pwd, { log: false })
    .should((el$) => {
      if (el$.val() !== pwd) {
        throw new Error('Different value of typed password');
      }
    });
  cy.get('button[type=button]').contains('Logg inn').click();
  cy.url().should('contain', '/oversikt/hjem');
  cy.window().its('sessionStorage').invoke('getItem', 'organization').should('exist');
});

Cypress.Commands.add('logout', () => {
  //forced big navbar because small menu that has display none crashes cypress
  cy.get('[data-cy="bigNavbar"]').contains('Logg ut').click();
  cy.window().its('sessionStorage').invoke('getItem', 'organization').should('not.exist');
});

Cypress.Commands.add('newBulletin', () => {
  cy.get('div').contains('Lag ny').eq(0).click();
});

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
//
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      newBulletin(): Chainable<void>;
      //  drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
      //  dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
      //  visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>;
    }
  }
}
