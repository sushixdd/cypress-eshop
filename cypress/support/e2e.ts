import "./commands";

before(() => {
  // there are some kind of errors causing cypress tests to fail
  // I don't have much of an idea what these errors are exactly
  // so we are going to ignore them - but at least with a little filter
  Cypress.on("uncaught:exception", (err, runnable) => {
    switch (true) {
      case err.message.includes("getAttribute"):
        return false;

      case err.message.includes("fbq is not defined"):
        return false;
    }
  });

  cy.fakeCookieConsent();
});
