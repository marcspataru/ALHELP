//the makeid function below was taken from a StackOverflow comment stackoverflow.com/a/1349426/6835825
function makeid(length) {
  let result = [];
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for(let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join('');
}

// These tests were described in their corresponding section in the report
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

let randomUsername = makeid(10); // make a random username of length 10

Cypress.Cookies.preserveOnce('jwt') // preserve the JWT cookie for the next test (Cypress clears the browser state in-between tests)

describe('Account creation', () => {
  it('Registers a new account, redirects logged in user to Learning Preferences and checks if user is logged in', () => {
    cy.visit('localhost:3000/register')
    cy.get('#name').type(randomUsername)
    cy.get('#password').type('testpassword')
    cy.get('#cpassword').type('testpassword')
    cy.contains('Register').click()
    cy.url().should('include', 'learning-preferences')
    cy.get('.nav-link').contains('Logout ' + randomUsername)
  })
})

describe('Learning Preferences', () => {
  it('Completes the learning preferences questionnaire and checks if results are displayed', () => {
    cy.visit('localhost:3000')
    cy.contains('Login')
    cy.contains('Register here')
    cy.get('#name')
      .type(randomUsername)
      .should('have.value', randomUsername)
    cy.get('#password')
      .type('testpassword')
      .should('have.value', 'testpassword')
    cy.contains('Login').click()
    cy.contains('Learning Preferences').click()
    cy.url().should('include', 'learning-preferences')
    cy.get('#q1a #q1a').click()
    cy.get('#q2a #q1a').click()
    cy.get('#q3a #q1a').click()
    cy.get('#q4a #q1a').click()
    cy.get('#q5a #q1a').click()
    cy.get('#q6a #q1a').click()
    cy.get('#q7a #q1a').click()
    cy.get('#q8a #q1a').click()
    cy.get('#q9a #q1a').click()
    cy.get('#q10a #q1a').click()
    cy.get('#q11a #q1a').click()
    cy.get('#arrow-right').click()
    cy.get('#q12a #q1a').click()
    cy.get('#q13a #q1a').click()
    cy.get('#q14a #q1a').click()
    cy.get('#q15a #q1a').click()
    cy.get('#q16a #q1a').click()
    cy.get('#q17a #q1a').click()
    cy.get('#q18a #q1a').click()
    cy.get('#q19a #q1a').click()
    cy.get('#q20a #q1a').click()
    cy.get('#q21a #q1a').click()
    cy.get('#q22a #q1a').click()
    cy.get('#arrow-right').click()
    cy.get('#q23a #q1a').click()
    cy.get('#q24a #q1a').click()
    cy.get('#q25a #q1a').click()
    cy.get('#q26a #q1a').click()
    cy.get('#q27a #q1a').click()
    cy.get('#q28a #q1a').click()
    cy.get('#q29a #q1a').click()
    cy.get('#q30a #q1a').click()
    cy.get('#q31a #q1a').click()
    cy.get('#q32a #q1a').click()
    cy.get('#q33a #q1a').click()
    cy.get('#arrow-right').click()
    cy.get('#q34a #q1a').click()
    cy.get('#q35a #q1a').click()
    cy.get('#q36a #q1a').click()
    cy.get('#q37a #q1a').click()
    cy.get('#q38a #q1a').click()
    cy.get('#q39a #q1a').click()
    cy.get('#q40a #q1a').click()
    cy.get('#q41a #q1a').click()
    cy.get('#q42a #q1a').click()
    cy.get('#q43a #q1a').click()
    cy.get('#q44a #q1a').click()
    cy.get('#qsub').click()
    cy.contains('Active/Reflective:')
    cy.contains('Sensing/Intuitive:')
    cy.contains('Visual/Verbal:')
    cy.contains('Sequential/Global:')
  })
})

describe('Logic Basics Content lesson', () => {
  it('Verifies that the Logic course can be accessed and the first lesson finished (user is redirected to the second lesson', () => {
    cy.visit('localhost:3000')
    cy.contains('Login')
    cy.contains('Register here')
    cy.get('#name')
      .type(randomUsername)
      .should('have.value', randomUsername)
    cy.get('#password')
      .type('testpassword')
      .should('have.value', 'testpassword')
    cy.contains('Login').click()
    cy.contains('Courses').click()
    cy.get('.card-body').contains('Learn').click()
    //first lesson started
    cy.contains('Section 1 - Logic Statements')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 2 - Logic Operators')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 3 - Difference')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Logic Basics Content - Quiz')
    cy.get('.btn.btn-primary').eq(0).click()
    cy.get('.form-check-input').eq(0).click()
    cy.get('.form-check-input').eq(3).click()
    cy.get('.btn.btn-info').click()
    //second lesson started
    cy.contains('Section 1 - Logic operators priorities')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 2 - Truth table for compound statement')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 3 - Logic laws')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 4 - Contrapositive, converse, proof by contradiction')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Truth Tables and Laws - Quiz')
    cy.get('.btn.btn-primary').eq(0).click()
    cy.get('.form-check-input').eq(0).click()
    cy.get('.form-check-input').eq(4).click()
    cy.get('.btn.btn-info').click()
    cy.contains('Truth Tables and Laws Quiz Revision')
    cy.get('.btn.btn-primary.m-2').eq(0).click()
    //third lesson started
    cy.contains('Section 1 - Variables')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 2 - Quantifiers')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 3 - Predicates as functions')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 4 - Bound and Free variables')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Section 5 - Laws of predicate logic')
    cy.get('#arrow-right').click({force: true})
    cy.contains('Predicates - Quiz')
    cy.get('.btn.btn-primary').eq(0).click()
    cy.get('.form-check-input').eq(0).click()
    cy.get('.form-check-input').eq(3).click()
    cy.get('.btn.btn-info').click()
    //back to courses page
    cy.contains('Course completed')
  })
})
