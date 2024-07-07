

describe('User Signup Process', () => {
  const email = 'testuser@example.com';
  const password = 'Str0ngP@ssword!';

  it('should signup a user and send a validation link', () => {
    cy.visit('/auth/signup');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);


    cy.get('[data-cy="signup-terms-check"] input').click();
    cy.get('[data-cy="signup-terms-check"] input').should('be.checked');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/auth/email-confirmation');

    cy.get('h1').should('contain.text', 'Email Confirmation');
    cy.get('p').should('contain.text', 'Please verify your email address to complete signup');
  })
})
