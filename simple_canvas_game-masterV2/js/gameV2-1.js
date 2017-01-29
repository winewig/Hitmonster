/**
 *  Update:
 *  1. add shot for the hero
 *  2. add the point for hitting of the monster and missing of the monster. 
 *  fix:
 *  1. At the first time hero is not in the canvas, because the heroImage has not been loaded.
 */
 
// Create the canvas according to the image
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 800;
canvas.style.left = "8px";
canvas.style.top = "8px";
canvas.style.position = "absolute";
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/backgroundBig.png";



// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Bullets image
var bulletReady = false;
var bulletImage = new Image();
bulletImage.onload = function () {
	bulletReady = true;
};
bulletImage.src = "images/bullet.png";

// Boom of monster image
var boomOfMonsterReady = false;
var boomOfMonsterImage = new Image();
boomOfMonsterImage.onload = function () {
	boomOfMonsterReady = true;
};
boomOfMonsterImage.src = "images/boomMonsterNew.png";

/** 
 * Game objects
 */ 
 
// Hero 
var hero = {
	speed: 200 // movement in pixels per second
};

// Bullet
var bulletsGroup = [];
var lastBulletAppearTime;
var bulletAppearFrequency = 80; // if the space bar is being pressed, bullet should come every 100 millisec.
function bullet(positionX, positionY) {
	this.speed = 250;
	this.x = positionX;
	this.y = positionY;
}

// Monster
var monsterGroup = [];
var monsterSpeed = 40;

// monster constructor
function monster(monsterSpeed) {
	this.speed = monsterSpeed;	// falling down in pixels per second
	this. y = 0;
	this. x = Math.random() * (canvas.width - 32);
}

var monsterCaught = 0;
var monsterMissed = 0;
var monsterNumber = 0;
var monsterAppearFrequency = 3000;

// Boom of monster
var boomOfMonsterGroup = [];
function boomOfMonster (x, y, hitTime) {
	this.x = x;
	this.y = y;
	this.hitTime = hitTime;
}

// handle user input
var buttonStates = {};

addEventListener("keydown", function (event) {
	buttonStates[event.keyCode] = true;
	if (event.keyCode === 32)
		//console.log(lastBulletAppearTime);
		lastBulletAppearTime = Date.now();
}, false);

addEventListener("keyup", function (event) {
	delete buttonStates[event.keyCode];
}, false);

(function () {
	var difficultyList = document.getElementById("difficulty");
	
	difficultyList.addEventListener("click", function(event) {
		var targetID = event.target.id;
		
		switch(targetID) {
		case "easy":
			monsterSpeed = 40;
			monsterAppearFrequency = 1000;
			reset();
			main();
			break;
				
		case "normal":
			monsterSpeed = 60;
			monsterAppearFrequency = 500;
			reset();
			main();
			break;
				
		case "difficult":
			monsterSpeed = 80;
			monsterAppearFrequency = 300;
			reset();
			main();
			break;
				
		case "impossible":
			monsterSpeed = 120;
			monsterAppearFrequency = 100;
			reset();
			main();
			break;
			
		}
	}, false);
})();

// update the position of hero and goblins, calculate the touch and the number of monster
var updatePosition = function () {
	var elapsed = (Date.now() - this.lastUpdateTime) / 1000; // the second from last update
	//console.log("elapsed" + elapsed);
	var distanceFromLastUpdate = hero.speed * elapsed; // the distance that player moves
	this.lastUpdateTime = Date.now();	

	/** 
	 *  Update the hero position
	 */
	if ((38 in buttonStates) && (hero.y - distanceFromLastUpdate) > 0) // player goes up
		hero.y = hero.y - distanceFromLastUpdate;

	if ((40 in buttonStates) && (hero.y + distanceFromLastUpdate) < (800 - 32)) // player goes down
		hero.y = hero.y + distanceFromLastUpdate;

	if ((37 in buttonStates) && (hero.x - distanceFromLastUpdate) > 0) // player goes left
		hero.x = hero.x - distanceFromLastUpdate;

	if ((39 in buttonStates) && (hero.x + distanceFromLastUpdate) < (512 - 32)) // player goes right
		hero.x = hero.x + distanceFromLastUpdate;
		
	/** 
	 * Update the monsters position
	 */
	 		
	for (var i = 0, tempLength = monsterGroup.length; i < tempLength; i++) {
		monsterGroup[i].y = monsterGroup[i].y + monsterGroup[i].speed * elapsed;
	}
	
	// remove the monster, which not in the canvas
	monsterGroup = monsterGroup.filter ( function (m) {
		return m.y <= 800 + 32;
	});	
	
		
	/** 
	 * Update the bullets position
	 */
	if (32 in buttonStates) {		
		createBullets();
	}
	
	// remove the bullets, which not in the canvas
	bulletsGroup = bulletsGroup.filter( function (b) {
		b.y = b.y - b.speed * elapsed;
		return b.y + 6 >= 0;
	});
	
	// check the hit and remove the hit monster and bullet
	for (i = 0, bulletsGroupLen = bulletsGroup.length; i < bulletsGroupLen; i++) {
		for (var j = 0, monsterGroupLen = monsterGroup.length; j < monsterGroup.length; j++) {
	        if ((monsterGroup[j]) &&
			(bulletsGroup[i].x + 6 >= monsterGroup[j].x) &&
			(monsterGroup[j].x + 32 >= bulletsGroup[i].x) &&
			(bulletsGroup[i].y + 6 >= monsterGroup[j].y) &&
			(monsterGroup[j].y + 32 >= bulletsGroup[i].y))	
			{				
		boomOfMonsterGroup.push(new boomOfMonster(monsterGroup[j].x, monsterGroup[j].y, (Date.now())));
		monsterGroup[j] = null;
		monsterCaught++;
		delete bulletsGroup[i];
		break;
	}
		}
		

	}	
	
	bulletsGroup = bulletsGroup.filter( function (b) {		
		return b !== undefined;
	});	
	
	monsterGroup = monsterGroup.filter( function (m) {
		return m !== null;
	});

	
	monsterMissed = monsterNumber - monsterGroup.length - monsterCaught;
	
	if (monsterTouchHeroCheck())
		reset(monsterSpeed);
};

var createBullets = function () {
	var distanceOfBulletAppearTime = (Date.now() - lastBulletAppearTime);
	//console.log("elapsed: " + distanceOfBulletAppearTime);
	if (distanceOfBulletAppearTime > bulletAppearFrequency) {
	    var bulletNew = new bullet(hero.x + 13, hero.y);
		bulletsGroup.push(bulletNew);
		lastBulletAppearTime = Date.now();
	}		
};


var monsterTouchHeroCheck = function () {
	for (var i = 0; i < monsterGroup.length; i ++) {
	    if ((hero.x + 32 >= monsterGroup[i].x) &&
	    (monsterGroup[i].x + 32 >= hero.x) &&
	    (hero.y + 32 >= monsterGroup[i].y) &&
	    (monsterGroup[i].y + 32 >= hero.y))
		{
			//console.log(monsterGroup[i].x + "  " + monsterGroup[i].y);
			//++monsterCaught;
		return true;			
	}
	}
};

// Draw or redraw everything
var render = function () {

	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	
	if (monsterReady) {
		for (var monsterNum = 0; monsterNum < monsterGroup.length; monsterNum++) {
			ctx.drawImage(monsterImage, monsterGroup[monsterNum].x, monsterGroup[monsterNum].y);
		}
	}

	if (boomOfMonsterReady) {
		for (var boomNum = 0, boomNumLen = boomOfMonsterGroup.length; boomNum < boomNumLen; boomNum++) {
			if ((Date.now() - boomOfMonsterGroup[boomNum].hitTime) < 70) {
				console.log("Time:  " + (Date.now() - boomOfMonsterGroup[boomNum].hitTime));
				ctx.drawImage(boomOfMonsterImage, boomOfMonsterGroup[boomNum].x, boomOfMonsterGroup[boomNum].y, 30,32);
		    }
		}		
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}
	
	if (bulletReady && (bulletsGroup.length > 0)) {
		for (var bulletNum = 0, bulletsGroupLen = bulletsGroup.length; bulletNum < bulletsGroupLen; bulletNum++) {
			ctx.drawImage(bulletImage, bulletsGroup[bulletNum].x, bulletsGroup[bulletNum].y);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "start";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins missed: " + monsterMissed + "   Goblins hit: " + monsterCaught, 32, 32);
};

var reset = function () {
	hero.x = canvas.width / 2 - 16;  // instead of heroImage.weight, because the image has not been loaded.
	hero.y = canvas.height - 232; // instead of heroImage.height, because the image has not been loaded.
	//console.log("hero.x: " + hero.x + "   hero.y: " + hero.y + "   heroImage.height: " + heroImage.height);
	bulletsGroup.length = 0;
	
	monsterGroup.length = 0;  // set back the number of monster 	
	var firstMonster = new monster(monsterSpeed);
	monsterGroup.push(firstMonster);
	monsterNumber = 1;  // Set the monster number from beginning again
	monsterCaught = 0;
	monsterMissed = 0;
	boomOfMonsterGroup.length = 0;
};

var createMonster = function () {
	var temp = (Date.now() - this.lastMonsterAppearTime);
	//console.log("elapsed: " + temp);
	if (temp > monsterAppearFrequency) {
	    var monsterNew = new monster(monsterSpeed);
		monsterGroup.push(monsterNew);
		this.lastMonsterAppearTime = Date.now();
		monsterNumber++;
	}		
};

var main = function () {
	createMonster();
	updatePosition();
	render();
	requestAnimationFrame(main);
};

var lastUpdateTime = Date.now();
var lastMonsterAppearTime = Date.now();

reset();
main();
