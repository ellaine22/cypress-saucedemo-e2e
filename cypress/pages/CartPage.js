class CartPage {
  get items() {
    return cy.getByTest('inventory-item');
  }

  get checkoutButton() {
    return cy.getByTest('checkout');
  }

  get continueShoppingButton() {
    return cy.getByTest('continue-shopping');
  }

  itemNames() {
    return cy
      .getByTest('inventory-item-name')
      .then(($els) => Cypress._.map($els, (el) => el.innerText.trim()));
  }
}

export const cartPage = new CartPage();
