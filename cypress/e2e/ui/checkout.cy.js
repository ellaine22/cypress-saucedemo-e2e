import { inventoryPage } from '../../pages/InventoryPage';
import { cartPage } from '../../pages/CartPage';
import { checkoutPage } from '../../pages/CheckoutPage';

const TAX_RATE = 0.08;
const customer = { firstName: 'Maria', lastName: 'Santos', postalCode: '94016' };
const products = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

describe('Checkout', () => {
  beforeEach(() => {
    cy.loginAs('standard');
    inventoryPage.visit();
    products.forEach((p) => inventoryPage.addToCart(p));
    inventoryPage.openCart();
  });

  it('lists the selected products in the cart', () => {
    cartPage.itemNames().should('deep.equal', products);
  });

  it('completes an order end to end', { tags: '@smoke' }, () => {
    cartPage.checkoutButton.click();
    checkoutPage.fillInformation(customer);
    checkoutPage.finish();

    checkoutPage.completeHeader.should('have.text', 'Thank you for your order!');
    inventoryPage.cartBadge.should('not.exist');
  });

  it('calculates subtotal, tax and total correctly', () => {
    cartPage.checkoutButton.click();
    checkoutPage.fillInformation(customer);

    checkoutPage.itemPrices().then((prices) => {
      const expectedSubtotal = Cypress._.sum(prices);

      checkoutPage.summary().then(({ subtotal, tax, total }) => {
        expect(subtotal).to.eq(expectedSubtotal);
        expect(tax).to.be.closeTo(expectedSubtotal * TAX_RATE, 0.01);
        expect(total).to.be.closeTo(subtotal + tax, 0.01);
      });
    });
  });

  const requiredFields = [
    { omit: 'firstName', message: 'First Name is required' },
    { omit: 'lastName', message: 'Last Name is required' },
    { omit: 'postalCode', message: 'Postal Code is required' },
  ];

  requiredFields.forEach(({ omit, message }) => {
    it(`requires ${omit} before continuing`, () => {
      cartPage.checkoutButton.click();
      checkoutPage.fillInformation({ ...customer, [omit]: '' });
      checkoutPage.error.should('contain.text', message);
    });
  });

  it('returns to the inventory with the cart intact', () => {
    cartPage.continueShoppingButton.click();
    cy.url().should('include', '/inventory.html');
    inventoryPage.cartBadge.should('have.text', String(products.length));
  });
});
