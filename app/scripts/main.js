// attach the .compare method to Array's prototype to call it on any array
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

Phaser.Stage.prototype.visibilityChange = function (event) {
    if (this.disableVisibilityChange)
    {
        return;
    }

    if (event.type == 'pagehide' || event.type == 'blur' || document['hidden'] === true || document['webkitHidden'] === true)
    {
        this.game.paused = true;
        console.log('global PAUSE');
        CR.audio.pause();
    }
    else
    {
        this.game.paused = false;
        CR.audio.resume();
    }
};

Phaser.Tilemap.prototype.setCollisionByIndexAndFace = function (index, layer, recalculate, top, bottom, left, right) {

    if (typeof layer === 'undefined')
    {
        layer = this.currentLayer;
    }
    else if (typeof layer === 'string')
    {
        layer = this.getLayerIndex(layer);
    }
    else if (layer instanceof Phaser.TilemapLayer)
    {
        layer = layer.index;
    }

    if (typeof recalculate === "undefined") { recalculate = true; }

    for (var y = 0; y < this.layers[layer].height ; y++)
    {
        for (var x = 0; x < this.layers[layer].width; x++)
        {
            var tile = this.layers[layer].data[y][x];

            if (tile && tile.index === index)
            {
                tile.collides = true;
                tile.faceTop = top;
                tile.faceBottom = bottom;
                tile.faceLeft = left;
                tile.faceRight = right;
            }
        }
    }

    if (recalculate)
    {
        this.calculateFaces(layer);
    }

    return layer;

};

Phaser.Tilemap.prototype.setCollisionRange = function (start, stop, top, bottom, left, right, layer) {

    if (start > stop)
    {
        return;
    }

    for (var i = start; i <= stop; i++)
    {
        this.setCollisionByIndexAndFace(i, layer, true, top, bottom, left, right);
    }

};

Phaser.Utils.Debug.prototype.renderSpriteBody = function (sprite, color) {

    if (this.context == null || sprite.body.touching.none === true)
    {
        return;
    }

    color = color || 'rgba(255,0,255, 0.3)';

    this.start(0, 0, color);

    this.context.fillStyle = color;
    this.context.fillRect(sprite.body.screenX, sprite.body.screenY, sprite.body.width, sprite.body.height);

    this.stop();
    this.start(0, 0, color);

    this.context.beginPath();
    this.context.strokeStyle = '#000000';

    if (sprite.body.touching.up)
    {
        this.context.moveTo(sprite.body.screenX, sprite.body.screenY);
        this.context.lineTo(sprite.body.screenX + sprite.body.width, sprite.body.screenY);
    }

    if (sprite.body.touching.down)
    {
        this.context.moveTo(sprite.body.screenX, sprite.body.screenY + sprite.body.height);
        this.context.lineTo(sprite.body.screenX + sprite.body.width, sprite.body.screenY + sprite.body.height);
    }

    if (sprite.body.touching.left)
    {
        this.context.moveTo(sprite.body.screenX, sprite.body.screenY);
        this.context.lineTo(sprite.body.screenX, sprite.body.screenY + sprite.body.height);
    }

    if (sprite.body.touching.right)
    {
        this.context.moveTo(sprite.body.screenX + sprite.body.width, sprite.body.screenY);
        this.context.lineTo(sprite.body.screenX + sprite.body.width, sprite.body.screenY + sprite.body.height);
    }

    this.context.stroke();

    this.stop();

};

Phaser.Utils.Debug.prototype.renderSpriteBounds = function (sprite, color, fill) {

    if (this.context == null)
    {
        return;
    }

    color = color || 'rgb(255,0,255)';
    colorBody = 'rgb(0,0,0)';

    if (typeof fill === 'undefined') { fill = false; }

    this.start(0, 0, color);

    if (fill)
    {
        this.context.fillStyle = color;
        this.context.fillRect(sprite.bounds.x, sprite.bounds.y, sprite.bounds.width, sprite.bounds.height);
    }
    else
    {
        this.context.strokeStyle = color;
        this.context.strokeRect(sprite.bounds.x, sprite.bounds.y, sprite.bounds.width, sprite.bounds.height);
        this.context.stroke();
        this.context.strokeStyle = colorBody;
        this.context.strokeRect(sprite.body.screenX, sprite.body.screenY, sprite.body.width, sprite.body.height);
        this.context.stroke();
    }

    this.stop();

};

function log(text, cleanup) {
    if (debug) {
        debugText += ((debugText==="") ? "" : " | ") + text;
        if (cleanup === true) {
            debugText = text;
        }
    }
}

var CR = {},
    debug = true,
    debugText = '';

CR.ActionHandler = function() {
    this._stack = [];
    this._clean = [];
};

CR.ActionHandler.prototype = {
    addClean : function(action, args, context, time) {
        if (typeof(context) === 'undefined') { var context = null; }
        if (typeof(time) === 'undefined') { var time = 0; }
        this._clean.push({ 'callback' : action, 'args' : args, 'context': context, 'time' : time });
    },
    add : function(action, args, context, time, append) {
        if (typeof(context) === 'undefined') { var context = null; }
        if (typeof(time) === 'undefined') { var time = 0; }
        if (typeof(append) === 'undefined') { var append = false; }
        args = args || [];
        var breaker = {
            'break' : false
        };
        args.push(breaker);
        this._stack.unshift({ 'callback' : action, 'args' : args, 'context': context, 'append': append, 'time' : time, 'break' : breaker });
    },
    run : function() {
        for (var i = 0; i < this._clean.length; i++) {
            this._clean[i]['callback'].apply(this._clean[i]['context'], this._clean[i]['args']);
        }
        for (var i = 0; i < this._stack.length; i++) {
            if (this._stack[i]['break']['break']) {
                continue;
            }
            if (this._stack[i]['time'] === 0 || this._stack[i]['time'] > Date.now()) {
                this._stack[i]['callback'].apply(this._stack[i]['context'], this._stack[i]['args']);
                if (this._stack[i]['append'] === true) {
                    continue;
                }
                break;
            } else if (this._stack[i]['time'] === -1) {
                this._stack[i]['callback'].apply(this._stack[i]['context'], this._stack[i]['args']);
                this._stack.splice(i, 1);
                break;
            } else {
                continue;
            }
        }
    },
    clean : function() {
        for (var i = 0; i < this._stack.length; i++) {
            if (this._stack[i]['time'] !== 0 && this._stack[i]['time'] < Date.now()) {
                this._stack.splice(i, 1);
                break;
            } else if (this._stack[i]['break']['break']) {
                this._stack.splice(i, 1);
                break;
            }
        }   
    }
};

CR.game = new Phaser.Game(1000, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });
CR.ah = new CR.ActionHandler();
CR.player = {
    anim: [],
    moves: [],
    spinach: 10,
    granade: 10,
    bomb: 10,
    acceleration: 300
};
CR.creature = {
    moveToDo: undefined,
    anim: [],
    acceleration: 300
};
CR.collisions = [];
CR.Figures = {
    getFigureBySprite : function(sprite)
    {
        if (sprite.key === "player") {
            return CR.player;
        } else {
            return CR.creature;
        }
    }
};

CR.logic = {
    run: function (key, figure, speed, time, append)
    {
        CR.ah.add(function(figure, speed) {
            // console.log('run');
            if (!figure.anim.compare(['run', 10, true])) {
                figure.sprite.animations.stop(null, true);
                figure.sprite.animations.play('run', 10, true);
                figure.anim = ['run', 10, true];
            }
            figure.sprite.body.gravity.y = figure.acceleration;
            figure.sprite.body.acceleration.x = 0;
            figure.sprite.body.velocity.x = speed;
            figure.sprite.body.immovable = false;
            returnControll();
        }, [figure, speed], undefined, time, append);
    },
    followPlayer: function ()
    {
        if (typeof(CR.creature.moveToDo) === 'undefined' && CR.player.moves.length !== 0) {
            CR.creature.moveToDo = CR.player.moves.shift();
        }
        var move = CR.creature.moveToDo,
            creature = CR.creature.sprite.body;

        if (typeof(move) !== 'undefined' && 
                move.bottom >= creature.bottom - 2 && 
                move.bottom <= creature.bottom + 2 && 
                move.right >= creature.right - 2 && 
                move.right <= creature.right + 2) {
            if (move.acceleration > 0) {
                CR.logic.speedup(undefined, CR.creature, 1000);
            }
            CR.logic.jump(undefined, CR.creature);
        } else if (typeof(move) !== 'undefined' && move.right < creature.right+2) {
            CR.creature.moveToDo = undefined;
        }
    },
    stop: function (key, figure, time, append)
    {
        // figure.sprite.granade.kill();
        // figure.sprite.granade.revive();
        CR.ah.add(function(figure) {
            console.log('stop');
            if (typeof figure === 'undefined') {
                figure = CR.player;
            }
            //name, resetFrame
            figure.sprite.animations.stop(null, true);
            figure.sprite.body.velocity.x = 0;
            figure.anim = ['stop', 0, true];
        }, [figure], undefined, time, append);
    },
    speedup: function (key, figure, time)
    {
        if (CR.player.spinach === 0 || typeof(CR.player.spinach) === 'undefined') return;
        else CR.player.spinach--;
        if (typeof(figure) === 'undefined') figure = CR.player;
        if (typeof(time) === 'undefined') time = 1500;
        CR.ah.add(function(figure, time) {
            console.log('speed');
            if (!figure.sprite.body.touching.right){
                if (!figure.anim.compare(['run', 40, true])) {
                    figure.sprite.animations.stop('run', false);
                    figure.sprite.animations.play('run', 40, true);
                    figure.anim = ['run', 40, true];
                }
                figure.sprite.body.acceleration.x = 100;
            }
        }, [figure, time], undefined, Date.now() + time, false);
    },
    jump: function (key, figure, time, append)
    {
        if (typeof figure === 'undefined') {
            figure = CR.player;
        }
        if (figure.sprite.key === "player") {
            CR.player.moves.push({
                'bottom': figure.sprite.body.bottom,
                'right': figure.sprite.body.right,
                'acceleration': figure.sprite.body.acceleration.x, 
                'action': 'jump'
            });
        }
        CR.ah.add(function(figure) {
            var tiles = CR.layer.getTiles(CR.player.sprite.body.x, CR.player.sprite.body.y, CR.player.sprite.body.width, CR.game.height, true);
            if (typeof(tiles[0]) !== 'undefined' && figure.sprite.body.bottom + 10 > tiles[0].y) {
                CR.logic.speedup(undefined, figure, 300);
                figure.sprite.body.velocity.y = -200;
            }
        }, [figure], undefined, -1, true);
    },
    hitByGranade: function (granade)
    {
        CR.ah.add(function(granade) {
            console.log('hit granade');
            var playSound = CR.audio.cantina.isPlaying;
            if (playSound) {
                CR.audio.cantina.pause();
                CR.audio.granade.onEnd.addEventListener(function() { CR.audio.cantina.resume(); });
                CR.audio.granade.play();
            }
            CR.game.physics.collide(granade, CR.layer);
            if (!CR.creature.anim.compare(['granade', 10, true])) {
                CR.creature.sprite.animations.stop(null, true);
                CR.creature.sprite.animations.play('granade', 10, true);
                CR.creature.anim = ['granade', 10, true];
            }
            CR.creature.sprite.body.acceleration.x = -100;
        }, [granade], undefined, Date.now() + 1000, false);
    },
    granadeCreature: function (key)
    {
        if (CR.player.granade === 0 || typeof(CR.player.granade) === 'undefined') return;
        else CR.player.granade--;
        var x = CR.player.sprite.body.right,//CR.player.sprite.body.right + CR.player.sprite.body.halfHeight,
            y = CR.creature.sprite.body.right + 2 * CR.player.sprite.body.halfHeight,// - CR.creature.sprite.body.halfWidth,
            z = x - y,
            alfa = Phaser.Math.degToRad(45),
            g = 300, V, Vy, Vx;

        if (z > 0 && (!CR.player.sprite.body.blocked.right || CR.player.sprite.body.right  !== CR.game.world.width)) {
            V = Math.sqrt(z * g / Math.sin(2 * alfa));
            Vx = V * Math.cos(alfa);
            Vy = V * Math.sin(alfa);

            var granade = CR.game.add.sprite(CR.player.sprite.body.right, CR.player.sprite.body.bottom - CR.player.sprite.body.halfHeight - 40, 'granade');
            granade.scale.setTo(0.5, 0.5);
            granade.body.collideWorldBounds = true;
            granade.body.bounce.y = 0.2;
            granade.body.gravity.y = 300;
            granade.body.velocity.x = -Vx;
            granade.body.velocity.y = -Vy - ((CR.player.sprite.body.right - CR.creature.sprite.body.right < 100) ? 60 : 0);
            CR.collisions.push([granade, CR.layer]);

            CR.ah.add(function(granade, Vx, Vy, x, g) {
                console.log('granade');
                // CR.game.physics.collide(granade, CR.creature.sprite, CR.logic.boomCreature, null, this);
                if (granade.body.blocked.down || granade.body.touching.down) {
                    arguments[arguments.length-1]['break'] = true;
                    granade.kill();
                    if (granade.body.right - granade.body.halfWidth > CR.creature.sprite.body.x - CR.creature.sprite.body.width * 2
                        && granade.body.right - granade.body.halfWidth < CR.creature.sprite.body.right + CR.creature.sprite.body.width * 2) {
                        CR.logic.hitByGranade(granade);
                    }
                }
            }, [granade, Vx, Vy, x, g], undefined, undefined, true);
            // console.log(V, Vy, Vx);
            // console.log(CR.creature.sprite.body.bottom, CR.creature.sprite.body.right - CR.creature.sprite.body.halfWidth);
        }
    },
    bombCreature: function (key, creature, player)
    {
        if (CR.player.bomb === 0 || typeof(CR.player.bomb) === 'undefined') return;
        else CR.player.bomb--;

        var thunder = CR.game.add.sprite(CR.creature.sprite.body.right - CR.creature.sprite.body.width , 0, 'thunder');
        thunder.body.mass = 0.1;
        thunder.body.gravity.y = 200;
        CR.collisions.push([CR.creature.sprite, thunder, function() { CR.logic.thunder(thunder); }]);

        CR.ah.add(function(thunder) {
            CR.game.camera.follow(CR.creature.sprite);

            CR.creature.sprite.body.velocity.x = 0;
            CR.creature.sprite.body.velocity.y = 0;
            CR.creature.sprite.body.angularVelocity = 0;
            CR.creature.sprite.body.gravity.y = 0;
            CR.creature.sprite.body.immovable = true;
            if (!CR.creature.anim.compare(['stop', 0, true])) {
                CR.creature.sprite.animations.stop(null, true);
                CR.creature.anim = ['stop', 0, true];
            }           

            removeControll();
            CR.player.sprite.body.velocity.x = 0;
            CR.player.sprite.body.velocity.y = 0;
            CR.player.sprite.body.angularVelocity = 0;
            CR.player.sprite.body.gravity.y = 0;
            CR.player.sprite.body.immovable = true;
            if (!CR.player.anim.compare(['stop', 0, true])) {
                CR.player.sprite.animations.stop(null, true);
                CR.player.anim = ['stop', 0, true];
            }

            if (!thunder.visible) {
                arguments[1]['break'] = true;
                CR.game.camera.follow(CR.player.sprite);
            }
        }, [thunder], undefined, undefined, false);
    },
    thunder: function (thunder) {
        var playSound = CR.audio.cantina.isPlaying;
        if (playSound) {
            CR.audio.cantina.pause(); 
            CR.audio.thunder.onEnd.addEventListener(function() { CR.audio.cantina.resume(); });
            CR.audio.thunder.play();
        }
        returnControll();
        CR.ah.add(function(thunder) {
            console.log('thunder');
            thunder.kill();
            if (!CR.creature.anim.compare(['thunder', 10, true])) {
                CR.creature.sprite.animations.stop(null, true);
                CR.creature.sprite.animations.play('thunder', 10, true);
                CR.creature.anim = ['thunder', 10, true];
            }
        }, [thunder], undefined, Date.now() + 1000, false);
        //animate creature for 1 second
    },
    eatPlayer: function (sprite1, sprite2, time)
    {
        var playSound = CR.audio.cantina.isPlaying;
        if (playSound) {
            CR.audio.cantina.pause();
            CR.audio.eat.onEnd.addEventListener(function() { CR.audio.cantina.resume(); });
            CR.audio.eat.play();
        }
        CR.ah.add(function() {
            console.log('eat');
            CR.creature.sprite.body.velocity.x = 0;
            CR.creature.sprite.body.velocity.y = 0;
            CR.creature.sprite.body.acceleration.x = 0;
            
            CR.player.sprite.body.velocity.x = 0;
            CR.player.sprite.body.velocity.y = 0;
            CR.player.sprite.body.acceleration.x = 0;

            if (!CR.creature.anim.compare(['eat', 3, true])) {
                CR.creature.sprite.animations.stop(null, true);
                CR.creature.sprite.animations.play('eat', 3, true);
                CR.creature.anim = ['eat', 3, true];
            }

            if (!CR.player.anim.compare(['eaten', 1, false, true])) {
                CR.player.sprite.animations.stop(null, true);
                CR.player.sprite.animations.play('eaten', 1, false, true);
                CR.player.anim = ['eaten', 1, false, true];
            }

            if (!CR.player.sprite.visible) {
                arguments[0]['break'] = true;
                CR.game.camera.follow(CR.creature.sprite);
            }
        }, undefined, undefined, undefined, false);
    },
    catchCreature: function ()
    {
        CR.trap.body.gravity.y = -500;

        var cage = CR.game.add.sprite(CR.creature.sprite.body.right - CR.creature.sprite.body.width*2, 0, 'cage');
        cage.scale.setTo(0.7, 0.7);
        cage.body.mass = 0.1;
        cage.body.gravity.y = 200;
        CR.collisions.push([CR.layer, cage, function() { console.log('end of game'); }]);

        CR.ah.add(function(cage) {
            console.log('catch the guy');
            CR.game.camera.follow(CR.creature.sprite);

            CR.creature.sprite.body.velocity.x = 0;
            CR.creature.sprite.body.velocity.y = 0;
            CR.creature.sprite.body.angularVelocity = 0;
            CR.creature.sprite.body.gravity.y = 0;
            CR.creature.sprite.body.immovable = true;
            if (!CR.creature.anim.compare(['standing', 1, false])) {
                CR.creature.sprite.animations.stop(null, true);
                CR.creature.sprite.animations.play('standing', 1, false);
                CR.creature.anim = ['standing', 1, false];
            }           

            removeControll();
            CR.player.sprite.body.acceleration.x = 0;
            CR.player.sprite.body.velocity.x = 0;
            CR.player.sprite.body.speed = 0;
            if (!CR.player.anim.compare(['standing', 1, false])) {
                CR.player.sprite.animations.stop(null, true);
                CR.player.sprite.animations.play('standing', 1, false);
                CR.player.anim = ['standing', 1, false];
            }

            if (!cage.body.blocked.down) {
                console.log('end of game');
            }
        }, [cage], undefined, undefined, false);
    },
    grabFant: function (figureSprite, fantSprite)
    {
        console.log('fant');
        fantSprite.kill();
        var figure = CR.Figures.getFigureBySprite(figureSprite);
        if (fantSprite.key === "spinach") {
            figure.spinach = figure.spinach + 1 || 1;
        } else if (fantSprite.key === "granade") {
            figure.granade = figure.granade + 1 || 1;
        } else if (fantSprite.key === "bomb") {
            figure.bomb = figure.bomb + 1 || 1;
        }
    },
    swip: function (figure)
    {
        var playSound = CR.audio.cantina.isPlaying;
        if (playSound) {
            CR.audio.cantina.pause();
            CR.audio.sink.onEnd.addEventListener(function() { CR.audio.cantina.resume(); });
            CR.audio.sink.play();
        }
        CR.ah.add(function(figure) {
            console.log('swip');
            if (figure.sprite.key === "plyer")
                removeControll();
            if (figure.sprite.body.blocked.down) {
                figure.sprite.kill();
                arguments[1]['break'] = true;
            }
        }, [figure], undefined, undefined, false);
    },
    sink: function (figure)
    {
        CR.ah.add(function(figure) {
            // console.log('sink');
            var velocity = 10;
            if (figure.sprite.key == "creature") {
                velocity = 22;
            }
            figure.sprite.animations.stop(null, true);
            figure.sprite.body.velocity.x = velocity;
            figure.sprite.body.velocity.y = -10;
            figure.sprite.body.angularAcceleration = -800;
            if (figure.sprite.body.rotation > -100 && figure.sprite.body.rotation < -80) {
                arguments[1]['break'] = true;
                figure.sprite.body.angularAcceleration = 0;
                figure.sprite.body.angularVelocity = 0;
                figure.sprite.body.acceleration.y = 0;
                figure.sprite.body.acceleration.x = 0;
                figure.sprite.body.velocity.y = -50;
                figure.sprite.body.velocity.x = velocity / 2;
                figure.sprite.body.gravity.y = 100;
                figure.sprite.animations.play('tar');
                CR.logic.swip(figure);
            }
        }, [figure], undefined, undefined, false);
    },
    checkSink: function (figure)
    {
        // console.log('checkSink');
        if (typeof(figure.sprite)!=='undefined') {
            var tiles = CR.layer.getTiles(figure.sprite.body.x, figure.sprite.body.y, figure.sprite.body.width, CR.game.height, false),
                factor = 2.3;
            if (tiles.length === 0) return false;
            if (figure.sprite.key == "creature") {
                factor = 1.8;
            }
            if (tiles[Math.round(tiles.length/factor)].tile.index === 7 || tiles[Math.round(tiles.length/factor)].tile.index === 13) {
                CR.logic.sink(figure);
                return true;
            }
        }
        return false;
    },
    wall: function (figure)
    {
        CR.ah.add(function(figure) {
            if (typeof figure === 'undefined') {
                figure = CR.player;
            }
            if (figure.sprite.body.blocked.right === true) {
                console.log('wall');    
                figure.sprite.animations.stop(null, true);
                figure.sprite.body.velocity.x = 0;
                figure.anim = ['stop', 0, true];
            }
        }, [figure], undefined, undefined, true);
    }
};

function preload() {

    CR.game.load.tilemap('map', 'assets/maps/creature3.json', null, Phaser.Tilemap.TILED_JSON);
    CR.game.load.image('tiles3', 'assets/maps/creatureMap3.png');

    CR.game.load.image('bomb', 'assets/images/bomb.png');
    CR.game.load.image('cage', 'assets/images/cage.png');
    CR.game.load.image('granade', 'assets/images/granade.png');
    CR.game.load.image('line', 'assets/images/line.png');
    CR.game.load.image('smoke', 'assets/images/smoke.png');
    CR.game.load.image('spinach', 'assets/images/spinach.png');
    CR.game.load.image('thunder', 'assets/images/thunder.png');
    CR.game.load.image('trap', 'assets/images/trap.png');


    CR.game.load.atlasXML('creature', 'assets/sprites/creature.png', 'assets/sprites/creature.xml');
    CR.game.load.atlasXML('player', 'assets/sprites/player.png', 'assets/sprites/player.xml');
}

function create() {
    var element = document.getElementById('audio');
    var Audio = function(element, start, stop, loop) {
        this._loop = loop || false;
        this.isPlaying = false;
        this._element = element;
        this._lastTime = start;
        this._start = start;
        this._stop = stop;
        var timeUpdate = function() {
            if (this.isPlaying && this._element.currentTime - 0.2 <= this._stop && this._stop <= this._element.currentTime + 0.2) {
                this.timeEnds();
            }
        };
        this._element.addEventListener('timeupdate', timeUpdate.bind(this));
        this.onEnd = {
            listeners: [],
            addEventListener: function(callback) {
                this.listeners.push(callback);
            },
            dispatch: function() {
                for (var i = 0; i < this.listeners.length; i++) {
                    console.log(this.listeners[i]);
                    this.listeners[i]();
                }
            }
        };
    };
    Audio.prototype = {
        play: function (reset, loop) {
            console.log('play ?');
            if (typeof(reset)==='undefined') reset = true;
            if (typeof(loop)==='undefined') loop = this._loop;
            this.isPlaying = true;
            this._element.currentTime = this._lastTime;
            if (reset) this._element.currentTime = this._start;
            this._element.loop = loop;
            this._element.play();
        },
        pause: function () {
            console.log('pause ?');
            var beenPlaying = this.isPlaying;
            this.isPlaying = false;
            this._element.pause();
            this._lastTime = this._element.currentTime;

            return beenPlaying;
        },
        resume: function() {
            console.log('resume ?');
            this.play(false);
        },
        timeEnds: function() {
            console.log('timeEnds ?');
            if (this._loop) this.play();
            else {
                this.pause();
                this.onEnd.dispatch();
            }
        }
    };
    CR.audio = {};
    CR.audio.justPaused = false;
    CR.audio.pause = function () {
        if (!CR.audio.justPaused) {
            CR.audio.justPaused = true;
            CR.audio.paused = {
                'cantina': CR.audio.cantina.pause(),
                'eat': CR.audio.eat.pause(),
                'granade': CR.audio.granade.pause(),
                'sink': CR.audio.sink.pause(),
                'thunder': CR.audio.thunder.pause()
            }
        }
    };
    CR.audio.resume = function () {
        if (CR.audio.justPaused) {
            for (audio in CR.audio.paused) {
                if (CR.audio.paused[audio] === true) {
                    CR.audio[audio].resume();
                }
            }
            CR.audio.justPaused = false;
        }
    };
    CR.audio.cantina = new Audio(element, 0, 166, true);
    CR.audio.eat = new Audio(element, 166, 169.9);
    CR.audio.granade = new Audio(element, 169.9, 174.5);
    CR.audio.sink = new Audio(element, 174.5, 176.5);
    CR.audio.thunder = new Audio(element, 176.5, 180);

    CR.audio.cantina.play();

    /*map settings*/
    CR.map = CR.game.add.tilemap('map');
    CR.map.addTilesetImage('creature', 'tiles3');
    CR.layer = CR.map.createLayer(0);
    // CR.layer.fixedToCamera = true;
    // CR.layer.debug = true;
    CR.layer.resizeWorld();
    CR.map.setCollisionByIndex(6);
    CR.map.setCollisionByIndex(8);

    /*images*/
    // CR.game.add.sprite(100, 250, 'bomb');
    
    // CR.game.add.sprite(160, 250, 'line');
    // CR.game.add.sprite(180, 250, 'smoke');

    /*creature*/
    var creature = {};
    creature.w = 56;
    creature.h = 200;
    creature.scale = 0.5;
    creature.bounce = 0;
    creature.acceleration = 300;
    creature.initialPoint = new Phaser.Point(140, 600);
    /*initial settings*/
    CR.creature.sprite = CR.game.add.sprite(creature.initialPoint.x, creature.initialPoint.y, 'creature');
    CR.creature.sprite.anchor.setTo(0.5, 0.5);
    CR.creature.sprite.body.setSize(creature.w, creature.h, 1, 0);
    CR.creature.sprite.body.collideWorldBounds = true;
    CR.creature.sprite.body.bounce.y = creature.bounce;
    CR.creature.sprite.body.gravity.y = creature.acceleration;
    CR.creature.sprite.scale.setTo(creature.scale, creature.scale);
    /*movements*/
    CR.creature.sprite.animations.add('tar', Phaser.Animation.generateFrameNames('tar', 0, 0, '', 2), 1, false);
    CR.creature.sprite.animations.add('standing', Phaser.Animation.generateFrameNames('standing', 0, 0, '', 2), 0, false);
    CR.creature.sprite.animations.add('run', Phaser.Animation.generateFrameNames('run', 0, 2, '', 2), 3, true);
    CR.creature.sprite.animations.add('eat', Phaser.Animation.generateFrameNames('eat', 0, 2, '', 2), 3, true);
    CR.creature.sprite.animations.add('granade', Phaser.Animation.generateFrameNames('granade', 0, 1, '', 2), 2, true);
    CR.creature.sprite.animations.add('thunder', Phaser.Animation.generateFrameNames('thunder', 0, 1, '', 2), 2, true);

    /*player*/
    var player = {};
    player.w = 85;
    player.h = 118;
    player.scale = 0.5;
    player.bounce = 0;
    player.acceleration = 300;
    player.initialPoint = new Phaser.Point(400, 600);
    /*initial settings*/
    CR.player.sprite = CR.game.add.sprite(player.initialPoint.x, player.initialPoint.y, 'player');
    CR.player.sprite.anchor.setTo(0.5, 0.5);
    CR.player.sprite.body.setSize(player.w, player.h, 0, 0);
    CR.player.sprite.body.collideWorldBounds = true;
    CR.player.sprite.body.bounce.y = player.bounce;
    CR.player.sprite.body.gravity.y = player.acceleration;
    CR.player.sprite.scale.setTo(player.scale, player.scale);
    /*movements*/
    CR.player.sprite.animations.add('tar', Phaser.Animation.generateFrameNames('tar', 0, 0, '', 2), 1, false);
    CR.player.sprite.animations.add('standing', Phaser.Animation.generateFrameNames('standing', 0, 0, '', 2), 0, false);
    CR.player.sprite.animations.add('granade', Phaser.Animation.generateFrameNames('granade', 0, 0, '', 2), 0, false);
    CR.player.sprite.animations.add('run', Phaser.Animation.generateFrameNames('run', 0, 2, '', 2), 3, true);
    CR.player.sprite.animations.add('eaten', Phaser.Animation.generateFrameNames('eaten', 0, 2, '', 2), 3, true);

    /*controll*/
    returnControll();

    /*game settings*/
    CR.game.stage.backgroundColor = '#fff';
    CR.game.camera.follow(CR.player.sprite);
    // CR.game.camera.deadzone = new Phaser.Rectangle(160, 160, layer.renderWidth-320, layer.renderHeight-320);
    CR.game.input.maxPointers = 1;
    CR.game.stage.scale.maxWidth = 1000;
    CR.game.stage.scale.maxHeight = 600;
    if (CR.game.device.desktop)
    {
        CR.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
        // CR.game.stage.disableVisibilityChange = true;
        // CR.game.stage.scale.forceLandscape = true;
        // CR.game.stage.scale.pageAlignHorizontally = true;
        CR.game.stage.scale.setScreenSize(true);
    }
    else
    {
        CR.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
        // CR.game.stage.disableVisibilityChange = true;
        // CR.game.stage.scale.forceLandscape = true;
        // CR.game.stage.scale.pageAlignHorizontally = true;
        CR.game.stage.scale.setScreenSize(true);
    }

    CR.logic.run(undefined, CR.creature, 75, undefined, true);
    CR.logic.run(undefined, CR.player, 65, undefined, true);
    CR.logic.wall(CR.creature);
    CR.logic.wall(CR.player);

    CR.spinaches = CR.game.add.group();
    for (var i = 0; i < 20; i+=2)
    {
        var spinach = CR.spinaches.create(i * 80, 620, 'spinach');
        spinach.scale.setTo(0.5, 0.5);
        spinach.body.immovable = true;
    }
    CR.granades = CR.game.add.group();
    for (var i = 0; i < 20; i+=3)
    {
        var granade = CR.granades.create(i * 20, 620, 'granade');
        granade.scale.setTo(0.5, 0.5);
        granade.body.immovable = true;
    }
    CR.bombs = CR.game.add.group();
    for (var i = 0; i < 20; i+=5)
    {
        var bomb = CR.bombs.create(i * 50, 620, 'bomb');
        bomb.scale.setTo(0.5, 0.5);
        bomb.body.immovable = true;
    }

    CR.trap = CR.game.add.sprite(700, 600, 'trap');
    CR.trap.scale.setTo(0.5, 0.5);

    CR.gameInfo = CR.game.add.text(16, 16, 'Granades: 0 | Thunders: 0 | Spinach: 0', { font: '600 16pt Arial' });
}

function removeControll () {
    CR.game.input.keyboard.addKey(Phaser.Keyboard.G).onDown.removeAll();
    CR.game.input.keyboard.addKey(Phaser.Keyboard.B).onDown.removeAll();
    CR.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.removeAll();
    CR.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.removeAll();
    $$('#game').swipeLeft(function(){});
    $$('#game').doubleTap(function(){});
    $$('#game').swipeRight(function(){});
    $$('#game').swipeUp(function(){});
}
function returnControll () {
    CR.game.input.keyboard.addKey(Phaser.Keyboard.G).onDown.add(CR.logic.granadeCreature, this);
    CR.game.input.keyboard.addKey(Phaser.Keyboard.B).onDown.add(CR.logic.bombCreature, this);
    CR.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(CR.logic.speedup, this);
    CR.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(CR.logic.jump, this);

    $$('#game').swipeLeft(CR.logic.granadeCreature);
    $$('#game').doubleTap(CR.logic.bombCreature);
    $$('#game').swipeRight(CR.logic.speedup);
    $$('#game').swipeUp(CR.logic.jump);
}

function update() {
    
    CR.player.sinking = CR.player.sinking || false;
    if (!CR.player.sinking) {
        CR.player.sinking = CR.logic.checkSink(CR.player);
    }

    CR.creature.sinking = CR.creature.sinking || false;
    if (!CR.creature.sinking) {
        CR.creature.sinking = CR.logic.checkSink(CR.creature);
    }

    CR.game.physics.collide(CR.player.sprite, CR.layer);
    CR.game.physics.collide(CR.creature.sprite, CR.layer);
    CR.game.physics.collide(CR.player.sprite, CR.creature.sprite, CR.logic.eatPlayer, null, this);
    CR.game.physics.collide(CR.player.sprite, CR.trap, CR.logic.catchCreature, null, this);
    CR.game.physics.overlap(CR.player.sprite, CR.spinaches, CR.logic.grabFant, null, this);
    CR.game.physics.overlap(CR.player.sprite, CR.granades, CR.logic.grabFant, null, this);
    CR.game.physics.overlap(CR.player.sprite, CR.bombs, CR.logic.grabFant, null, this);
    for (var i = 0; i < CR.collisions.length; i++) {
        CR.game.physics.collide(CR.collisions[i][0], CR.collisions[i][1], CR.collisions[i][2], null, this);
    };
    if (typeof(CR.gameInfo) !== 'undefined')
        CR.gameInfo.position = CR.layer;
    updateGameInfo(CR.player);
    CR.logic.followPlayer();
    CR.ah.run();
    CR.ah.clean();

}

function render() {
    if (debug) {
        CR.game.debug.renderSpriteBody(CR.player.sprite);
        CR.game.debug.renderSpriteBounds(CR.player.sprite);
        CR.game.debug.renderSpriteBody(CR.creature.sprite);
        CR.game.debug.renderSpriteBounds(CR.creature.sprite);
        CR.game.debug.renderText(debugText, 10, 10, 'rgb(0,0,0)');
    }
}

function updateGameInfo(figure) {
    if (typeof(CR.gameInfo) !== 'undefined')
        CR.gameInfo.content = 'Granades: '+ figure.granade +' | Thunders: '+ figure.bomb +' | Spinach: '+ figure.spinach;
}