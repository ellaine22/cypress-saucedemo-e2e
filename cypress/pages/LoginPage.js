class LoginPage {
  visit() {
    cy.visit('/');
  }

  get username() {
    return cy.getByTest('username');
  }

  get password() {
    return cy.getByTest('password');
  }

  get loginButton() {
    return cy.getByTest('login-button');
  }

  get error() {
    return cy.getByTest('error');
  }

  submit(username, password) {
    if (username) this.username.type(username);
    if (password) this.password.type(password, { log: false });
    this.loginButton.click();
  }
}

export const loginPage = new LoginPage();
