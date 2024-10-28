import { eshopSelectors } from "../selectors/eShopSelectors";
import { eshopStrings } from "../e2e/testData/eShopStrings";

export function visitHomePage() {
  cy.visit("/");
  cy.get("#c-inr").should("not.exist"); // ensure GDPR popup is not present
}

export function searchProduct() {
  cy.intercept(`${eshopSelectors.pathTV}*`).as("loadTVList");
  cy.visit("/televize.html");
  cy.get(eshopSelectors.mostExpensiveCategory).click();
  cy.wait("@loadTVList").its("response.statusCode").should("eq", 200);
  // this should ensure the category was swapped, but Im not 100% confident in this solution
  cy.url().should("include", eshopSelectors.mostExpensiveCategoryUrlFilter);
}

export function addProductToCart(place: number, cartList: string[]) {
  cy.get(eshopSelectors.productList)
    .children()
    .children()
    .eq(place)
    .within((el) => {
      cy.intercept("POST", `${eshopSelectors.pathCart}*`).as("addToCart");
      cy.get(eshopSelectors.buttonAddToCard).click();
      cy.wait("@addToCart");
      cy.get("[data-product-match]")
        .invoke("attr", "data-product-match")
        .then((val) => {
          cy.log(`FOUND: ${val}`);
          cartList.push(val);
        });
    });

  cy.closeModalAttempt(eshopSelectors.closeModalButton);
  cy.get(eshopSelectors.addedToCartModal, { timeout: 10000 }).should(
    "not.exist"
  );
  return cartList;
}

// following functions are part of 'finishing the order'
export function goToCheckout() {
  cy.get(eshopSelectors.cartHref).click();
  cy.url().should("include", eshopSelectors.pathCart);
}

export function assertProductsInCart(cartList) {
  // My way of "injecting" JS/TS into Cypress so it executes properly;
  // It looks illegal, but as long as it works..
  cy.then(() => {
    for (let i = 0; i < cartList.length; i++) {
      cy.log(cartList[i]);
      cy.get(`[data-match="${cartList[i]}"]`).should("exist");
    }
  });
}

export function payForProduct() {
  cy.get(eshopSelectors.cartContinueDoprava).eq(1).should("be.visible").click();
  cy.url().should("include", eshopSelectors.pathDelivery);
  cy.get(eshopSelectors.deliveryBasketOptions).should("be.visible").click();
  cy.get(eshopSelectors.deliveryDropdown).select(
    eshopStrings.deliveryDropdownValCity
  );
  // WIP
  // Facing issues with the site - dropdown/flow for delivery and payment choices not working properly on chrome
  // Seems to be issue with my Chrome for some reason - maybe adblock or something. Headed browser in Cypress player seems to be working fine.
}
