import { inventoryPage } from '../../pages/InventoryPage';

describe('Inventory', () => {
  beforeEach(() => {
    cy.loginAs('standard');
    inventoryPage.visit();
  });

  describe('sorting', () => {
    it('sorts by name A to Z by default', () => {
      inventoryPage.itemNames().then((names) => {
        expect(names).to.deep.equal([...names].sort());
      });
    });

    it('sorts by name Z to A', () => {
      inventoryPage.sortBy('za');
      inventoryPage.itemNames().then((names) => {
        expect(names).to.deep.equal([...names].sort().reverse());
      });
    });

    it('sorts by price low to high', { tags: '@smoke' }, () => {
      inventoryPage.sortBy('lohi');
      inventoryPage.itemPrices().then((prices) => {
        expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
      });
    });

    it('sorts by price high to low', () => {
      inventoryPage.sortBy('hilo');
      inventoryPage.itemPrices().then((prices) => {
        expect(prices).to.deep.equal([...prices].sort((a, b) => b - a));
      });
    });
  });

  describe('cart badge', () => {
    it('updates as items are added and removed', () => {
      inventoryPage.cartBadge.should('not.exist');

      inventoryPage.addToCart('Sauce Labs Backpack');
      inventoryPage.cartBadge.should('have.text', '1');

      inventoryPage.addToCart('Sauce Labs Bike Light');
      inventoryPage.cartBadge.should('have.text', '2');

      inventoryPage.removeFromCart('Sauce Labs Backpack');
      inventoryPage.cartBadge.should('have.text', '1');
    });

    it('keeps cart contents after a page reload', () => {
      inventoryPage.addToCart('Sauce Labs Onesie');
      cy.reload();
      inventoryPage.cartBadge.should('have.text', '1');
    });
  });

  it('shows product details when an item is opened', () => {
    inventoryPage.items
      .first()
      .within(() => {
        cy.getByTest('inventory-item-name').invoke('text').as('name');
        cy.getByTest('inventory-item-price').invoke('text').as('price');
        cy.getByTest('inventory-item-name').click();
      });

    cy.url().should('include', '/inventory-item.html?id=');
    cy.get('@name').then((name) => {
      cy.getByTest('inventory-item-name').should('have.text', name);
    });
    cy.get('@price').then((price) => {
      cy.getByTest('inventory-item-price').should('have.text', price);
    });
  });
});
