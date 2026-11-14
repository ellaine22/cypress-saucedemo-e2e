const money = (text) => Number(text.match(/[\d.]+/)[0]);

class CheckoutPage {
  get error() {
    return cy.getByTest('error');
  }

  fillInformation({ firstName, lastName, postalCode }) {
    if (firstName) cy.getByTest('firstName').type(firstName);
    if (lastName) cy.getByTest('lastName').type(lastName);
    if (postalCode) cy.getByTest('postalCode').type(postalCode);
    cy.getByTest('continue').click();
  }

  itemPrices() {
    return cy
      .getByTest('inventory-item-price')
      .then(($els) => Cypress._.map($els, (el) => money(el.innerText)));
  }

  summary() {
    const totals = {};
    cy.getByTest('subtotal-label').invoke('text').then((t) => (totals.subtotal = money(t)));
    cy.getByTest('tax-label').invoke('text').then((t) => (totals.tax = money(t)));
    cy.getByTest('total-label').invoke('text').then((t) => (totals.total = money(t)));
    return cy.wrap(totals);
  }

  finish() {
    cy.getByTest('finish').click();
  }

  get completeHeader() {
    return cy.getByTest('complete-header');
  }
}

export const checkoutPage = new CheckoutPage();
