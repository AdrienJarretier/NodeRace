/*
This module loads levels for each game
*/
var fs = require('fs');

var NB_RAIL = 4;
var NB_TOUR = 3;

var constants = require('./../public/constants.js');
constants = new constants();

//tileset.js to see the mirror function in client-side
exports.getLevelFilename = function(trackID)
{
	var path = 'public/assets/';
	if(trackID == "id56")
	{
		return path + 'tracks/default.json';
	}
	else if (trackID == "id68")
	{
		return path + 'tracks/track1.json';
	}
	else if (trackID == "id24")
	{
		return path + 'tracks/track2.json';
	}
	else if (trackID == "id32")
	{
		return path + 'tracks/default.json';
	}
	else
	{
		return path +'tracks/default.json';
	}
}

exports.loadLevel = function (trackID)
{
	var tiles = JSON.parse(fs.readFileSync(this.getLevelFilename(trackID), 'utf8'));
	var rails = [];

	for(var i=0; i < NB_RAIL; i++)
	{
		rails[i] = [];
	}

	// build the rail
	for(var i = 0; i < tiles.length; i++)
	{
		for(var j = 0; j < tiles[ i ].listPoint.length; j++)
		{
			for( var k = 0; k < NB_RAIL; k++)
			{
        // next step when rails will be properly created
        //use rails[ k ].push(tiles[ i ].listPoint[ k ][ j ]);
				rails[ k ].push(tiles[ i ].listPoint[ j ]);
			}
		}
	}
	return rails;
}

exports.isFinish = function (instance)
{
	if(instance.launched)
	{
		//check if a player has finished the track
		for (var i = 0; i < instance.nbCars; i++)
		{
			if(instance.cars[ i ].lap < instance.nbLaps)
			{
				return false;
			}
		}
		//otherwise that means the track is not finished
		return true;
	}
	return false;
}

exports.getTrackPosition = function (instance, io)
{
	//nextTrajectoryIndex + 1 to avoid mul by zero when the game is restarted
	var sorting = function (a, b) {
		var valA = a.lap * (a.nextTrajectoryIndex + 1);
		var valB = b.lap * (b.nextTrajectoryIndex + 1);
		return valB - valA;
	}

	var arrayPos = [];
	for(var i = 0; i < instance.nbCars; i++)
	{
		//emit client position
		var carPos = {lap: instance.cars[ i ].lap,
					  nextTrajectoryIndex: instance.cars[ i ].nextTrajectoryIndex,
					  sock: instance.cars[ i ].sock
					};
		arrayPos.push(carPos);
	}

	//sort the array in descending order
	arrayPos.sort(sorting);

	for(var i = 0; i < arrayPos.length; i++)
	{
		//emit client position
		var pos = i + 1;
		io.to( arrayPos[ i ].sock ).emit(constants.trackPosition, pos);
	}
}
