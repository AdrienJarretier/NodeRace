/**
@brief : module qui realise la gestion du moteur du jeu
	il fait les calculs et les renvoit au différents joueur (clients)
**/

var rails = [];
for(var i=0; i<2; i++)
	rails[i] = [];

for(var j=0; j<2; j++)
{
	for(var i=0; i<80; i++)
	{
		rail = {
					x: 70+i*6, 
					y: 20+j*40
			   }
		rails[j].push(rail);
	}
	for(var i=0; i<180; i++)
	{
		rail = {
					x: 70+80*6+(50+40*(1-j))*Math.cos((90-i)/180*Math.PI),
					y: 20+40+50-(50+40*(1-j))*Math.sin((90-i)/180*Math.PI)
			   }
		rails[j].push(rail);
	}
}

var VMAX = 200; // u/sec
var VMAX_STABLE = 150;
var FACTOR = 3;
// var ACCEL_FACTOR = 3;
// var SLOWDOWN_FACTOR = 3;

exports.updateMove = function (carInfos, elapsedTime)
{
	carInfos.speed += (carInfos.accel*VMAX*FACTOR - carInfos.speed*FACTOR) * elapsedTime;

	var distance = carInfos.speed * elapsedTime;
	var x = rails[carInfos.id][carInfos.nextTrajectoryIndex].x-carInfos.position.x;
	var y = rails[carInfos.id][carInfos.nextTrajectoryIndex].y-carInfos.position.y;

	distance -= Math.sqrt(x*x+y*y);

	while(distance>0)
	{
		carInfos.position = rails[carInfos.id][carInfos.nextTrajectoryIndex];

		if(++carInfos.nextTrajectoryIndex >= rails[carInfos.id].length)
			carInfos.nextTrajectoryIndex=0;

		x = rails[carInfos.id][carInfos.nextTrajectoryIndex].x-carInfos.position.x;
		y = rails[carInfos.id][carInfos.nextTrajectoryIndex].y-carInfos.position.y;

		distance -= Math.sqrt(x*x+y*y);
	}

	var newAngle = Math.atan2(x, y);
	if(carInfos.angle != newAngle && carInfos.speed>VMAX_STABLE)
		carInfos.angle -= Math.PI/90*carInfos.speed/VMAX_STABLE;
	else
	{
		if(carInfos.angle<newAngle-Math.PI/90* VMAX_STABLE/carInfos.speed)
			carInfos.angle += Math.PI/90* VMAX_STABLE/carInfos.speed;
		else
			carInfos.angle = newAngle;
	}

	distance = distance/Math.sqrt(x*x+y*y)+1;

	carInfos.position.x += distance*x; 
	carInfos.position.y += distance*y;

 	if(carInfos.position.x < 0) 
 	{
 		carInfos.position.x = 0;
 		carInfos.velocity.x = 0;
 		carInfos.velocity.y = 0;
 	}
 	if(carInfos.position.x > 800) 
 	{
 		carInfos.position.x = 800;
 		carInfos.velocity.x = 0;
 		carInfos.velocity.y = 0;
 	}
 	if(carInfos.position.y < 0) 
 	{
 		carInfos.position.y = 0;
 		carInfos.velocity.x = 0;
 		carInfos.velocity.y = 0;
 	}
 	if(carInfos.position.y > 350) 
 	{
 		carInfos.position.y = 350;
 		carInfos.velocity.x = 0;
 		carInfos.velocity.y = 0;
 	}
}
