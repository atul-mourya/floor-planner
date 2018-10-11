import * as THREE from 'three';
import DragControls from 'three-dragcontrols';
import MapControls from '../vendors/threejs/r95/MapControls';
import TransformControls from '../vendors/threejs/r95/TransformControls';
import OrbitControls from "../vendors/threejs/r95/OrbitControls";
import ScriptLoader from './ScriptLoader';
import Stats from 'stats.js'
import THREEx from '../vendors/threex/threex.rendererstats'
import Utils from './utils';

var AbstractSKEditor = function ( data, loadingManager, scripts, onReady ) {

	var _this = this;
	var container = data.container;

	var _global = {
		ARC_SEGMENTS: 200,
		selectedObject: null,
		hiding: false,
		splineHelperObjects: [],
		objects: [],
		splines: {},
		positions: [],

	};

	if ( container ) {

		if ( ! Utils.isElement( container ) ) {

			this.container = document.getElementById( container );
			if ( this.container == null ) {

				container = document.createElement( 'div' );
				document.body.appendChild( container );
				this.container = container;

            }

		} else {

			this.container = container;

        }

    } else {

        container = document.createElement( 'div' );
        document.body.appendChild( container );
        this.container = container;

    }

	this.setting = {
		nearCamLimit: 0,
		farCamLimit: 300,
		extendedFarCamLimit: 200,
		enableDamping: false,
		userControlledAimation: false,
		antialias: true,
		physicallyCorrectLights: false,
		toneMappingExposure: 1,
		toneMappingWhitePoint: 1,
		rendererGammaInput: true,
		rendererGammaOutput: true,
        enableShadow: false,
        floorTextureImage: 'images/default_floor.jpg',
        wallTextureImage: 'images/wall-white-paint.jpg'
	};

	var tracker = {
		analysis: true,
		pan: true,
		exportScene: true
	};

	this.initSceneSetup = function () {

		_setup().then( _init );

    };

	function _setup() {

        var scriptLoader = new ScriptLoader();
        return new Promise(function(resolve, reject) {

            scriptLoader.load( data.cdn, scripts ).then(function(){

                console.log('scripts are loaded');
                resolve();

            }).catch(function(){
                
                console.log("Error");
            
            });
        });

    }

	function _init() {

		THREE.Cache.enabled = true;

		_global.geometry1 = new THREE.CircleBufferGeometry( 5, 32 );

        _initScene();
    	_initRenderer();
		_initCamera();
		_initMapControls();
		_initDragControl();
		_initTransformControl();
		_importAssets();
		_registerEventListeners();
		_animateFrame();

	}

	function _initScene() {

		var scene = new THREE.Scene();
		scene.name = "Scene";
		scene.background = new THREE.Color().setHex( 0x4e4f4f );
		scene.fog = new THREE.Fog( 0, 0.1, 0 );

		_this.scene = scene;

		if ( tracker.exportScene ) window.scene = scene;

    }

	function _initRenderer() {

		var renderer = new THREE.WebGLRenderer( {
			antialias: _this.setting.antialias,
			alpha: false,
		} );

		renderer.setPixelRatio( window.devicePixelRatio );

		var canvas = renderer.domElement;
		canvas.style.position = "absolute";
		canvas.style.top = "0px";
		canvas.style.zIndex = 0;
		canvas.height = _this.container.clientHeight;
		canvas.width = _this.container.clientWidth;

		renderer.setSize( canvas.width, canvas.height );

		_this.container.appendChild( canvas );

		_global.renderer = renderer;
		_global.canvas = canvas;

		if ( tracker.analysis ) _stats();

    }

	function _initCamera() {

		_this.camera = new THREE.PerspectiveCamera( 45, _global.canvas.width / _global.canvas.height, 10, 1000 );
		_this.camera.position.set( 0, 0, 200 );

    }

	function _initOrbitControls() {
		var orbitControls = new OrbitControls( _this.camera, _global.renderer.domElement );		orbitControls.addEventListener( 'change', _refreshRenderFrame ); // call this only in static scenes (i.e., if there is no animation loop)
		orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		orbitControls.dampingFactor = 0.25;
		orbitControls.minDistance = 0;
		orbitControls.maxDistance = 500;
		orbitControls.maxPolarAngle = THREE.Math.degToRad(90);
        orbitControls.minPolarAngle = THREE.Math.degToRad(0 );
		_global.orbitControls = orbitControls;
	}

	function _initMapControls() {

		var controls = new MapControls( _this.camera, _global.renderer.domElement );
		controls.addEventListener( 'change', _refreshRenderFrame ); // call this only in static scenes (i.e., if there is no animation loop)
		controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		controls.dampingFactor = 0.25;
		controls.screenSpacePanning = true;
		// controls.minDistance = 100;
		controls.maxDistance = 500;
		controls.panSpeed = 0.25;
		_global.controls = controls;

	}

	function _initDragControl() {

		var dragcontrols = new DragControls( _global.splineHelperObjects, _this.camera, _global.renderer.domElement ); //
        dragcontrols.enabled = false;
        dragcontrols.addEventListener( 'change', _refreshRenderFrame );
		dragcontrols.addEventListener( 'hoveron', function ( event ) {

			_global.transformControl.attach( event.object );
			cancelHideTransorm();

        } );
		dragcontrols.addEventListener( 'hoveroff', function ( event ) {

			delayHideTransform();

        } );

    }

	function _initTransformControl() {


		_global.transformControl = new TransformControls( _this.camera, _global.renderer.domElement );
		_global.transformControl.showZ = false;
		_global.transformControl.translationSnap = 10;

		_global.transformControl.addEventListener( 'dragging-changed', function ( event ) {

            _global.controls.enabled = ! event.value;

        } );
		// Hiding transform situation is a little in a mess :()
		_global.transformControl.addEventListener( 'change', function ( e ) {

            // cancelHideTransorm();            
            _refreshRenderFrame();

        } );
		_global.transformControl.addEventListener( 'mouseDown', function ( e ) {

			cancelHideTransorm();

        } );
		_global.transformControl.addEventListener( 'mouseUp', function ( e ) {

			delayHideTransform();

        } );
		_global.transformControl.addEventListener( 'objectChange', function ( e ) {

            updateSplineOutline( _global.splines );

        } );

	}

	function _importAssets() {

		var helpers = new THREE.Group();
		helpers.name = "helpers";

		var ambLight = new THREE.AmbientLight( 0xffffff, 1 );
		ambLight.name = "ambientLight";
		helpers.add( ambLight );

		var dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		dirLight.name = "dirLight";
		dirLight.position.set( 5, 5, 5 );
		helpers.add( dirLight );

		var grid = new THREE.GridHelper( 1000, 100, 0xffffff, 0x999999 );
		grid.rotateX( - Math.PI / 2 );
		grid.name = 'grid';
		helpers.add( grid );

		helpers.add( _global.transformControl );

		_global.helpers = helpers;

        new THREE.TextureLoader().load(_this.setting.floorTextureImage, function(texture){
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.x = 0.1;
			texture.repeat.y = 0.1;
			_global.floorTexture = texture;

		});
		 
		new THREE.TextureLoader().load(_this.setting.wallTextureImage, function(texture){ 
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.x = 0.1;
			texture.repeat.y = 0.1;
            _global.wallTexture = texture;
        });

		_this.scene.add( helpers );
		_this.sceneReady = true;
		_refreshRenderFrame();

    }

	this.createFloor = function ( param ) {

		var floor2d = new THREE.Group();
        floor2d.name = "floor2d";
        
        var floor3d = new THREE.Group();
		floor3d.name = "floor3d";

		_this.scene.add( floor2d );
        _this.scene.add( floor3d );
        
		_global.floor2d = floor2d;
		_global.floor3d = floor3d;

		switch ( param.shape ) {

			case "Box":
				_createBox( param );
				break;
			case "T":
				_createTShape( param );
				break;
			case "U":
				_createUShape( param );
				break;
			case "L":
				_createLShape( param );
				break;
			case "C":
				_createCustomShape( param );
				break;
			default:
				console.log( 'Unidentified shape selected' );
				break;

		}

		_refreshRenderFrame();

    };

	this.clearFloor = function () {

        var obj = _this.scene.getObjectByName( 'floor2d' );
        
        if ( !obj ) return;
        
		_disposeObjMemory( obj );
        obj.parent.remove( obj );
        _global.splineHelperObjects.splice( 0, _global.splineHelperObjects.length );
		_global.positions.splice( 0, _global.positions.length );
        _refreshRenderFrame();

    };

	function _createBox( param ) {

		var length = param.length || 100;
		var width = param.width || 100;
        var splinePointsLength = param.splinePointsLength || 4;
        
        var points = [ new THREE.Vector3( 0, width, 0 ),
			new THREE.Vector3( length, width, 0 ),
			new THREE.Vector3( length, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 )
		];

		_createCurveGeometry( points, splinePointsLength );

		load( points, splinePointsLength );

	}

	function _createLShape( param ) {

		var length = param.length || 100;
		var width = param.width || 100;
		var thickness1 = param.thickness1 || 30;
		var thickness2 = param.thickness2 || 40;
        var splinePointsLength = param.splinePointsLength || 6;
        
        var points = [ new THREE.Vector3( 0, width, 0 ),
			new THREE.Vector3( thickness1, width, 0 ),
			new THREE.Vector3( thickness1, thickness2, 0 ),
			new THREE.Vector3( length, thickness2, 0 ),
			new THREE.Vector3( length, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 )
        ];
        
		_createCurveGeometry( points, splinePointsLength );

		load( points, splinePointsLength );

    }

	function _createTShape( param ) {

		var length = param.length || 100;
		var width = param.width || 100;
		var flangeSection1 = param.flangeSection1 || 35;
		var flangeSection2 = param.flangeSection2 || 45;
		var thickness1 = param.thickness1 || 30;
		var thickness2 = param.thickness2 || 40;

		var splinePointsLength = param.splinePointsLength || 8;

        var points = [
			new THREE.Vector3( 0, width - thickness1, 0 ),
			new THREE.Vector3( 0, width, 0 ),
			new THREE.Vector3( length, width, 0 ),
			new THREE.Vector3( length, width - thickness2, 0 ),
			new THREE.Vector3( length - flangeSection2, width - thickness2, 0 ),
			new THREE.Vector3( length - flangeSection2, 0 ),
			new THREE.Vector3( length - flangeSection2 - flangeSection1, 0 ),
			new THREE.Vector3( length - flangeSection2 - flangeSection1, width - thickness1, 0 )
		];

		_createCurveGeometry( points, splinePointsLength );

		load( points, splinePointsLength );

	}

	function _createUShape( param ) {

		var length = param.length || 100;
		var width = param.width || 100;
		var innerWall = param.innerWall || 60;
		var thickness1 = param.thickness1 || 30;
		var thickness2 = param.thickness2 || 40;

		var splinePointsLength = param.splinePointsLength || 8;

        var points = [
			new THREE.Vector3( 0, width, 0 ),
			new THREE.Vector3( thickness1, width, 0 ),
			new THREE.Vector3( thickness1, width - innerWall, 0 ),
			new THREE.Vector3( length - thickness2, thickness2, 0 ),
			new THREE.Vector3( length - thickness2, width, 0 ),
			new THREE.Vector3( length, width, 0 ),
			new THREE.Vector3( length, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 )
		];
        
		_createCurveGeometry( points, splinePointsLength );

		load( points, splinePointsLength );

	}

	function _createCustomShape( param ) {

		var splinePointsLength = param.splinePointsLength || 3;

        var points = [
			new THREE.Vector3( 50, 100, 0 ),
			new THREE.Vector3( 0, 100, 0 ),
			new THREE.Vector3( 0, 0, 0 )
		];

		_createCurveGeometry( points, splinePointsLength );

		load( points, splinePointsLength );

	}

	function _createCurveGeometry( positions, splinePointsLength ) {

		for ( var i = 0; i < splinePointsLength; i ++ ) {
			
			addSplineObject( positions[i] );
			_global.positions.push( _global.splineHelperObjects[ i ].position );

		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( _global.ARC_SEGMENTS * 3 ), 3 ) );
		var curve = new THREE.CatmullRomCurve3( _global.positions );
		curve.curveType = 'catmullrom';
		curve.tension = 0;
		curve.closed = true;
		curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
			color: 0xff0000,
			opacity: 0.35,
			linewidth: 1
		} ) );
		_global.splines.uniform = curve;

		for ( var k in _global.splines ) {

			var spline = _global.splines[ k ];
			_global.floor2d.add( spline.mesh );

        }

	}

	this.extrude = function name( params ) {

		var extrudeSettings = {
			depth: 30,
            bevelEnabled: false,
		};

		var pts = [];

		for ( var i = 0; i < _global.positions.length; i ++ ) {
 
			pts.push( new THREE.Vector2( _global.positions[ i ].x, _global.positions[ i ].y ) );

        }

		var shape = new THREE.Shape( pts );

		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		geometry.computeBoundingSphere();

		var material1 = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false, side: THREE.BackSide, map: _global.floorTexture } );
		var material2 = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false, side: THREE.BackSide, map: _global.wallTexture} );
		
		var mesh = new THREE.Mesh( geometry, [ material1, material2 ] );
		mesh.frustumCulled = false;
		mesh.position.copy(geometry.boundingSphere.center.negate());

		_global.floor3d.add( mesh );
		
		_this.scene.rotateX(-Math.PI/2);
		_global.helpers.getObjectByName('grid').visible = false;
		_global.controls.enabled = false;
		_global.controls.dispose();
		_initOrbitControls();

        _refreshRenderFrame();

    };

	this.addPoint = function () {

		_global.splinePointsLength ++;
		_global.positions.push( addSplineObject().position );
        updateSplineOutline( _global.splines );
        
        _refreshRenderFrame();

    };

	this.removePoint = function () {

		if ( _global.splinePointsLength <= 3 ) {

			return;

        }
		_global.splinePointsLength --;
		_global.positions.pop();
		_global.floor2d.remove( _global.splineHelperObjects.pop() );
        updateSplineOutline( _global.splines );
        
        _refreshRenderFrame();

    };

	function addSplineObject( position ) {

		var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );
		var object = new THREE.Mesh( _global.geometry1, material );
		if ( position ) {

			object.position.copy( position );

        } else {

			object.position.x = Math.random() * 100 - 50;
			object.position.y = Math.random() * 60;
			object.position.z = 0;

        }
		object.castShadow = true;
		object.receiveShadow = true;
		_global.floor2d.add( object );
		
		_global.splineHelperObjects.push( object );
		return object;

    }

	function load( new_positions, splinePointsLength ) {

		while ( new_positions.length > _global.positions.length ) {

			_this.addPoint();

        }
		while ( new_positions.length < _global.positions.length ) {

			_this.removePoint();

        }
		for ( var i = 0; i < _global.positions.length; i ++ ) {

			_global.positions[ i ].copy( new_positions[ i ] );

        }
		updateSplineOutline( _global.splines );

		_global.splinePointsLength = splinePointsLength;

	}

	function updateSplineOutline( splines ) {

		var point = new THREE.Vector3();
		for ( var k in splines ) {

			var spline = splines[ k ];
			var splineMesh = spline.mesh;
			var position = splineMesh.geometry.attributes.position;
			for ( var i = 0; i < _global.ARC_SEGMENTS; i ++ ) {

				var t = i / ( _global.ARC_SEGMENTS - 1 );
				spline.getPoint( t, point );
				position.setXYZ( i, point.x, point.y, point.z );

            }
			position.needsUpdate = true;

		}
		
		var len = _global.positions.length;

		for ( var j = 0; j < len; j++ ){

			var current = _global.positions[j];
			var previous = _global.positions[(j+len-1)%len];
			console.log("Line : " + j + " = " + current.distanceTo(previous));

		}

    }

	function delayHideTransform() {

		cancelHideTransorm();
		hideTransform();

    }

	function hideTransform() {

		_global.hiding = setTimeout( function () {

			_global.transformControl.detach( _global.transformControl.object );

        }, 1000 );

    }

	function cancelHideTransorm() {

		if ( _global.hiding ) clearTimeout( _global.hiding );

    }

	function _disposeObjMemory( obj ) {

		if ( obj ) {

			if ( obj.isMesh || obj.isLine ) {

				if ( obj.material ) {

					obj.material.map && obj.material.map.dispose();
					obj.material.aoMap && obj.material.aoMap.dispose();
					obj.material.emissiveMap && obj.material.emissiveMap.dispose();
					obj.material.lightMap && obj.material.lightMap.dispose();
					obj.material.bumpMap && obj.material.bumpMap.dispose();
					obj.material.normalMap && obj.material.normalMap.dispose();
					obj.material.specularMap && obj.material.specularMap.dispose();
					obj.material.envMap && obj.material.envMap.dispose();
					obj.material.dispose();

                }
				obj.geometry && obj.geometry.dispose();

			} else if ( obj.type.isGroup ) {

				for ( var i = 0; i < obj.children.length; i ++ ) {

					_disposeObjMemory( obj.children[ i ] );

                }

            }

        }

    }

	function _render() {

		// _this.scene.updateMatrix();
		// _this.camera.updateProjectionMatrix();
		// if (_this.physics && _this.physics.isReady) _this.physics.update();
		// if(_this.setting.postprocessing && _global.postProcessor && _global.postProcessor.composer && _global.msaaFilterActive ) {
		//     _global.postProcessor.update();
		// } else {
		_global.renderer.render( _this.scene, _this.camera );
		// }

    }

	function _animate( doAnimate, timeout ) {

		_global.doAnimate = doAnimate;
		if ( timeout ) {

			return new Promise( function ( resolve, reject ) {
				setTimeout( function () {

					resolve();

                }, timeout );

            } );

        }

    }

	function _startAnimate() {

		if ( ! _global.doAnimate ) {

			_global.doAnimate = true;

        }

    }

	function _stopAnimate() {

		_global.doAnimate = false;

    }

	function _animateFrame() {

		requestAnimationFrame( _animateFrame );

		if ( _this.sceneReady && ( _global.doAnimate || _this.setting.userControlledAimation ) ) {

			_global.controls.update();
			if ( tracker.analysis ) {
				_this.rendererStats.update( _global.renderer );
				_this.stats.update();
			}
			_render();

        }

    }

	function _refreshRenderFrame() {

		_startAnimate();
		clearTimeout( _global.canvas.renderFrameTimeoutObj );
		_global.canvas.renderFrameTimeoutObj = setTimeout( function () {

			_stopAnimate();

        }, 1000 );

    }

	function _registerEventListeners() {

		// _keyPressEvent(window);

		window.addEventListener( 'resize', _onWindowResize, false );

	}

	function _keyPressEvent( element ) {

		element.addEventListener( 'keypress', function ( event ) {

			var x = event.key;
			switch ( x ) {

				case "h" || "H":
					! _global.ultraHD ? _global.ultraHD = true : _global.ultraHD = false;
					console.warn( 'UltraHD set to ' + _global.ultraHD + '. Performance may reduce if UltraHD is enabled. Toggle by pressing key H' );
					_this.experimentalHD( _global.ultraHD );
					break;
				case "j" || "J":
					if ( _global.postProcessor ) {

						if ( ! _global.msaaFilterActive ) {

							_this.setting.antialias = false;
							_recreateRendererContext();
							_global.postProcessor.composer.renderer = _global.renderer;
							_refreshRenderFrame();
							_global.msaaFilterActive = true;

						} else {

							_this.setting.antialias = true;
							_recreateRendererContext();
							_global.postProcessor.composer.renderer = _global.renderer;
							_refreshRenderFrame();
							_global.msaaFilterActive = false;

                        }
						console.warn( 'MSAA Quality set to ' + _global.msaaFilterActive + '. Performance may reduce if MSAA Quality is enabled. Toggle by pressing key J' );

                        } else {

						console.warn( "Post Processing is enabled but no passes assigned. Ignoring this event." );

                    }
					break;
				case "c" || "C":
					_this.physics.cameraMode = _this.physics.cameraMode === 3 ? 0 : _this.physics.cameraMode + 1;
					break;
				case "r" || "R":
					_this.physics.needsReset = true;
					break;
				default:
					break;

            }

        } );

    }

	function _recreateRendererContext() {

		_global.renderer.dispose();
		_global.renderer.forceContextLoss();
		_global.renderer.context = undefined;
		var targetDOM = _global.renderer.domElement;
		targetDOM.parentNode.removeChild( targetDOM );
		_initRenderer();

	}

	function _onWindowResize() {

		_global.canvas.height = _this.container.clientHeight;
		_global.canvas.width = _this.container.clientWidth;
		_global.renderer.setSize( _global.canvas.width, _global.canvas.height );
		_this.camera.aspect = _global.canvas.width / _global.canvas.height;
		_this.camera.updateProjectionMatrix();

		_refreshRenderFrame();

    }

	function _stats() {

		_this.stats = new Stats();
		_this.stats.dom.style.position = 'absolute';
		_this.stats.dom.style.top = '0px';
		_this.stats.dom.style.left = '80px';
		document.body.appendChild( _this.stats.dom );
		_this.rendererStats = new THREEx.RendererStats();
		_this.rendererStats.domElement.style.position = 'absolute';
		_this.rendererStats.domElement.style.left = '0px';
		_this.rendererStats.domElement.style.top = '0px';
		document.body.appendChild( _this.rendererStats.domElement );

    }

};

var SKEditor = function ( data, loadingManager, onReady ) {

	var scripts = [
		[
			// "/app/js/vendors/threejs/three.js",
		],
		[
			// "/app/js/vendors/threejs/r95/MapControls.js",
			// "/app/js/vendors/threejs/r95/TransformControls.js",
			// "/app/js/vendors/threejs/r95/DragControls.js",
			// "/app/js/vendors/threex/threex.rendererstats.js",
			// "/app/js/vendors/threejs/r95/stats.min.js",
			// "/app/js/vendors/clientjs/client.min.js",

		]
	];
	AbstractSKEditor.call( this, data, loadingManager, scripts, onReady );

};

SKEditor.prototype = Object.create( AbstractSKEditor.prototype );
SKEditor.prototype.constructor = SKEditor;

export default SKEditor;
