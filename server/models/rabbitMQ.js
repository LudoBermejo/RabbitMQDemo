var amqp = require('amqplib');
var Promise = require('bluebird');

var channel = null;
var rabbitMQ = {};


rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect('amqp://nodejs:mynodepassword@192.168.1.111:5672').then(function (conn) {
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;
                rabbitMQ.prepareJobsEmmitter
                rabbitMQ.prepareResultConsumer();
                resolve();
            });
        });
    });
}

rabbitMQ.prepareJobsEmmitter = function(obj)
{

}

rabbitMQ.prepareResultConsumer = function(obj)
{
    var q = "result_queue_priorized";
    var ok = channel.assertQueue(q, {durable: true, arguments: {"x-max-priority": 10}});
    ok = ok.then(function() { channel.prefetch(1); });
    ok = ok.then(function() {
        channel.consume(q, rabbitMQ.onResult, {noAck: false});
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
}

rabbitMQ.onResult= function(msg) {
    var body = msg.content.toString();

    console.log(" [x] Received ", JSON.parse(body));
    channel.ack(msg);

}

rabbitMQ.sendJob = function(obj,priority)
{
    var q = 'jobs_queue_priorized';
    var ok = channel.assertQueue(q, {durable: true, arguments: {"x-max-priority": 10}});

    priority = priority || 1;

    console.log(priority);
    var msg = JSON.stringify(obj);
    ok.then(function() {
        channel.sendToQueue(q, new Buffer(msg), {persistent: true, "x-max-priority": priority, priority: priority}, function (err, ok) {

            if (err !== null)
                console.warn('Message nacked!');
            else
                console.log('Message acked');
        });
    });

}


module.exports = rabbitMQ;