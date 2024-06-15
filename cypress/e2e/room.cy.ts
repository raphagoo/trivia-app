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

        cy.intercept('GET', '/question/*', {
            statusCode: 200,
            body: {
                "_id": "666dac2f36bf8fb514d32c12",
                "question": "What type of pastry is used for profiteroles?",
                "category": "food_and_drink",
                "difficulty": "hard",
                "answers": [
                    {
                        "_id": "666dac2f36bf8fb514d32c21",
                        "answer": "Choux "
                    },
                    {
                        "_id": "666dac2f36bf8fb514d32c1f",
                        "answer": "Shortcrust"
                    },
                    {
                        "_id": "666dac2f36bf8fb514d32c20",
                        "answer": "Puff"
                    },
                    {
                        "_id": "666dac2f36bf8fb514d32c1e",
                        "answer": "Filo"
                    }
                ],
                "__v": 1
            },
        }).as('getQuestion');

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
