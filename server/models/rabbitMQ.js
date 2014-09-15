var amqp = require('amqplib');
var Promise = require('bluebird');


var channel = null;
var rabbitMQ = {};


rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect('amqp://54.77.209.64').then(function (conn) {
            console.log("A")
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;
                resolve();
            });
        });
    });
}

rabbitMQ.prepareResultConsumer = function(obj)
{
    var q = "result_queue";
    var ok = channel.assertQueue(q, {durable: true});
    ok = ok.then(function() { ch.prefetch(1); });
    ok = ok.then(function() {
        ch.consume(q, doWork, {noAck: false});
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
}

rabbitMQ.onResult= function(msg) {
    console.log(" [x] Received '%s'", body);
    channel.ack(msg);

}

rabbitMQ.sendJob = function(obj)
{
    var q = 'jobs_queue';
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