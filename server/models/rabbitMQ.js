var amqp = require('amqplib');
var Promise = require('bluebird');


var channel = null;
var rabbitMQ = {};


rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect('amqp://localhost').then(function (conn) {
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;
                resolve();
            });
        });
    });
}

rabbitMQ.sendJob = function(obj)
{
    var q = 'task_queue';
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
/*rabbitMQ.sendJob = function(obj)
{
    amqp.connect('amqp://localhost').then(function(conn) {
        return when(conn.createConfirmChannel().then(function(ch) {
            var q = 'task_queue';
            var ok = ch.assertQueue(q, {durable: true});

            var msg = JSON.stringify(obj);
            return ok.then(function() {


                ch.sendToQueue(q, new Buffer(msg), {persistent: true},  function(err, ok) {
                    console.log(err);
                    console.log(ok);
                    if (err !== null)
                        console.warn('Message nacked!');
                    else
                        console.log('Message acked');
                });
                console.log(" [x] Sent '%s'", msg);
                return ch.close();
            });
        })).ensure(function() { conn.close(); });
    }).then(null, console.warn);
}*/


module.exports = rabbitMQ;