var express = require('express');

/******************************************
 *
 *  App
 *
 ******************************************/

var app = express();

var RabbitMQModel = require('./models/rabbitMQ');

RabbitMQModel.init();




