var mongo = require('mongodb').MongoClient;
var should = require('chai').should();
var expect = require('chai').expect;

var connectionString = "mongodb://mongo." + process.env.RIOX_ENV + ".svc.cluster.local:27017/mytest"

describe("Mongo smoke tests", function() {

  it("connects successfully", function(done) {

    mongo.connect(connectionString, function(err, db) {
      should.not.exist(err);
      should.exist(db);
      db.close();
      done();
    });

  });

  it("write data", function(done) {
    mongo.connect(connectionString, function(err, db) {

      // Get the documents collection
      var collection = db.collection('documents');
      should.exist(collection);

      // Insert some documents
      collection.insert([
        {a : 1}, {a : 2}, {a : 3}
      ], function(err, result) {
        //  console.log(result);
        //  console.log(err);
        should.exist(result);
        should.not.exist(err);
        result.result.n.should.equal(3);
        result.ops.length.should.equal(3);
        db.close();
        done();
      });

    });
  });

  it("read data", function(done) {
    mongo.connect(connectionString, function(err, db) {
      // Get the documents collection
      var collection = db.collection('documents');
      // Insert some documents
      collection.remove({ a : 3 }, function(err, result) {
        should.exist(result);
        should.not.exist(err);
        result.result.n.should.equal(1);
        db.close();
        done();
      });
    });

  });

});
