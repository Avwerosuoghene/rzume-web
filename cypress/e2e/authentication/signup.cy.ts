

describe('User Signup Process', () => {
  const email = 'testuser@example.com';
  const password = 'Str0ngP@ssword!';

  it('should signup a user and send a validation link', () => {
    cy.visit('/auth/signup');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);

    cy.get('button[type="submit"]').click();

    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container p').should('contain.text', 'Please check your email for a validation link');
  })
})
