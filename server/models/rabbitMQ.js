var amqp = require('amqplib');
var Promise = require('bluebird');


var channel = null;
var rabbitMQ = {};


rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect('amqp://192.168.1.135').then(function (conn) {
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;
                resolve();
            });
        });
    });
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