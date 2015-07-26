var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    Consumer = kafka.Consumer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.Client("zookeeper." + process.env.RIOX_ENV + ".svc.cluster.local:2181" ),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message'),
    payloads = [
      { topic: 'topic1', messages: 'hi', partition: 0 },
      { topic: 'topic2', messages: ['hello', 'world', km] }
    ],
    consumer = new Consumer(
        client,
        [
            { topic: 'topic1', partition: 0 },
            { topic: 'topic2', partition: 0 }
        ],
        {
            autoCommit: false
        }
    );


describe("Kafka smoke tests", function() {
  this.timeout(3000);

  it("send data", function(done) {
    producer.on('ready', function () {
      producer.send(payloads, function (err, data) {
        console.log(data);
        done();
      });
    });
    producer.on('error', function (err) {})
  });

  // it("receives data", function(done) {
  //   setTimeout(function(done) {
  //     consumer.on('message', function (message) {
  //       console.log(message);
  //     });
  //     done();
  //   },
  //   2000);
  // });

});
