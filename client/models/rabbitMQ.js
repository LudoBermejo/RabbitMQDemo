var amqp = require('amqplib');
var Promise = require('bluebird');

var rabbitMQ = {};
var channel = null;

rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect('amqp://192.168.1.111').then(function (conn) {
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;
                resolve();
            });
        });
    });
}

rabbitMQ.prepareJobsConsumer = function(obj)
{
    var q = "jobs_queue";
    var ok = channel.assertQueue(q, {durable: true});
    ok = ok.then(function() { channel.prefetch(1); });
    ok = ok.then(function() {
        channel.consume(q, rabbitMQ.onJob, {noAck: false});
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
}

rabbitMQ.onJob = function(msg)
{
    var body = msg.content.toString();
    console.log(" [x] Received '%s'", body);
    var secs = body.split('.').length - 1;
    //console.log(" [x] Task takes %d seconds", secs);
    setTimeout(function() {
        console.log(" [x] Done and sending " + body);
        channel.ack(msg);
        rabbitMQ.sendResult(body);
    }, 1000);

}

rabbitMQ.sendResult = function(obj)
{
    var q = 'result_queue';
    var ok = channel.assertQueue(q, {durable: true});

    var msg = JSON.stringify(obj);
    ok.then(function() {
        channel.sendToQueue(q, new Buffer(msg), {persistent: true}, function (err, ok) {

            if (err !== null)
                console.warn('Message nacked!');
            else
                console.log('Message acked');
        });
    });

}

module.exports = rabbitMQ;