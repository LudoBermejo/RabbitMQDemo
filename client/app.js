/******************************************
 *
 *  App
 *
 ******************************************/


var RabbitMQModel = require('./models/rabbitMQ');

RabbitMQModel.init().then(function()
{
    RabbitMQModel.prepareJobsConsumer();

})


