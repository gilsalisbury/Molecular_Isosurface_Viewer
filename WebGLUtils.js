// code modified from Nicholas at http://philogb.github.io/blog/2010/12/10/animating-isosurfaces-with-webgl-and-workers/

(function () {

  var gl;

  function initContext(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
      alert("Get a Webkit nightly build from here http://nightly.webkit.org/");
    }
  }


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  var program;
  function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(program);

    
    var props = {
      'viewMatrix': gl.getUniformLocation(program, 'viewMatrix'),
      'inverseView': gl.getUniformLocation(program, 'inverseView'),
      'projectionMatrix': gl.getUniformLocation(program, 'projectionMatrix'),
      'projectionInverse': gl.getUniformLocation(program, 'projectionInverse'),
      'normalMatrix': gl.getUniformLocation(program, 'normalMatrix'),
      'color': gl.getUniformLocation(program, 'color'),
      'grid': gl.getUniformLocation(program, 'grid'),
      'cubeMap': gl.getUniformLocation(program, "cubeMap"),
      

      
      'enableLighting': gl.getUniformLocation(program, 'enableLighting'),
      'enableFloorTexture': gl.getUniformLocation(program, 'enableFloorTexture'),
      'ambientColor': gl.getUniformLocation(program, 'ambientColor'),
      'directionalColor': gl.getUniformLocation(program, 'directionalColor'),
      'lightingDirection': gl.getUniformLocation(program, 'lightingDirection'),
      'viewerPosition': gl.getUniformLocation(program, 'viewerPosition'),
      
      'position': gl.getAttribLocation(program, 'position'),
      'normal': gl.getAttribLocation(program, 'normal'),
    };

    for (var p in props) {
      program[p] = props[p];
    }
    gl.enableVertexAttribArray(program.position);
    gl.enableVertexAttribArray(program.normal);

  }
  var vertexBuffer, indexBuffer, normalBuffer;
  function initBuffers() {
    vertexBuffer = gl.createBuffer();
    vertexBuffer.itemSize = 3;
    indexBuffer = gl.createBuffer();
    normalBuffer = gl.createBuffer();
    normalBuffer.itemSize = 3;
  }


  this.initWebGL = function() {
    var canvas = document.getElementById("viz");
    
    initContext(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);

    return {
      ctx: gl,
      indexBuffer: indexBuffer,
      normalBuffer: normalBuffer,
      vertexBuffer: vertexBuffer,
      program: program
    };
  }


})();

