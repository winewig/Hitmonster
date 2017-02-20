/**
 *  Update:
 *  1. add shot for the hero
 *  2. add the point for hitting of the monster and missing of the monster. 
 *  3. remove the diffculty level
 *  fix:
 *  1. At the first time hero is not in the canvas, because the heroImage has not been loaded.
 */
 
// Create the canvas according to the image
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
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
bgImage.src = "images/background.png";



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

// Monster boss image
var monsterBossReady = false;
var monsterBossImage = new Image();
monsterBossImage.onload = function () {
	monsterBossReady = true;
};
monsterBossImage.src = "images/monsterBoss.png";

// Bullets image
var bulletReady = false;
var bulletImage = new Image();
bulletImage.onload = function () {
	bulletReady = true;
};
bulletImage.src = "images/bullet.png";

var bulletFromMonsterReady = false;
var bulletFromMonsterImage = new Image();
bulletFromMonsterImage.onload = function () {
	bulletFromMonsterReady = true;
};
bulletFromMonsterImage.src = "images/bulletFromMonster.png";

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

var score = 0; 
// Hero 
var hero = {
	speed: 200 // movement in pixels per second
};

// Bullet
var bulletsGroup = [];
var bulletsFromMonster = [];
var lastBulletAppearTime;
var bulletAppearFrequency = 50; // if the space bar is being pressed, bullet should come every 100 millisec.
function bullet(positionX, positionY) {
	this.speed = 150;
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
var monsterBossAppear = false;
var monsterBoss;
var monsterBossDisplacement = 0.1;
var monsterAppearFrequency = 1500;

var angle = 0;

// Boom of monster
var boomOfMonsterGroup = [];
function boomOfMonster (x, y, hitTime) {
	this.x = x;
	this.y = y;
	this.hitTime = hitTime;
}

var startGame = false;
var lastUpdateTime;
var lastMonsterAppearTime;
// handle user input
var buttonStates = {};

addEventListener("keydown", function (event) {
	buttonStates[event.keyCode] = true;
	if (event.keyCode === 32) {
		lastBulletAppearTime = Date.now();
	}
	if ((event.keyCode === 83) && (startGame ==false)) {
		startGame = true;
		lastUpdateTime = Date.now();
		lastMonsterAppearTime = Date.now();
		reset();
		main();
	}		
}, false);

addEventListener("keyup", function (event) {
	delete buttonStates[event.keyCode];
}, false);


// update the position of hero and goblins, calculate the touch and the number of monster
var updatePosition = function () {
	var elapsed = (Date.now() - lastUpdateTime) / 1000; // the second from last update
	//console.log("elapsed" + elapsed);
	var distanceFromLastUpdate = hero.speed * elapsed; // the distance that player moves
	lastUpdateTime = Date.now();	

	/** 
	 *  Update the hero position
	 */
	if ((38 in buttonStates) && (hero.y - distanceFromLastUpdate) > 0) // player goes up
		hero.y = hero.y - distanceFromLastUpdate;

	if ((40 in buttonStates) && (hero.y + distanceFromLastUpdate) < (480 - 32)) // player goes down
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
		return m.y <= 480 + 32;
	});	
	
    /** 
	 * Update the monsters position
	 */
	
	if ((monsterBossAppear) && (monsterBoss.y <= 80)) {
		monsterBoss.y += monsterBossDisplacement;		
	} 
	
	/** 
	 * Update the bullets position
	 */
	if (32 in buttonStates) {			
		createBullets();
	}
	
	// remove the bullets of the hero, which not in the canvas
	bulletsGroup = bulletsGroup.filter( function (b) {
		b.y = b.y - b.speed * elapsed;
		return b.y + 6 >= 0;
	});
	
	// remove the bullets of the monster, which not in the canvas
	bulletsFromMonster = bulletsFromMonster.filter( function (b) {
		b.y = b.y + b.speed * elapsed;
		return b.y - 6 <= 800;
	});	
	
	// check the hit and remove the hit monster and bullet
	for (i = 0, bulletsGroup.length; i < bulletsGroup.length; i++) {
		for (var j = 0, monsterGroupLen = monsterGroup.length; j < monsterGroupLen; j++) {       
			if ((monsterGroup[j]) &&
			(bulletsGroup[i].x + 6 >= monsterGroup[j].x) &&
			(monsterGroup[j].x + 32 >= bulletsGroup[i].x) &&
			(bulletsGroup[i].y + 6 >= monsterGroup[j].y) &&
			(monsterGroup[j].y + 32 >= bulletsGroup[i].y))	
			{				
				boomOfMonsterGroup.push(new boomOfMonster(monsterGroup[j].x, monsterGroup[j].y, (Date.now())));
				monsterGroup[j] = null;
				monsterCaught++; // add the number of hit
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

	// the number of the missing monster
	monsterMissed = monsterNumber - monsterGroup.length - monsterCaught;
	
	if (monsterTouchHeroCheck() || bulletTouchHeroCheck())
		reset(monsterSpeed);
};

var createBullets = function (o) {
	var bulletNew;
	if (o instanceof monster) {
	// Create bullets for monster
		bulletNew = new bullet(o.x + 12, o.y + 32);
		bulletsFromMonster.push(bulletNew);
	} else { 
	// Create bullets for hero
		var distanceOfBulletAppearTime = (Date.now() - lastBulletAppearTime);
		//console.log("elapsed: " + distanceOfBulletAppearTime);
		if (distanceOfBulletAppearTime > bulletAppearFrequency) {
			bulletNew = new bullet(hero.x + 13, hero.y);
			bulletsGroup.push(bulletNew);
			lastBulletAppearTime = Date.now();
		}
	}		
};


var monsterTouchHeroCheck = function () {
	for (var i = 0; i < monsterGroup.length; i ++) {
		if ((hero.x + 32 >= monsterGroup[i].x) &&
		(monsterGroup[i].x + 30 >= hero.x) &&
		(hero.y + 32 >= monsterGroup[i].y) &&
		(monsterGroup[i].y + 32 >= hero.y))
		{
			return true;			
		}
	}
};

var bulletTouchHeroCheck = function () {
	for (var i = 0; i < bulletsFromMonster.length; i++) {
		if ((hero.x + 32 >= bulletsFromMonster[i].x) &&
		(bulletsFromMonster[i].x + 6 >= hero.x) &&
		(hero.y + 32 >= bulletsFromMonster[i].y) &&
		(bulletsFromMonster[i].y + 6 >= hero.y))
		{
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
				//console.log("Time:  " + (Date.now() - boomOfMonsterGroup[boomNum].hitTime));
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
		
	if (bulletFromMonsterReady && (bulletsFromMonster.length > 0)) {
		for (var bulletFromMonstNum = 0; bulletFromMonstNum < bulletsFromMonster.length; bulletFromMonstNum++) 
		{
			ctx.drawImage(bulletFromMonsterImage, bulletsFromMonster[bulletFromMonstNum].x, bulletsFromMonster[bulletFromMonstNum].y);
		}
	}

	if ((monsterBossAppear == true) && (monsterBossReady == true)) {
		if (monsterBoss.y <= 80) {
			ctx.drawImage(monsterBossImage, monsterBoss.x, monsterBoss.y);
		} else {
			ctx.save();
			// run in circle
			ctx.translate(192, 180);
			ctx.drawImage(monsterBossImage, 100*Math.sin(angle*Math.PI/180), -100*Math.cos(angle*Math.PI/180));            			
			angle += 0.6 ;
			ctx.restore();
		}		
	}
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "start";
	ctx.textBaseline = "top";
	score = monsterCaught * 5;
	ctx.fillText("   Score: " + score, 32, 32);
	//ctx.fillText("Goblins missed: " + monsterMissed + "   Goblins hit: " + monsterCaught, 32, 32);
};

var reset = function () {
	hero.x = canvas.width / 2 - 16;  // instead of heroImage.weight, because the image has not been loaded.
	hero.y = canvas.height - 80; // instead of heroImage.height, because the image has not been loaded.	
	bulletsGroup.length = 0;
	
	monsterGroup.length = 0;  // set back the number of monster 	
	var firstMonster = new monster(monsterSpeed);
	monsterGroup.push(firstMonster);
	monsterNumber = 1;  // Set the monster number from beginning again
	monsterCaught = 0;
	monsterMissed = 0;
	bulletsFromMonster.length = 0;
	boomOfMonsterGroup.length = 0;
	monsterBossAppear = false;
};

// create the monster and call the createBullets
var createMonster = function () {
	var temp = (Date.now() - lastMonsterAppearTime);
	//console.log("elapsed: " + temp);
	if ((temp > monsterAppearFrequency) && (monsterNumber < 2)){
		var monsterNew = new monster(monsterSpeed);
		createBullets.call(monsterNew, monsterNew);
		monsterGroup.push(monsterNew);
		lastMonsterAppearTime = Date.now();
		monsterNumber++;
		
		// Create new bullets for the existing monsters
		for (var existingMonsterNum = 0, existingMonsterLen = monsterGroup.length -1; existingMonsterNum < existingMonsterLen; existingMonsterNum++)
		{
			createBullets(monsterGroup[existingMonsterNum]);
		}
	}	

    // Create monster boss
	if ((monsterNumber == 2) && (monsterGroup.length == 0) && (monsterBossAppear == false)) {
		monsterBoss = new monster(monsterSpeed);
		monsterBoss.x = 192;
		monsterBoss.y = 0;		
		monsterBossAppear = true;
	}	
};

var main = function () {
	createMonster();
	updatePosition();
	render();
	requestAnimationFrame(main);
};

var init = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "24px Helvetica";
		ctx.textAlign = "start";
		ctx.textBaseline = "top";		
		ctx.fillText("Press spacebar to shoot the monster.", 64, 150);
		ctx.fillText("Move the hero with the arrows", 64, 200);
		ctx.fillText("Press 's' to start the game", 64, 250);
	}
	requestAnimationFrame(init);
};

init();
