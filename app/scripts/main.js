CR.game = new Phaser.Game(655, 208, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    CR.game.load.tilemap('mario', 'assets/maps/mario1.png', 'assets/maps/mario1.json', null, Phaser.Tilemap.JSON);
    CR.game.load.spritesheet('mummy', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);
}

function create() {
    CR.game.stage.backgroundColor = '#787878';
    CR.obj.map = CR.game.add.tilemap(0, 0, 'mario');
    CR.obj.map.setCollisionRange(80, 97, true, true, true, true);
    CR.obj.map.setCollisionRange(15, 17, true, true, false, true);
    mummy = CR.game.add.sprite(100, 55, 'mummy');
    bot = CR.game.add.sprite(250, 50, 'mummy');
    bot.scale = new Phaser.Point(0.7, 0.7);
    bot.animations.add('run');
    mummy.animations.add('walk');
    bot.animations.play('run', 30, true);
    mummy.animations.play('walk', 50, true);

    mummy.body.bounce.y = 0.4;
    mummy.body.collideWorldBounds = true;

    bot.body.bounce.y = 0.4;
    bot.body.collideWorldBounds = true;

    CR.game.camera.follow(bot);

}

function update() {
    CR.obj.map.collide(mummy);
    CR.obj.map.collide(bot);

    //mummy.body.velocity.x = 0;
    mummy.body.acceleration.y = 500;

    //bot.body.velocity.x = 0;
    bot.body.acceleration.y = 500;

    bot.body.velocity.x += 0.05;
    mummy.body.velocity.x += 0.1;
    if (mummy.body.x >= 220) {
        bot.body.velocity.x = 0;
        mummy.body.velocity.x = 0;
    }
}