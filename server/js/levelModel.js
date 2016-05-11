/*
This module loads levels for each game
*/
var fs = require('fs');

var NB_RAIL = 2;
var NB_TOUR = 3;

exports.loadLevel = function(trackName) {

    var tiles = JSON.parse(fs.readFileSync(trackName + '.json', 'utf8'));
    var rails = [];

    var tileInfo = JSON.parse(fs.readFileSync('TileInfo.json', 'utf8'));

    var tileInfoArrayPoints = [];

    for (var i = 0; i < tileInfo.length; i++) {
        tileInfoArrayPoints[tileInfo[i].id] = tileInfo[i].points;
    }

    for (var i = 0; i < NB_RAIL; i++) {
        rails[i] = [];
    }

    // console.log("\ntiles :");
    // console.log(tiles);

    console.log("");
    console.log("tileInfoArrayPoints :");
    console.log(tileInfoArrayPoints);
    console.log("");

    var part = tiles.parts[0];

    // we push the first starting part of the track
    var points = rotate(tileInfoArrayPoints[part.id], -part.rotation);

    for (var j = 0; j < points.length; j++) { // for each point of this part

        for (var k = 0; k < NB_RAIL; k++) { // for each rail

            // next step when rails will be properly created
            //use rails[ k ].push(tiles[ i ].listPoint[ k ][ j ]);

            rails[k].push(points[j]);
        }
    }

    // build the rail
    for (var i = 1; i < tiles.parts.length; i++) { // for each part of the track

        part = tiles.parts[i];
        points = rotate(tileInfoArrayPoints[part.id], -part.rotation);

        for (var j = 0; j < points.length; j++) { // for each point of this part

            for (var k = 0; k < NB_RAIL; k++) { // for each rail

                // next step when rails will be properly created
                //use rails[ k ].push(tiles[ i ].listPoint[ k ][ j ]);

                rails[k].push(points[j]);
            }
        }
    };

    return rails;
}

exports.isFinish = function(instance) {
    if (instance.launched) {
        //check if a player has finished the track
        for (var i = 0; i < instance.nbCars; i++) {
            if (instance.cars[i].lap < instance.nbLaps) {
                return false;
            }
        }
        //otherwise that means the track is not finished
        return true;
    }
    return false;
}

exports.getTrackPosition = function(instance, io) {
    //nextTrajectoryIndex + 1 to avoid mul by zero when the game is restarted
    var sorting = function(a, b) {
        var valA = a.lap * (a.nextTrajectoryIndex + 1);
        var valB = b.lap * (b.nextTrajectoryIndex + 1);
        return valB - valA;
    }

    var arrayPos = [];
    for (var i = 0; i < instance.nbCars; i++) {
        //emit client position
        var carPos = {
            lap: instance.cars[i].lap,
            nextTrajectoryIndex: instance.cars[i].nextTrajectoryIndex,
            sock: instance.cars[i].sock
        };
        arrayPos.push(carPos);
    }

    //sort the array in descending order
    arrayPos.sort(sorting);

    for (var i = 0; i < arrayPos.length; i++) {
        //emit client position
        var pos = i + 1;
        io.to(arrayPos[i].sock).emit('trackPosition', pos);
    }
}

function rotateXY(point, a) {

    var x = point.x;
    var y = point.y;

    return {
        x: x * Math.cos(a) - y * Math.sin(a),
        y: y * Math.cos(a) + x * Math.sin(a)
    };

}

function roundCoordinates(point) {

    point.x = Math.round(point.x * 10) / 10;
    point.y = Math.round(point.y * 10) / 10;;

    return point;

}

function rotate(tileInfoPoints, rotation) {

    resultCoords = [];

    rotation = Math.PI * rotation / 180; // set the rotation in radians

    for (var i = 0; i < tileInfoPoints.length; i++) {
        resultCoords.push(roundCoordinates(rotateXY(tileInfoPoints[i], rotation)));
    };

    return resultCoords;

}