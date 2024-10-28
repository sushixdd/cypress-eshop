declare namespace Cypress {
  interface Chainable {
    dataCy(value: string);
    apiLogin(username, password: string);
    loginByAPI(username, password: string);
    manualLogin(username, password: string);
    fakeCookieConsent();
    closeModalAttempt(selectorCloseButton: string);
  }
}

// Outdated, long after this was written I realized I dont need to log in (probably)
// In actual work I wouldn't push unused code, but in this case I dont think it hurts
Cypress.Commands.add("manualLogin", (username, password) => {
  cy.get("#snippet--header-user").contains("Přihlásit").click();
  cy.get("#snippet--header-loginForm-dialog").should("exist");
  cy.get("#frm-login").type(username);
  cy.get("#frm-password").type(password);
  cy.get('button[type="submit"]').click();
});

// Tried implementing api login, didn't work
// Usually there's a call to /login endpoint for example
// Spent quite some time researching this and tried many solutions (out of my own curiosity)
// No luck, I'd probably need more insight in their api documentation/code. Either way, leaving my solution(s) as "proof of concept".
Cypress.Commands.add("apiLogin", (username, password) => {
  cy.session([username, password], () => {
    cy.request({
      method: "POST",
      url: "/",
      body: {
        _action: "login",
        username,
        password,
      },
    }).then((response) => {
      window.localStorage.setItem("authToken", response.body.token);
      cy.log(String(response)); // debugging
    });
  });
});

Cypress.Commands.add("loginByAPI", (username, password) => {
  cy.request({
    method: "POST",
    url: "/",
    body: { username, password },
  }).then((response) => {
    const token = response.body.token;

    window.localStorage.setItem("auth_token", token);

    cy.session([username, password], () => {
      cy.visit("/");
      window.localStorage.setItem("auth_token", token);
    });
  });
});

// Found this cookie through manual testing and extracted its value
// Setting this cookie seems to silence the "GDPR popup"
// Not sure if this is a viable long-term solution, but at least for now I'd prefer it over clicking the form manually
Cypress.Commands.add("fakeCookieConsent", () => {
  cy.setCookie(
    "cc-settings",
    "%7B%22categories%22%3A%5B%22functionality_storage%22%2C%22personalization_storage%22%2C%22ad_storage%22%2C%22analytics_storage%22%5D%2C%22level%22%3A%5B%22functionality_storage%22%2C%22personalization_storage%22%2C%22ad_storage%22%2C%22analytics_storage%22%5D%2C%22revision%22%3A0%2C%22data%22%3A%7B%22last_action_date%22%3A%222024-10-28T06%3A00%3A56.808Z%22%7D%2C%22rfc_cookie%22%3Atrue%2C%22consent_date%22%3A%222024-10-28T06%3A00%3A56.762Z%22%2C%22consent_uuid%22%3A%225631c132-99f4-4064-9831-5b554089b9c5%22%2C%22last_consent_update%22%3A%222024-10-28T06%3A00%3A56.762Z%22%7D"
  );
});

// Not happy with this solution at all - especially the implicit wait
// Modal sometimes isn't closed in a single click - possibly due to random ad popup
// Another click might be required, but not always
// Without implicit wait, another click is queued even though the previous closed the modal, causing the site to "refresh" and the queued click targeting element which no longer exists
// After too much time spent researching more humane solution, I decided to cut my loss and just deal with it somehow
Cypress.Commands.add("closeModalAttempt", (selectorCloseButton: string) => {
  cy.get(selectorCloseButton).should("be.visible").click();
  cy.wait(500);
  cy.get("body").then((body) => {
    if (body.find(selectorCloseButton).length) {
      cy.closeModalAttempt(selectorCloseButton);
    }
  });
});
