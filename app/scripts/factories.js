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
        }
    });
CR.factories.ActionSprite = stampit.compose(CR.factories.BaseClass, 
        stampit().state({
            name: "",
            image: "",
            frameWidth: 0,
            frameHeight: 0,
            frameCount: 0,
            action: null
        })
    );
CR.factories.Action = stampit.compose(CR.factories.BaseClass, 
        stampit().state({
            speed: 0,
            frame: 0,
            sprite: null,
            actor: null
        })
    );
CR.factories.Actor = stampit.compose(CR.factories.BaseClass, 
        stampit().state({
            bombs: 0,
            granades: 0,
            speedups: 0,
            action: null,
            position: null,
            actions: {}
        })
    );