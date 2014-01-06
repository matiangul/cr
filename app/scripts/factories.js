CR.factories.Exception = stampit().state({
    name: "Exception",
    message: "Sth bad happened"
});
CR.factories.BaseClass = stampit().enclose(function() {
    var _id = this.id;
    delete this.id;

    this.getId = function() {
        return _id;
    }
}).methods({
    lazyLoad: function(property, factory) {
        if (this[property] === null) {
            this[property] = factory();
        }
        return this[property];
    },
    throwIfNull: function(property) {
        if (this[property] === null || typeof this[property] === typeof undefined) {
            throw CR.factories.Exception({
                name: "RuntimeException",
                message: "Property not set"
            });
        }
    },
    returnIfSet: function(obj) {
        if (typeof obj !== typeof undefined) {
            return obj;
        } else {
            throw CR.factories.Exception({
                name: "InvalidObject",
                message: "Object with this name is not set"
            });
        }
    }
});
CR.factories.ActionSprite = stampit.compose(CR.factories.BaseClass, 
    stampit().state({
        name: "",
        image: "",
        frameWidth: 0,
        frameHeight: 0,
        frameCount: 0,
        action: null,

    })
);
CR.factories.Action = stampit.compose(CR.factories.BaseClass, 
    stampit().state({
        speed: 0,
        frame: 0,
        sprite: null,
        actor: null
    }).methods({
        getActor: function () {
            this.throwIfNull('actor');
        }
    })
);
CR.factories.Actor = stampit.compose(CR.factories.BaseClass, 
    stampit().state({
        name: "",
        bombs: 0,
        granades: 0,
        speedups: 0,
        action: null,
        position: null
    }).methods({
        actions: null,
        getPosition: function() {
            this.throwIfNull('position');
            return this.position;
        },
        getAction: function() {
            this.throwIfNull('action');
            return this.action;
        }
    })
);
CR.obj.actionSpriteActorMatcher = stampit().compose(CR.factories.BaseClass,
    stampit().enclose({
        this.match = function (actorName, actionClass) {
            var table = {
                'mummy': {
                    'Run': []
                }
            };

            return this.returnIfSet(table[actorName][actionClass]));
        }
    })
)(); //singleton

CR.factories.Mummy = stampit.compose(CR.factories.Actor,
    stampit().state({
        name: "mummy"
    }).enclose({
        var avActions = [
            ['run', 'Run']
        ];
        if (this.actions === null) {
            this.actions = {};
            for (var i = 0; i < avActions.length; i++) {
                this.actions[avActions[i][0]] = CR.factories[avActions[i][1]]({actor: this});
            }
        }
    })
);

CR.factories.Run = stampit.compose(CR.factories.Action,
    stampit().enclose({
        switch(this.getActor().name) {
            case "mummy": 
                this.sprite = CR.factories.ActionSprite();
                break;
            default:
                break;
        }
    })
);