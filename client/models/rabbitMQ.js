var amqp = require('amqplib');

var rabbitMQServer = require('../conf/RabbitMQ.json');

var amqp = require('amqplib');
var Promise = require('bluebird');

var rabbitMQ = {};
var channel = null;

rabbitMQ.init = function()
{
    return new Promise(function (resolve, reject) {

        amqp.connect(rabbitMQServer[process.env.NODE_ENV].host).then(function (conn) {
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
String.prototype.rtrim = function() {
    return this.replace(/\s+$/,"");
}
rabbitMQ.onJob = function(msg)
{
    var body = msg.content.toString();
    console.log(" [x] Received '%s'", body);



    var exec = require('child_process').exec, child;
    child = exec('java -jar java.jar', {
        cwd: "java"
        },
        function (error, stdout, stderr){

            var resp = { orig: JSON.parse(body), response: null}
            if(error !== null){
                resp.response = { type: "error", value: err};
            }
            if(stderr)
            {
                resp.response = { type: "error", value: stderr};
            }
            else if(stdout)
            {
                var cad = String(stdout.rtrim());
                cad = cad.substr(cad.indexOf("{"),10000000)
                cad = cad.substr(0, cad.indexOf("}")+1)


                var file = JSON.parse(cad);

                if(file == undefined || file == null)
                {
                    resp.response = { type: "error", value: "No file returned"};
                }
                else
                {
                    console.log(file.file)
                    var result = require("../java/" + file.file);
                    resp.response = { type: "complete", value: result};
                }

            }

            channel.ack(msg);
            rabbitMQ.sendResult(JSON.stringify(resp));
        });


/*    setTimeout(function() {
        console.log(" [x] Done and sending " + body);
        channel.ack(msg);
        rabbitMQ.sendResult(body);
    }, 1000);*/

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