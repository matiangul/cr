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

var CR = {};

CR.game = new Phaser.Game(655, 208, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    CR.game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
    CR.game.load.image('tiles', 'assets/maps/map.png');
    CR.game.load.spritesheet('creature', 'assets/sprites/creature.png', 37, 45, 18);
    CR.game.load.spritesheet('player', 'assets/sprites/player.png', 58, 96, 5);
}

function create() {
    /*map settings*/
    CR.map = CR.game.add.tilemap('map');
    CR.map.addTilesetImage('map.png', 'tiles');
    CR.layer = CR.map.createLayer(0);
    //CR.layer.fixedToCamera = false;
    //CR.layer.debug = true;
    CR.layer.resizeWorld();
    /*floor*/
    CR.map.setCollisionRange(80, 97, true, true, true, true);
    /*one-ways*/
    CR.map.setCollisionRange(15, 17, true, true, false, true);
    // CR.map.setCollisionByExclusion([7, 32, 35, 36, 47]);

    /*creature*/
    CR.creature = CR.game.add.sprite(100, 50, 'creature');
    CR.creature.body.collideWorldBounds = false;
    CR.creature.body.setSize(22, 45, 6, 0);
    // CR.creature.anchor.setTo(0.5, 0.5);
    //CR.creature.bounce.y = 0.4;
    CR.creature.animations.add('run');
    CR.creature.animations.play('run', 30, true);

    /*player*/
    CR.player = CR.game.add.sprite(240, 50, 'player');
    CR.player.body.collideWorldBounds = false;
    CR.player.body.setSize(38, 96, 6, 0);
    // CR.player.anchor.setTo(0.5, 0.5);
    CR.player.scale.setTo(0.6379, 0.46875);
    //CR.player.bounce.y = 0.4;
    CR.player.animations.add('run');
    CR.player.animations.play('run', 10, true);

    /*game settings*/
    CR.game.stage.backgroundColor = '#787878';
    CR.game.camera.follow(CR.player);
    // CR.game.camera.deadzone = new Phaser.Rectangle(160, 160, layer.renderWidth-320, layer.renderHeight-320);
}

function update() {
    CR.game.physics.collide(CR.player, CR.layer);
    CR.game.physics.collide(CR.creature, CR.layer);
    CR.game.physics.collide(CR.player, CR.creature);
    /*creature*/
    CR.creature.body.acceleration.y = 300;
    /*player*/
    CR.player.body.acceleration.y = 300;
    runForest(CR.creature, CR.player);
}

function render() {
    // CR.game.debug.renderText("DEBUG", 100, 100);
    // CR.game.debug.renderSpriteBody(CR.player);
    CR.game.debug.renderSpriteBounds(CR.player);
    // CR.game.debug.renderSpriteBody(CR.creature);
    CR.game.debug.renderSpriteBounds(CR.creature);
}

function runForest(spy, forest)
{
    spy.body.velocity.x = 35;
    forest.body.velocity.x = 25;
}
