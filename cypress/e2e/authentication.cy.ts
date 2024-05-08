
describe('Authentication Test', () => {
    beforeEach(function () {
        cy.fixture('user').as('userData');

        cy.intercept('POST', '/user/login', (req) => {
            if (req.body.username !== this.userData.username || req.body.password !== this.userData.password) {
                req.reply({
                    statusCode: 404,
                    body: { message: 'Identifiants incorrects' },
                });
            } else {
            req.reply({ fixture: 'user.json' });
            }
        }).as('login');

        cy.intercept('POST', '/user/register', (req) => {
            req.reply({ fixture: 'user.json' });
        }).as('register');
    });

    it('Logs in to the application', function () {
        cy.visit('http://localhost:8080/authentication');

        cy.get('input[name=loginUsername]').type(this.userData.username);
        cy.get('input[name=loginPassword]').type(this.userData.password);

        cy.get('button[name=loginSubmit]').click();

        cy.url().should('eq', 'http://localhost:8080/');
    });

    it('Displays an error with invalid credentials', function () {
        cy.visit('http://localhost:8080/authentication');

        cy.get('input[name=loginUsername]').type(this.userData.username);
        cy.get('input[name=loginPassword]').type('invalidpassword');

        cy.get('button[name=loginSubmit]').click();

        cy.url().should('eq', 'http://localhost:8080/authentication');
        cy.get('div.bg-error').should('exist').and('contain', 'Identifiants incorrects');
    });

    it('Registers a new user (checking not secured password first)', function () {
        cy.visit('http://localhost:8080/authentication'); // replace with your registration page URL

        cy.get('input[name=registerUsername]').type('newuser'); // replace 'newuser' with the username to register
        cy.get('input[name=registerPassword]').type('newpassword'); // replace 'newpassword' with the password to register

        cy.get('button[name=registerSubmit]:disabled').should('exist');

        cy.get('input[name=registerPassword]').type('Myt3st312!');
        cy.get('button[name=registerSubmit]').click();
        cy.url().should('eq', 'http://localhost:8080/');
    });
});
