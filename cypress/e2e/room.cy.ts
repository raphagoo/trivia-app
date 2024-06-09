describe('Room Test', () => {
    beforeEach(function () {
        cy.fixture('user').as('userData');
    })

    it('List rooms', function () {
        cy.visit('http://localhost:8080/');

        cy.get('div[class=rooms]').its('length').should('eq', 1);
    })

    it('Creates a room', function () {
        cy.visit('http://localhost:8080/');

        cy.intercept('POST', '/room/join/*').as('joinRoom');

        cy.get('input[name=hostRoomName]').type('newroom');
        cy.get('button[name=hostRoomSubmit]').click();

        cy.wait('@joinRoom');
        cy.url().should('include', '/room/');

        cy.get('.checkboxDifficulty').its('length').should('eq', 3);

        cy.url().should('match', /http:\/\/localhost:8080\/room\/.+/);
        cy.get('.v-slider-thumb').first() // replace with the selector for your v-slider
        .click() // simulate clicking on the slider
        .trigger('mousedown') // start the dragging
        .trigger('mousemove', { clientX: 500 }) // move the slider to the right; replace 200 with the desired value
        .trigger('mouseup'); // end the dragging
        cy.get('.v-slider-thumb').last() // replace with the selector for your v-slider
        .click() // simulate clicking on the slider
        .trigger('mousedown') // start the dragging
        .trigger('mousemove', { clientX: 0 }) // move the slider to the right; replace 200 with the desired value
        .trigger('mouseup'); // end the dragging

        cy.get('button[name=startQuizzBtn]').should('exist');
    })
});
