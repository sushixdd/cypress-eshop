import {
  visitHomePage,
  searchProduct,
  addProductToCart,
  payForProduct,
  assertProductsInCart,
  goToCheckout,
} from "../../functions/eShopFunctions";

let cartList: string[] = [];

describe("Buy 2 most expensive TVs", () => {
  it("works", () => {
    visitHomePage();
    searchProduct();
    cartList = addProductToCart(0, cartList);
    cartList = addProductToCart(1, cartList);
    cy.log("CART LIST: ", cartList);
    goToCheckout();
    assertProductsInCart(cartList);
    payForProduct();
  });
});
