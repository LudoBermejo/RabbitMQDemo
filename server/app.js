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


    for(var i=0;i<=9;i++)
    {
        var obj = { id: i, name:"Job server port  #" + i, priority: i+1}
        RabbitMQModel.sendJob(obj, i+1);
    }
})

