describe('Room Test', () => {
    beforeEach(function () {

    })

    it('List rooms', function () {
        cy.visit('http://localhost:8080/');

        cy.get('div[class=rooms]').its('length').should('eq', 1);
    })

    it('Creates, joins and start a room', function () {
        cy.visit('http://localhost:8080/');

        cy.intercept('GET', '/trivia/tags*', {
            statusCode: 200,
            body: [
                { category: 'Video games', value: 2 },
                { category: 'Science: Computers', value: 18 },
                { category: 'Science: Gadgets', value: 30 },
            ],
        }).as('getTags');

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

        cy.get('button[name=startQuizzBtn]').should('exist').click();

        cy.intercept('GET', '/question/*').as('getQuestion');
        cy.wait('@getQuestion');

        cy.get('div[class=users-in-room]').its('length').should('eq', 1);

        cy.get('#vue-countdown').should('exist');
    })

    it('Creates and leaves a room', function () {
        cy.visit('http://localhost:8080/');

        cy.intercept('GET', '/trivia/tags*', {
            statusCode: 200,
            body: [
                { category: 'Video games', value: 2 },
                { category: 'Science: Computers', value: 18 },
                { category: 'Science: Gadgets', value: 30 },
            ],
        }).as('getTags');

        cy.intercept('POST', '/room/join/*').as('joinRoom');

        cy.get('input[name=hostRoomName]').type('newroom');
        cy.get('button[name=hostRoomSubmit]').click();

        cy.wait('@joinRoom');
        cy.url().should('include', '/room/');

        cy.visit('http://localhost:8080/');
        cy.get('div[class=rooms]').its('length').should('eq', 1);
    })

    it('Joins a room', function () {
        cy.visit('http://localhost:8080/');

        cy.intercept('GET', '/trivia/tags*', {
            statusCode: 200,
            body: [
                { category: 'Video games', value: 2 },
                { category: 'Science: Computers', value: 18 },
                { category: 'Science: Gadgets', value: 30 },
            ],
        }).as('getTags');

        cy.intercept('POST', '/room/join/*').as('joinRoom');

        cy.get('.button-join-room').first().click();

        cy.wait('@joinRoom');
        cy.url().should('include', '/room/');
        cy.get('div[class=users-in-room]').its('length').should('eq', 2);
    })
});
