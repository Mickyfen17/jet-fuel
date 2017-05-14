const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');

process.env.NODE_ENV = 'test';

const configuration = require('../knexfile')['test'];
const database = require('knex')(configuration);
const server = require('../server/index');

chai.use(chaiHttp)

describe('Client Routes', () => {
  it('should return html on successful get', (done) => {
    chai.request(server)
    .get('/')
    .end((error, response) => {
      response.should.have.status(200)
      response.should.be.html
      done()
    })
  })

  it('should return 404 for a non existant get', (done) => {
    chai.request(server)
    .get('/error/err')
    .end((error, response) => {
      response.should.have.status(404)
      done()
    })
  })
})

describe('Api Routes', () => {
  beforeEach((done) => {
    database.migrate.latest()
    .then(() => {
      return database.seed.run()
    })
    .then(() => {
      done()
    })

  })

  afterEach((done) => {
    database.migrate.rollback()
    .then(() => {
      done()
    })
  })

  describe('GET /api/v1/folders', () => {
    it('should return all folders', (done) => {
      chai.request(server)
      .get('/api/v1/folders')
      .end((error, response) => {
        response.should.have.status(200)
        response.should.be.json
        response.body.length.should.equal(2)
        response.body[0].should.have.property('id')
        response.body[0].id.should.equal(1)
        response.body[0].should.have.property('folder_name')
        response.body[0].should.have.property('created_at')
        response.body[0].should.have.property('updated_at')
        done()
      })
    })

    it('should return an error on failed GET', (done) => {
      chai.request(server)
      .get('/api/v1/folder')
      .end((error, response) => {
        response.should.have.status(404)
        response.res.statusMessage.should.equal('Not Found')
        done()
      })
    })
  })

  describe('GET /api/v1/urls', () => {
    it('should return all urls', (done) => {
      chai.request(server)
      .get('/api/v1/urls')
      .end((error, response) => {
        response.should.have.status(200)
        response.should.be.json
        response.body.length.should.equal(4)
        response.body[0].should.have.property('id')
        response.body[0].id.should.equal(1)
        response.body[0].should.have.property('long_url')
        response.body[0].should.have.property('created_at')
        response.body[0].created_at.should.equal('a few seconds ago')
        response.body[0].should.have.property('updated_at')
        response.body[0].updated_at.should.equal('a few seconds ago')
        done()
      })
    })

    it('should return an error on failed GET', (done) => {
      chai.request(server)
      .get('/api/v1/url')
      .end((error, response) => {
        response.should.have.status(404)
        response.res.statusMessage.should.equal('Not Found')
        done()
      })
    })
  })

  describe('GET /api/v1/folders/:id/urls', () => {
    it('should return the urls for a specific folder', (done) => {
      chai.request(server)
      .get('/api/v1/folders/2/urls')
      .end((error, response) => {
        response.should.have.status(200)
        response.should.be.json
        response.body.length.should.equal(2)
        response.body[0].should.have.property('id')
        response.body[0].id.should.equal(3)
        response.body[0].should.have.property('long_url')
        response.body[0].should.have.property('created_at')
        response.body[0].created_at.should.equal('a few seconds ago')
        response.body[0].should.have.property('updated_at')
        response.body[0].updated_at.should.equal('a few seconds ago')
        done()
      })
    })

    it('should return an error on failed GET', (done) => {
      chai.request(server)
      .get('/api/v1/folders/2/url')
      .end((error, response) => {
        response.should.have.status(404)
        response.res.statusMessage.should.equal('Not Found')
        done()
      })
    })
  })

  describe('POST /api/v1/folders', () => {
    it('should create a new folder', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folder_name: 'Sport',
      })
      .end((err, response) => {
        response.should.have.status(201)
        response.body.should.be.a('object')
        response.body.should.have.property('id')
        // response.body.id.should.equal(3)
        response.body.should.have.property('folder_name')
        response.body.folder_name.should.equal('Sport')
        chai.request(server)
        .get('/api/v1/folders')
        .end((err, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(3)
          response.body[2].should.have.property('id')
          response.body[2].should.have.property('folder_name')
          response.body[2].should.have.property('created_at')
          response.body[2].should.have.property('updated_at')
          done()
        })
      })
    })

    it('should not create a folder with missing data', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({ })
      .end((err, response) => {
        response.should.have.status(400)
        response.text.should.equal('Bad Request')
        done()
      })
    })
  })

  describe('POST /api/v1/urls', () => {
    it('should create a new url', (done) => {
      chai.request(server)
      .post('/api/v1/urls')
      .send({
        url: 'www.google.com',
        activeFolder: 1,
        visits: 0
      })
      .end((err, response) => {
        response.should.have.status(201)
        response.body.should.be.a('object')
        response.body.should.have.property('id')
        response.body.id.should.equal(5)
        response.body.should.have.property('long_url')
        response.body.long_url.should.equal('www.google.com')
        response.body.should.have.property('visits')
        response.body.visits.should.equal(0)
        response.body.should.have.property('created_at')
        response.body.created_at.should.equal('a few seconds ago')
        response.body.should.have.property('updated_at')
        response.body.updated_at.should.equal('a few seconds ago')
        chai.request(server)
        .get('/api/v1/urls')
        .end((err, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(5)
          response.body[4].should.have.property('id')
          response.body[4].id.should.equal(5)
          response.body[4].should.have.property('long_url')
          response.body[4].long_url.should.equal('www.google.com')
          response.body[4].should.have.property('visits')
          response.body[4].visits.should.equal(0)
          response.body[4].should.have.property('created_at')
          response.body[4].created_at.should.equal('a few seconds ago')
          response.body[4].should.have.property('updated_at')
          response.body[4].updated_at.should.equal('a few seconds ago')
          done()
        })
      })
    });

    it('should not create a url with missing data', (done) => {
      chai.request(server)
      .post('/api/v1/urls')
      .send({
        url: 'www.google.com',
        visits: 0
      })
      .end((err, response) => {
        response.should.have.status(400)
        response.text.should.equal('Bad Request')
        done()
      })
    })
  })

  describe('DELETE /api/v1/urls/:id', () => {
    it('should delete a url', (done) => {
      chai.request(server)
      .get('/api/v1/urls')
      .end((err, response) => {
        response.body.length.should.equal(4)
        chai.request(server)
        .delete('/api/v1/urls/3')
        .end((err, response) => {
          response.should.have.status(200)
          chai.request(server)
          .get('/api/v1/urls')
          .end((err, response) => {
            response.should.be.json
            response.body.should.be.a('array')
            response.body.length.should.equal(3)
            done()
          })
        })
      })
    });

    it('should error out when url id does not exist', (done) => {
      chai.request(server)
      .delete('/api/v1/urls/err')
      .end((err, response) => {
        response.should.have.status(500)
        response.text.should.equal('Internal Server Error')
        done()
      })
    })
  })

  describe('DELETE /api/v1/folders/:id', () => {
    it('should delete a folder', (done) => {
      chai.request(server)
      .get('/api/v1/folders')
      .end((err, response) => {
        response.body.length.should.equal(2)
        chai.request(server)
        .delete('/api/v1/folders/1')
        .end((err, response) => {
          response.should.have.status(200)
          chai.request(server)
          .get('/api/v1/folders')
          .end((err, response) => {
            response.should.be.json
            response.body.should.be.a('array')
            response.body.length.should.equal(1)
            done()
          })
        })
      })
    });

    it('should delete a folder and urls within that folder', (done) => {
      chai.request(server)
      .get('/api/v1/urls')
      .end((err, response) => {
        response.body.length.should.equal(4)
        response.body[0].folder_id.should.equal(1)
        response.body[1].folder_id.should.equal(1)
        response.body[2].folder_id.should.equal(2)
        response.body[3].folder_id.should.equal(2)
        chai.request(server)
        .delete('/api/v1/folders/1')
        .end((err, response) => {
          response.should.have.status(200)
          chai.request(server)
          .get('/api/v1/urls')
          .end((err, response) => {
            response.should.be.json
            response.body.should.be.a('array')
            response.body.length.should.equal(2)
            response.body[0].folder_id.should.equal(2)
            response.body[1].folder_id.should.equal(2)
            done()
          })
        })
      })
    });

    it('should error out when folder id does not exist', (done) => {
      chai.request(server)
      .delete('/api/v1/folders/err')
      .end((err, response) => {
        response.should.have.status(500)
        response.text.should.equal('Internal Server Error')
        done()
      })
    })
  })

  describe('GET /:id', () => {
    it('should produce a redirect', (done) => {
      chai.request(server)
      .get('/2')
      .end((error, response) => {
        response.should.have.status(200)
        response.should.redirect
        response.should.redirectTo('https://www.nufc.co.uk/');
        done()
      })
    }).timeout(5000);

    it('should produce a redirect and increment visits for that url', (done) => {
      chai.request(server)
      .get('/1')
      .end((error, response) => {
        response.should.have.status(200)
        response.should.redirect
        response.should.redirectTo('http://www.nufc.com/');
        chai.request(server)
        .get('/api/v1/urls')
        .end((error, response) => {
          response.body[3].visits.should.equal(1)
          done()
        })
      })
    }).timeout(5000);
  })
})