describe('Test homepage infromation', () => {
  before('login', () => {
    cy.login();
  });

  beforeEach('refresh page', () => {
    cy.visit('');
  });

  after('logout', () => {
    cy.logout();
  });

  it('Loads organization name in the homepage title', () => {
    const org: string = sessionStorage.getItem('organization');
    const orgName = JSON.parse(org);
    cy.get('div').contains(`Innbyggerkontakt i ${orgName.navn}`, { timeout: 8000 });
  });

  it.only('Loads new bulletins', () => {
    cy.get('[data-cy="newBulletin"]', { timeout: 8000 }).then((bulletins) => {
      expect(bulletins).to.have.length(4);
    });
  });

  it('Loads statistic correctly', () => {
    cy.fixture('stats').then((statsFixture) => {
      cy.intercept('GET', '/api/v1/outcome/mailjet/stats/', statsFixture).as('stats');
      cy.wait('@stats')
        .its('response.body')
        .then((body) => {
          expect(body.MessageSentCount).to.be.eq(100);
          expect(body.MessageClickedCount).to.be.eq(90);
          expect(body.MessageOpenedCount).to.be.eq(80);
          expect(body.MessageHardBouncedCount).to.be.eq(10);
        });
    });

    cy.get('[data-cy="statistics-count"]').then((stats) => {
      expect(stats).to.have.length(4);
      expect(stats[0]).to.have.text('100 sendt');
      expect(stats[1]).to.have.text('80% åpner');
      expect(stats[2]).to.have.text('90% klikker');
      expect(stats[3]).to.have.text('10% avvist');
    });
  });

  it('Shows error to user if stats api fails', () => {
    //this needs to be implemented for user
    cy.intercept('GET', '/api/v1/outcome/mailjet/stats/', { forceNetworkError: true });
  });
});
