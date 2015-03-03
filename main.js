var width = 150;
var height = 150;

var img_src = "equirectangular.jpg";
var frames = 0;

var fps = 15;

window.onload = function () {

	var camera, scene, renderer;

	var encoder;

	var isUserInteracting = false,
	onMouseDownMouseX = 0, onMouseDownMouseY = 0,
	lon = 0, onMouseDownLon = 0,
	lat = 0, onMouseDownLat = 0,
	phi = 0, theta = 0;

	init();
	animate();

	function init() {

		var container, mesh;

		encoder = new GIFEncoder();
		encoder.setRepeat(0);
		encoder.setDelay(1/fps * 1000);
		encoder.setSize(width,height);
    
		container = document.getElementById( 'container' );

		camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1100 );
		camera.target = new THREE.Vector3( 0, 0, 0 );

		scene = new THREE.Scene();

		var geometry = new THREE.SphereGeometry( 500, 60, 40 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

		var material = new THREE.MeshBasicMaterial( {
			map: THREE.ImageUtils.loadTexture(img_src)
		} );

		mesh = new THREE.Mesh( geometry, material );
		
		scene.add( mesh );

		renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		container.appendChild( renderer.domElement );

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
		document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

		document.addEventListener( 'dragover', function ( event ) {

			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';

		}, false );

		document.addEventListener( 'dragenter', function ( event ) {

			document.body.style.opacity = 0.5;

		}, false );

		document.addEventListener( 'dragleave', function ( event ) {

			document.body.style.opacity = 1;

		}, false );

		document.addEventListener( 'drop', function ( event ) {

			event.preventDefault();

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				material.map.image.src = event.target.result;
				material.map.needsUpdate = true;

			}, false );
			reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

			document.body.style.opacity = 1;

		}, false );

		//

		window.addEventListener( 'resize', onWindowResize, false );

    console.log(encoder.start());
	}

	function onWindowResize() {

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize( width, height );

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		isUserInteracting = true;

		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;

	}

	function onDocumentMouseMove( event ) {

		if ( isUserInteracting === true ) {

			lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
			lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

		}

	}

	function onDocumentMouseUp( event ) {

		isUserInteracting = false;

	}

	function onDocumentMouseWheel( event ) {

		// WebKit

		if ( event.wheelDeltaY ) {

			camera.fov -= event.wheelDeltaY * 0.05;

		// Opera / Explorer 9

		} else if ( event.wheelDelta ) {

			camera.fov -= event.wheelDelta * 0.05;

		// Firefox

		} else if ( event.detail ) {

			camera.fov += event.detail * 1.0;

		}

		camera.updateProjectionMatrix();

	}

	function animate() {

		requestAnimationFrame( animate );
		update();
		if (frames / fps < 6) {                                                                                    
		  var readBuffer = new Uint8Array(width * height * 4);
		  var context = renderer.getContext();
		  var canvas = renderer.domElement;
		  context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, readBuffer);
		  
		  encoder.addFrame(readBuffer, true);
		}
		if (frames / fps == 6) {
		  encoder.finish();
		  document.getElementById("image").src = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
		}
		frames++;
	}

	function update() {

		if ( isUserInteracting === false ) {

			lon += 0.1;

		}

		lat = Math.max( - 85, Math.min( 85, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );

		camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
		camera.target.y = 500 * Math.cos( phi );
		camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

		camera.lookAt( camera.target );

		/*
		// distortion
		camera.position.copy( camera.target ).negate();
		*/

		renderer.render( scene, camera );

	}

}

