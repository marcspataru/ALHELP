describe('Login Page Route', () => {
  it('Checks if login page loads and allows typing', () => {
    cy.visit('localhost:3000')
    cy.contains('Login')
    cy.contains('Register here')
    cy.get('#name')
      .type('testname')
      .should('have.value', 'testname')
    cy.get('#password')
      .type('testpassword')
      .should('have.value', 'testpassword')
  })
})

describe('Register Page Route', () => {
  it('Checks if login redirects to register, which loads and allows typing', () => {
    cy.visit('localhost:3000')
    cy.contains('here').click()
    cy.url().should('include', '/register')
    cy.contains('Register')
    cy.contains('Login here')
    cy.get('#name')
      .type('testname')
      .should('have.value', 'testname')
    cy.get('#password')
      .type('testpassword')
      .should('have.value', 'testpassword')
    cy.get('#cpassword')
      .type('testpassword')
      .should('have.value', 'testpassword')
  })
})

describe('Account creation', () => {
  it('Registers a new account, redirects logged in user to Learning Preferences', () => {
    cy.visit('localhost:3000/register')
    cy.get('#name').type('testname')
    cy.get('#password').type('testpassword')
    cy.get('#cpassword').type('testpassword')
    cy.contains('Register').click()
    cy.url().should('include', 'learning-preferences')
    cy.get('.nav-link').contains('Logout testname')
    
  })
})