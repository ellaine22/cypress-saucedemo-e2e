import { loginPage } from '../pages/LoginPage';

// Logs in through the UI once per user and caches the session cookie,
// so specs that aren't testing login don't pay for it every time.
Cypress.Commands.add('loginAs', (userKey = 'standard') => {
  cy.fixture('users').then((users) => {
    const user = users[userKey];

    cy.session(
      ['saucedemo', user.username],
      () => {
        loginPage.visit();
        loginPage.submit(user.username, user.password);
        cy.url().should('include', '/inventory.html');
      },
      {
        validate() {
          cy.getCookie('session-username').should('exist');
        },
        cacheAcrossSpecs: true,
      }
    );
  });
});

Cypress.Commands.add('getByTest', (id, options) => {
  return cy.get(`[data-test="${id}"]`, options);
});

Cypress.Commands.add('apiToken', () => {
  return cy.env(['apiUser', 'apiPassword'], { log: false }).then(({ apiUser, apiPassword }) => {
    return cy
      .request({
        method: 'POST',
        url: `${Cypress.expose('apiUrl')}/auth`,
        body: { username: apiUser, password: apiPassword },
        log: false,
      })
      .its('body.token')
      .should('be.a', 'string');
  });
});
