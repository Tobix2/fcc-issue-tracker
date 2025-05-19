const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId; // Used for update and delete tests

suite('Functional Tests', function () {

  suite('POST /api/issues/:project', function () {

    test('Create issue with all fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test issue text',
          created_by: 'Tester',
          assigned_to: 'Dev',
          status_text: 'Pending'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Test Title');
          assert.equal(res.body.issue_text, 'Test issue text');
          testId = res.body._id;
          done();
        });
    });

    test('Create issue with only required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Required Title',
          issue_text: 'Required text',
          created_by: 'Tester'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create issue with missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/testproject')
        .send({
          issue_text: 'Missing title',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/:project', function () {

    test('View all issues on a project', function (done) {
      chai
        .request(server)
        .get('/api/issues/testproject')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/testproject')
        .query({ created_by: 'Tester' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Tester');
          });
          done();
        });
    });

    test('View issues with multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/testproject')
        .query({ created_by: 'Tester', issue_title: 'Test Title' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Tester');
            assert.equal(issue.issue_title, 'Test Title');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/:project', function () {

    test('Update one field', function (done) {
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({ _id: testId, issue_text: 'Updated text' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update multiple fields', function (done) {
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testId,
          issue_title: 'Updated title',
          assigned_to: 'New Dev'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update with missing _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({ issue_title: 'Fail' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update with no fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({ _id: testId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update with invalid _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({ _id: 'invalid123', issue_title: 'Something' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/:project', function () {

    test('Delete issue with valid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/testproject')
        .send({ _id: testId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete issue with missing _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/testproject')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Delete issue with invalid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/testproject')
        .send({ _id: 'nonexistent123' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
  });

});
