var express = require('express');
var app = express();
var server = require('http').Server(app);
var uuid = require('uuid');

const config = require("./js/config");

app.use(express.static(__dirname + '/../client'));

var gameModel = require('./js/levelModel')
var gameEngine = require('./js/engine');
var tools = require('./js/tools');
var chatF = require('./js/chat');

var io = require('socket.io')(server);

//load constants in server and client
app.use('/public', express.static('public'));
var constants = require('./public/constants.js');
constants = new constants();


//les variables
var instances = {};
var cars = [];

function tick(socket, carInfos) {
  //update server date
  if( instances[socket.uid] && instances[socket.uid] !== undefined )
  {
      var currentDate = new Date();
      if(
          instances[ socket.uid ].launched &&
          (currentDate.getTime() - socket.datePing.getTime()) > 5000)
      {
          console.log("{ " + socket.login + "}: Deconnection"+socket.id);
          socket.conn.close();
          tools.disconnect(socket, instances, chatF);
      }

      elapsedTime = (currentDate.getTime() - carInfos.lastTimeUpdate) / 1000;
      carInfos.lastTimeUpdate = currentDate;
      //update position thanks to gameEngine
      //gameEngine.updateMove(carInfos, elapsedTime);
      instances[ socket.uid ].engine.updateMove(carInfos, elapsedTime);
      //return track position
      gameModel.getTrackPosition(instances[ socket.uid ], io);

      if( gameModel.isFinish(instances[ socket.uid ]) )
      {
          socket.emit(constants.endGame, "fin de partie");
          socket.broadcast.to( instances[ socket.uid ].room ).emit(constants.endGame, "fin de partie");
          tools.destroyInstance(socket, instances, chatF);
      }
      else
      {
        var infos = {
                      id: carInfos.id,
                      speed: carInfos.speed,
                      position: carInfos.position,
                      angle: carInfos.angle,
                      lap: carInfos.lap
                     }
      socket.emit('myPosition', infos);
      socket.broadcast.to( instances[ socket.uid ].room ).emit('position', infos);
    }
  }
}

// client connection
io.on(constants.connection, function (socket) {
    chatF.getChatMessage(socket);

    socket.on(constants.login, function(message) {
        socket.datePing = new Date();
        var id;
        if(message.host == true)
        {
            console.log("Host : new game");
            //first car connected
            id = 0;
            var passwd = message.password;
            if(message.private != true)
            {
                passwd = "";
            }
            else
            {
                if(tools.isInstanceExist(instances, message.password))
                {
                    socket.emit(constants.isExist, "Une partie existe deja avec ce mot de passe");
                }
            }

            var newInstance = { host: socket.id,
                                room : new Date().toString(),
                                password: passwd,
                                //track.id sera l'id du circuit
                                track: message.track,
                                engine: new gameEngine.Engine(message.track),
                                nbLaps: message.laps,
                                cars: [],
                                nbCars:1,
                                minCar: message.minCar,
                                maxCar: message.maxCar,
                                launched: false
                            };

            //add room to socket.io
            socket.join(newInstance.room);
            var uid = uuid.v1();
            instances[ uid ] = newInstance
            socket.uid = uid;
            chatF.addChatInstance(socket.uid, newInstance.room);
            console.log("info new instance :"+socket.uid +"; "+newInstance.room);
        }
        else
        {
            var uid = tools.findGame(message.private, message.password, instances);
            if(uid == -1)
            {
                debugger;
                socket.emit(constants.instanceNotFound, 'Aucune partie trouvé');
                return false;
            }
            socket.uid = uid;
            //connexion id
            id = instances[ socket.uid ].nbCars;
            //add the new car
            socket.join( instances[ socket.uid ].room );
            instances[ socket.uid ].nbCars++;
        }
        socket.emit(constants.id, id);
        var infoInstance = { laps: instances[ socket.uid ].nbLaps ,
                           nbComponents: instances[ socket.uid ].minCar,
                           track: instances[ socket.uid ].track
                        };
        socket.emit(constants.infoPart, infoInstance);
        socket.broadcast.emit(constants.serverMessage, 'Un autre client vient de se connecter !');
        console.log("{ " + message.login + " }: " + ' has been connected');

        var car =
        {
            id: id,
            sock: socket.id,
            uid: socket.uid,
            nickname: message.login,
            accel: 0,  // percentage
            speed: 0,
            velocity: {x: 0, y: 0},
            position: {x: instances[ socket.uid ].engine.getStart( id ).x,
                       y: instances[ socket.uid ].engine.getStart( id ).y
                    },
            angle: 0,
            lastTimeUpdate: new Date(),
            nextTrajectoryIndex: 1,
            lap: 1,
        }

        //add car in the right instance
        instances[ socket.uid ].cars.push(car);
        console.log("information room "+JSON.stringify(instances[ socket.uid ].nbCars));

        //check if the game will start
        var instanceModified = tools.checkLaunch(instances[ socket.uid ], socket);
        instances[ socket.uid ] = instanceModified;
        socket.tick = setInterval(tick, 8, socket, car);

        //handle chat
        socket.login = message.login;
        chatF.getOldMessages(socket);
    });

    //player sent its velocity
    socket.on(constants.acceleration, function(accel) {
        if(typeof instances[socket.uid] !== 'undefined')
            instances[socket.uid].cars[accel.id].accel = accel.percent;
    });

    socket.on(constants.ping, function(clientDate) {
        datePing = new Date();
        socket.datePing = datePing;
        socket.emit(constants.ping, clientDate);
    });

    socket.on(constants.switchTrack, function(trackInfo) {
        //reset engine
        //instances[ socket.uid ].track.id = trackInfo.id;
        //gameEngine.reset( instances[ socket.uid ] );
        //tools.manageLaunch( instances[ socket.uid ], io);
    });

    // emitted when a player leave a race, a room,
    // not emitted when a socket disconnect, this is handled by 'disconnect'
    socket.on(constants.disconnection, function(message) {
       if( instances[socket.uid] && instances[ socket.uid ] !== undefined)
      {
        console.log("{ " + socket.login + ' }: disconnected from a game ( socket id :  ' + socket.id + ' ) ' );
        socket.leave( instances[ socket.uid ].room );
        tools.disconnect(socket, instances, chatF);
        clearInterval( socket.tick );
        socket.emit(constants.closeCo);
      }
    });

    socket.on(constants.disconnect, function () {
        console.log( 'user disconnected' );
    });

});

app.get('/', function(req, res)
{
   res.sendfile('index.html');
});

app.use(function(req, res, next)
{
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

server.listen(config.port, function () {

    console.log('listening on *:' + config.port);

});
