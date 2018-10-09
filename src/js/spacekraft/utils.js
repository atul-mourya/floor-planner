const Utils = {
    isElement: function (obj) {

        try {
        
            return obj instanceof HTMLElement;
        
        } catch (e) {
        
            return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") && (typeof obj.ownerDocument === "object");
        
        }

    },
    
    disposeObjMemory: function (obj) {

        if ( obj !== null ) {

            for ( var i = 0; i < obj.children.length; i++ ) {
                
                this.disposeObjMemory(obj.children[i]);

            }

            if ( obj.geometry ) {

                obj.geometry.dispose();
                obj.geometry = undefined;

            }

            if ( obj.material ) {

                if (obj.material.map) {

                    obj.material.map.dispose();
                    obj.material.map = undefined;

                }

                obj.material.dispose();
                obj.material = undefined;

            }

        }

        obj = undefined;
        
    },

    parametricGeometries: {
        plane: function ( width, height ) {

            return function ( u, v, target ) {
    
                var x = u * width;
                var y = 0;
                var z = v * height;
    
                target.set( x, y, z );
    
            };
    
        },
    }

};

export default Utils;