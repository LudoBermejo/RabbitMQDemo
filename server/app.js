/******************************************
 *
 *  App
 *
 ******************************************/


var RabbitMQModel = require('./models/rabbitMQ');


/******************************************
 *
 *  Initialize server
 *
 ******************************************/

RabbitMQModel.init().then(function()
{
    RabbitMQModel.prepareResultConsumer();
    for(var i=0;i<=10;i++)
    {
        var obj = { id: i, name:"Job server port  #" + i}
        RabbitMQModel.sendJob(obj);
    }
})

