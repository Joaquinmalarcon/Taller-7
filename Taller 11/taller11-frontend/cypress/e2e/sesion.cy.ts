describe("Sesión", () => {
  it("inicia sesión con un usuario de prueba", () => {
    cy.visit("/login");
    cy.get('input[autocomplete="username"]').type("ana");
    cy.get('input[type="password"]').type("ana-12345");
    cy.get('ion-button[type="submit"]').click();

    cy.url().should("include", "/publicaciones");
    cy.get(".usuario").should("have.text", "ana");
  });

  it("muestra error y no guarda sesión con credenciales incorrectas", () => {
    cy.visit("/login");
    cy.get('input[autocomplete="username"]').type("ana");
    cy.get('input[type="password"]').type("clave-mala");
    cy.get('ion-button[type="submit"]').click();

    cy.url().should("include", "/login");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "taller9-sesion")
      .should("be.null");
  });

  it("cierra sesión al presionar Salir", () => {
    cy.visitarConSesion("/publicaciones", "ana", "ana-12345");
    cy.contains("ion-button", "Salir").click();

    cy.url().should("include", "/login");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "taller9-sesion")
      .should("be.null");
  });
});