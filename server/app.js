var express = require('express');

/******************************************
 *
 *  App
 *
 ******************************************/

var app = express();

var RabbitMQModel = require('./models/rabbitMQ');




var port;
// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    port = 8095;
}
else if (app.get('env') === 'test') {
    port = 8095;
}
// production error handler
// no stacktraces leaked to user
else
{
    port = 8090;
}

port = Math.round(Math.random()*10000);

/******************************************
 *
 *  Initialize server
 *
 ******************************************/

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});


RabbitMQModel.init().then(function()
{
    for(var i=0;i<=10;i++)
    {
        var obj = { id: i, name:"Job server port " + port + " #" + i}
        RabbitMQModel.sendJob(obj);
    }
})

