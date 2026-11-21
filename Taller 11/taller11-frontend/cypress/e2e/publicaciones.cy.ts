describe("Publicaciones", () => {
  beforeEach(() => {
    cy.visitarConSesion("/publicaciones", "ana", "ana-12345");
  });

  it("muestra las publicaciones iniciales", () => {
    cy.get("ion-item").should("have.length.at.least", 5);
  });

  it("crea una publicación nueva", () => {
    const titulo = `Publicación de Cypress ${Date.now()}`;
    cy.get("ion-fab-button").click();
    cy.get("ion-modal input").type(titulo);
    cy.get("ion-modal textarea").type("Creada por una prueba de interfaz");
    cy.contains("ion-modal ion-button", "Guardar").click();

    cy.contains("ion-item", titulo).should("contain", "Tuya");
  });

  it("no permite deslizar para editar o eliminar publicaciones ajenas", () => {
    cy.contains("h2", "Postman")
      .parents("ion-item-sliding")
      .should("not.exist");
  });
});