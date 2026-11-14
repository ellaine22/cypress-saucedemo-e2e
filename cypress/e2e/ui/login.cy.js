import { loginPage } from '../../pages/LoginPage';
import { inventoryPage } from '../../pages/InventoryPage';

describe('Login', () => {
  beforeEach(function () {
    cy.fixture('users').as('users');
    loginPage.visit();
  });

  it('logs in a standard user and lands on the inventory', { tags: '@smoke' }, function () {
    const { username, password } = this.users.standard;
    loginPage.submit(username, password);

    cy.url().should('include', '/inventory.html');
    inventoryPage.items.should('have.length', 6);
  });

  it('blocks a locked out user', function () {
    const { username, password } = this.users.lockedOut;
    loginPage.submit(username, password);

    loginPage.error.should('contain.text', 'Sorry, this user has been locked out.');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('rejects an unknown username/password combination', function () {
    const { username, password } = this.users.invalid;
    loginPage.submit(username, password);

    loginPage.error.should(
      'contain.text',
      'Username and password do not match any user in this service'
    );
  });

  const missingFieldCases = [
    { name: 'username', username: '', password: 'secret_sauce', message: 'Username is required' },
    { name: 'password', username: 'standard_user', password: '', message: 'Password is required' },
  ];

  missingFieldCases.forEach(({ name, username, password, message }) => {
    it(`shows a validation error when ${name} is empty`, () => {
      loginPage.submit(username, password);
      loginPage.error.should('contain.text', message);
    });
  });

  it('does not allow direct access to the inventory without a session', () => {
    inventoryPage.visit();
    loginPage.error.should('contain.text', "You can only access '/inventory.html' when you are logged in");
  });

  it('logs the user out and clears the session', function () {
    const { username, password } = this.users.standard;
    loginPage.submit(username, password);
    inventoryPage.logout();

    loginPage.loginButton.should('be.visible');
    cy.getCookie('session-username').should('not.exist');
  });
});
