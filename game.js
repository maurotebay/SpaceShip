(function () {

    'use strict';
    window.addEventListener('load', init, false);
    var KEY_ENTER = 13;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_SPACE = 32;
    var canvas = null, ctx = null;
    var lastPress = null;
    var pressing = [];
    var pause = true;
    var player = null;
    var shots = [];

    var pause = false;
    var gameOver = false;
    var score = 0;
    var enemies = [];
    var powerups = [];
    var messages = [];

    function init() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 300;
        player = new SpaceShip(90, 280, 10, 10, 3);

        //Create frist 4 enemies
        for (var c = 0; c < 4; c++) {
            enemies.push(new SpaceShip(random(canvas.width / 10) * 10, 0, 10, 10, 2));
        }

        run();
        repaint();
    }

    function run() {
        setTimeout(run, 50);
        act();
    }

    function repaint() {
        requestAnimationFrame(repaint);
        paint(ctx);
    }

    function act() {
        if (!pause) {
            if (gameOver) {
                reset();
            }
            // Move Spaceship
            if (pressing[KEY_RIGHT])
                player.move('x', 10, 'right');
            if (pressing[KEY_LEFT])
                player.move('x', 10, 'left');
            // Out Screen
            if (player.x > canvas.width - player.width)
                player.x = canvas.width - player.width;
            if (player.x < 0)
                player.x = 0;

            // New Shot
            if (lastPress == KEY_SPACE) {
                if (player.multiShots == 3) {
                    shots.push(new Rectangle(player.x - 3, player.y + 2, 5, 5));
                    shots.push(new Rectangle(player.x + 3, player.y, 5, 5));
                    shots.push(new Rectangle(player.x + 9, player.y + 2, 5, 5));
                }
                else if (player.multiShots == 2) {
                    shots.push(new Rectangle(player.x, player.y, 5, 5));
                    shots.push(new Rectangle(player.x + 5, player.y, 5, 5));
                }
                else
                    shots.push(new Rectangle(player.x + 3, player.y, 5, 5));
                lastPress = null;
            }

            // Move, damage and kill Enemies
            for (var i = 0, l = enemies.length; i < l; i++) {

                //Enemies health loss
                for (var j = 0, sl = shots.length; j < sl; j++) {
                    if (shots[j].intersects(enemies[i])) {
                        enemies[i].healthLoss();
                        shots.splice(j--, 1); //dissapear shot
                        sl--;
                    }
                }

                //Move enemy
                enemies[i].move('y', 5, 'down');
                if (enemies[i].y > canvas.height) {
                    enemies.splice(i, 1);
                    enemies.push(new SpaceShip(random(canvas.width / 10) * 10, 0, 10, 10, 2));
                }

                // Player Intersects Enemy
                if (player.intersects(enemies[i]) && player.timer < 1) {
                    player.healthLoss();
                    player.timer = 20;
                }

                //Enemies health loss
                for (var j = 0, sl = shots.length; j < sl; j++) {
                    if (shots[j].intersects(enemies[i])) {
                        enemies[i].healthLoss();
                        shots.splice(j--, 1);//dissapear shot
                        sl--;
                    }
                }

                //Kill enemies
                if (enemies[i].health < 1) {
                    let r = random(20);
                    if (r < 5) {
                        if (r == 0) {   //type 1 is multi shot
                            powerups.push(new PowerUp(enemies[i].x, enemies[i].y, 5, 5, 1));
                        }
                        else {  //type 0 is extra points
                            powerups.push(new PowerUp(enemies[i].x, enemies[i].y, 5, 5, 0));
                        }
                    }
                    score++;
                    enemies.splice(i, 1);
                    enemies.push(new SpaceShip(random(canvas.width / 10) * 10, 0, 10, 10, 2));
                }

            }

            // Move Shots
            for (var i = 0, l = shots.length; i < l; i++) {
                shots[i].move('y', 10, 'up');
                if (shots[i].y < 0) {
                    shots.splice(i--, 1);
                    l--;
                }
            }

            // Move PowerUps
            for (var i = 0, l = powerups.length; i < l; i++) {
                powerups[i].move('y', 5, 'down');
                if (player.intersects(powerups[i])) {
                    player.effect(powerups[i].type);
                    powerups.splice(i--, 1);
                    l--;
                    continue;
                }
                // Powerup Outside Screen
                if (powerups[i].y > canvas.height) {
                    powerups.splice(i--, 1);
                    l--;
                    continue;
                }
            }

            // Move Messages
            for (var i = 0, l = messages.length; i < l; i++) {
                messages[i].y += 2;
                if (messages[i].y < 260) {
                    messages.splice(i--, 1);
                    l--;
                }
            }

            if (player.timer > 0) {
                player.timer--;
            }

            if (player.health < 1) {
                gameOver = true;
                pause = true;
            }

        }

        // Pause/Unpause
        if (lastPress == KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }

    function paint(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        if (player.timer % 2 == 0)
            player.fill(ctx);

        //print pause and game over
        ctx.fillStyle = '#fff';
        if (pause) {
            ctx.textAlign = 'center';
            if (gameOver) {
                ctx.fillText('GAME OVER', 100, 150);
            }
            else {
                ctx.fillText('PAUSE', 100, 150);
            }
        }
        ctx.textAlign = 'left';

        //print shots
        ctx.fillStyle = '#f00';
        for (var i = 0, l = shots.length; i < l; i++)
            shots[i].fill(ctx);

        //print enemies
        for (var i = 0, l = enemies.length; i < l; i++) {
            ctx.fillStyle = '#00f';
            enemies[i].fill(ctx);
            //print enemy's health in them
            ctx.textAlign = 'center';
            ctx.fillStyle = '#f00';
            ctx.fillText(enemies[i].health, enemies[i].x + 5, enemies[i].y + 8);
        }
        ctx.textAlign = 'center';

        //print powerups
        for (var i = 0, l = powerups.length; i < l; i++) {
            if (powerups[i].type == 1)
                ctx.fillStyle = '#f90';
            else
                ctx.fillStyle = '#cc6';
            powerups[i].fill(ctx);
        }

        //print powerup message
        ctx.fillStyle = '#fff';
        for (var i = 0, l = messages.length; i < l; i++)
            ctx.fillText(messages[i].string, messages[i].x, messages[i].y);

        //print score
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + score, 20, 10);

        //print health
        ctx.fillText('Health: ' + player.health, 160, 10);
    }

    document.addEventListener('keydown', function (evt) {
        lastPress = evt.keyCode;
        pressing[evt.keyCode] = true;
    }, false);

    document.addEventListener('keyup', function (evt) {
        pressing[evt.keyCode] = false;
    }, false);

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) { window.setTimeout(callback, 17); };
    })();

    function random(max) {
        return ~~(Math.random() * max);
    }

    function reset() {
        score = 0;
        player.x = 90;
        player.y = 280;
        shots.length = 0;
        enemies.length = 0;
        //Create frist 4 enemies
        for (var c = 0; c < 4; c++) {
            enemies.push(new SpaceShip(random(canvas.width / 10) * 10, 0, 10, 10, 2));
        }
        gameOver = false;
        player.timer = 0;
        player.health = 3;
        player.multiShots = 1;
    }

    class Rectangle {

        constructor(x, y, width, height) {
            this.x = (x === undefined) ? 0 : x;
            this.y = (y === undefined) ? 0 : y;
            this.width = (width === undefined) ? 0 : width;
            this.height = (height === undefined) ? this.width : height;
        }

        intersects(rect) {

            if (rect === undefined) {
                window.console.warn('Missing parameters');
            }

            else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }
        }

        fill(ctx) {

            if (ctx === undefined) {
                window.console.warn('Missing parameters on function fill');
            }

            else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        drawImage(ctx, img) {
            if (img === undefined) {
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                    ctx.drawImage(img, this.x, this.y);
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }

        move(axis, unit, direction) {
            if (axis === 'x') {
                if (direction === 'left') {
                    this.x -= unit;
                }
                if (direction === 'right') {
                    this.x += unit;
                }
            }
            if (axis === 'y') {
                if (direction === 'up') {
                    this.y -= unit;
                }
                if (direction === 'down') {
                    this.y += unit;
                }
            }
        }

    }

    class SpaceShip extends Rectangle {
        constructor(x, y, width, height, health) {
            super(x, y, width, height);
            this.health = (health === undefined) ? 1 : health;
            this.timer = 0;
            this.multiShots = 1;
        }

        healthLoss() {
            this.health--;
        }

        effect(typeOfPowerUp) {
            if (typeOfPowerUp === 1) {
                if (player.multiShots < 3) {
                    player.multiShots++;
                    messages.push(new Message('MULTI', player.x, player.y));
                }
                else {
                    score += 5;
                    messages.push(new Message('+5', player.x, player.y));
                }
            }
            else {
                score += 5;
                messages.push(new Message('+5', player.x, player.y));
            }
        }

    }

    class PowerUp extends Rectangle {
        constructor(x, y, width, height, type) {
            super(x, y, width, height);
            this.type = (type === undefined) ? 0 : type;
        }

    }

    class Message {
        constructor(string, x, y) {
            this.string = (string === undefined) ? '?' : string;
            this.x = (x === undefined) ? 0 : x;
            this.y = (y === undefined) ? 0 : y;
        }
    }

})();