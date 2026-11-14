// Restful Booker is a shared public sandbox, so every test creates its own
// booking instead of relying on existing data.
describe('Booking API', () => {
  const api = () => Cypress.expose('apiUrl');
  const jsonHeaders = { Accept: 'application/json' };

  let payload;

  beforeEach(() => {
    cy.fixture('booking').then((data) => {
      payload = { ...data, firstname: `${data.firstname}-${Date.now()}` };
    });
  });

  const createBooking = () =>
    cy.request({ method: 'POST', url: `${api()}/booking`, headers: jsonHeaders, body: payload });

  it('creates a booking and returns it with an id', { tags: '@smoke' }, () => {
    createBooking().then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.bookingid).to.be.a('number');
      expect(body.booking).to.deep.equal(payload);
    });
  });

  it('retrieves a booking by id', () => {
    createBooking().then(({ body }) => {
      cy.request({ url: `${api()}/booking/${body.bookingid}`, headers: jsonHeaders }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.deep.equal(payload);
      });
    });
  });

  it('finds the booking when filtering by name', () => {
    createBooking().then(({ body }) => {
      cy.request({
        url: `${api()}/booking`,
        qs: { firstname: payload.firstname, lastname: payload.lastname },
      })
        .its('body')
        .then((results) => {
          const ids = results.map((r) => r.bookingid);
          expect(ids).to.include(body.bookingid);
        });
    });
  });

  it('updates a booking with a valid token', () => {
    createBooking().then(({ body }) => {
      cy.apiToken().then((token) => {
        const updated = { ...payload, totalprice: 300, additionalneeds: 'Breakfast' };

        cy.request({
          method: 'PUT',
          url: `${api()}/booking/${body.bookingid}`,
          headers: { ...jsonHeaders, Cookie: `token=${token}` },
          body: updated,
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.deep.equal(updated);
        });
      });
    });
  });

  it('partially updates a booking', () => {
    createBooking().then(({ body }) => {
      cy.apiToken().then((token) => {
        cy.request({
          method: 'PATCH',
          url: `${api()}/booking/${body.bookingid}`,
          headers: { ...jsonHeaders, Cookie: `token=${token}` },
          body: { depositpaid: false },
        }).then((res) => {
          expect(res.body.depositpaid).to.eq(false);
          expect(res.body.firstname).to.eq(payload.firstname);
        });
      });
    });
  });

  it('rejects an update without authentication', () => {
    createBooking().then(({ body }) => {
      cy.request({
        method: 'PUT',
        url: `${api()}/booking/${body.bookingid}`,
        headers: jsonHeaders,
        body: payload,
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 403);
    });
  });

  it('deletes a booking and it can no longer be found', () => {
    createBooking().then(({ body }) => {
      const url = `${api()}/booking/${body.bookingid}`;

      cy.apiToken().then((token) => {
        cy.request({ method: 'DELETE', url, headers: { Cookie: `token=${token}` } })
          .its('status')
          .should('eq', 201);
      });

      cy.request({ url, failOnStatusCode: false }).its('status').should('eq', 404);
    });
  });

  it('returns a "Bad credentials" reason for a wrong password', () => {
    cy.request('POST', `${api()}/auth`, { username: 'admin', password: 'nope' })
      .its('body')
      .should('deep.equal', { reason: 'Bad credentials' });
  });
});
