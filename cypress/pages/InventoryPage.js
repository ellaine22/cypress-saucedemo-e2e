const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

class InventoryPage {
  visit() {
    cy.visit('/inventory.html', { failOnStatusCode: false });
  }

  get items() {
    return cy.getByTest('inventory-item');
  }

  get sortSelect() {
    return cy.getByTest('product-sort-container');
  }

  get cartBadge() {
    return cy.getByTest('shopping-cart-badge');
  }

  get cartLink() {
    return cy.getByTest('shopping-cart-link');
  }

  itemNames() {
    return cy
      .getByTest('inventory-item-name')
      .then(($els) => Cypress._.map($els, (el) => el.innerText.trim()));
  }

  itemPrices() {
    return cy
      .getByTest('inventory-item-price')
      .then(($els) => Cypress._.map($els, (el) => Number(el.innerText.replace('$', ''))));
  }

  sortBy(option) {
    this.sortSelect.select(option);
  }

  addToCart(productName) {
    cy.getByTest(`add-to-cart-${toSlug(productName)}`).click();
  }

  removeFromCart(productName) {
    cy.getByTest(`remove-${toSlug(productName)}`).click();
  }

  openCart() {
    this.cartLink.click();
  }

  logout() {
    cy.get('#react-burger-menu-btn').click();
    cy.get('#logout_sidebar_link').should('be.visible').click();
  }
}

export const inventoryPage = new InventoryPage();
