describe('Room Test', () => {
    beforeEach(function () {
        cy.fixture('user').as('userData');

        cy.intercept('POST', '/user/guest', (req) => {
            req.reply({  "user": {
                    "_id": "id_guest",
                    "username": "guest-username",
                    "password": "password",
                    "__v": 0
                },
                "token": "token" });
        }).as('login');

        cy.intercept('POST', '/room', (req) => {
            req.reply({
                "name": "newroom",
                "inGame": false,
                "users": [],
                "owner": "id_guest",
                "_id": "id_room",
                "__v": 0
            });
        }).as('createRoom');

        cy.intercept('POST', '/room/join/id_room', (req) => {
            req.reply({
                "_id": "id_room",
                "name": "newroom",
                "inGame": false,
                "users": [
                    {
                        "_id": "id_guest",
                        "username": "guest-77bb74ac4ff29",
                        "password": "password",
                        "__v": 0
                    }
                ],
                "owner": "id_guest",
                "__v": 0
            });
        }).as('joinRoom');
    })

    it('Creates a room', function () {
        cy.visit('http://localhost:8080/');

        cy.get('input[name=hostRoomName]').type('newroom');
        cy.get('button[name=hostRoomSubmit]').click();

        cy.get('.checkboxDifficulty').its('length').should('eq', 3);

        cy.url().should('eq', 'http://localhost:8080/room/id_room');
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
