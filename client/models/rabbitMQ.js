var amqp = require('amqplib');

var configuration = require('../conf/config.json');

var amqp = require('amqplib');
var Promise = require('bluebird');

var rabbitMQ = {};
var channel = null;

var totalJobsRunning = 0;

rabbitMQ.init = function () {
    return new Promise(function (resolve, reject) {

        amqp.connect(configuration.RabbitMQ[process.env.NODE_ENV].host).then(function (conn) {
            conn.createConfirmChannel().then(function (ch) {
                channel = ch;

                var q = configuration.RabbitMQ.jobsQueue;
                var ok = channel.assertQueue(q, {durable: true, arguments: {"x-max-priority": 10}});
                ok = ok.then(function () {
                    channel.prefetch(1);
                });
                ok = ok.then(function () {
                    channel.consume(q, rabbitMQ.onJob, {noAck: false});
                    console.log(" [*] Jobs queue created");


                    var q = configuration.RabbitMQ.resultQueue;
                    var ok = channel.assertQueue(q, {durable: true, arguments: {"x-max-priority": 10}});

                    ok.then(function () {
                        console.log(" [*] Result queue created");
                        resolve();
                    });

                });

            });
        });
    });
}

rabbitMQ.prepareJobsConsumer = function (obj) {

}
String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
}

rabbitMQ.executeJAR = function (msg, mustACK) {
    var body = msg.content.toString();

    var data = JSON.parse(body);

    var exec = require('child_process').exec, child;

    child = exec('java -jar ' + configuration.Java.file, {
            cwd: configuration.Java.path
        },
        function (error, stdout, stderr) {

            var resp = { orig: JSON.parse(body), response: null}
            if (error !== null) {
                resp.response = { type: "error", value: err};
            }
            if (stderr) {
                resp.response = { type: "error", value: stderr};
            }
            else if (stdout) {
                var cad = String(stdout.rtrim());
                cad = cad.substr(cad.indexOf("{"), 10000000)
                cad = cad.substr(0, cad.indexOf("}") + 1)


                var file = JSON.parse(cad);

                if (file == undefined || file == null) {
                    resp.response = { type: "error", value: "No file returned"};
                }
                else {
                    var result = require("../java/" + file.file);
                    resp.response = { type: "complete", value: result};
                }

            }

            if (mustACK) channel.ack(msg);
            rabbitMQ.sendResult(JSON.stringify(resp), data.priority||1);
            totalJobsRunning--;
        });

}
rabbitMQ.onJob = function (msg) {
    var body = msg.content.toString();
    console.log(" [x] Received '%s'", body);

    var mustACK = false;
    totalJobsRunning++;
    if (totalJobsRunning < configuration.Java.totalInstances) {
        channel.ack(msg);
    }
    else {
        mustACK = true;
    }

    rabbitMQ.executeJAR(msg, mustACK);


}

rabbitMQ.sendResult = function (obj,priority) {

    var q = configuration.RabbitMQ.resultQueue;
    var msg = JSON.stringify(obj);

        channel.sendToQueue(q, new Buffer(msg), {persistent: true, priority: priority}, function (err, ok) {

        });


}

module.exports = rabbitMQ;