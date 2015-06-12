// code modified from Nicholas at http://philogb.github.io/blog/2010/12/10/animating-isosurfaces-with-webgl-and-workers/


//paralelization index
var n = 1,
//number of workers
    nWorkers = Math.pow(8, n), 
//ratio to divide the grid
    den = n + 1,
//number of particles
    nBalls = 12,
//balls
    balls,
//worker group
    workerGroup,
//3D context object
    gl,
    scene,
    glData;





//called when HMTL page is loaded
var start = this.load = function() {

  var input = [];
  if ($('#epi').is(':checked')){
    input = input.concat(epi);
  }
  if ($('#gtp').is(':checked')){
    input = input.concat(gtp);
  }
  if ($('#caf').is(':checked')){
    input = input.concat(caf);
  }
  if ($('#lsy').is(':checked')){
    input = input.concat(lsy);
  }


  
  //Grid.x.from = Grid.y.from = Grid.z.from =  -$('#grid').val();
  //Grid.x.to = Grid.y.to = Grid.z.to = - Grid.x.from;
  

  //initialize balls
  balls = new Balls($('#energy').val(), Grid, input);
  //initialize workers
  workerGroup = new WorkerGroup('WorkerMarchingCube.js', nWorkers);
  //initialize WebGL stuff
  glData = initWebGL();
  
  gl = glData.ctx;

  canvas = document.getElementById( "viz" );
  
  scene = {
    camera: new THREE.Camera(65, gl.viewportWidth / gl.viewportHeight, 0.01, 20000),
    thetaxz: 0,
    thetazy: 0, 
    lighting: {
      enable: true,
      ambient: [0.753, 0.753, 0.753],
      directional: {
        color: [0.75, 0.75, 0.75],
        direction: [ Math.sin(Math.PI/3), 
                     Math.cos(Math.PI/3),
                     Math.sin(Math.PI/3) ]
      }
    },
    floor_texture: {
      enable: true,
    },
    viewMatrix: new THREE.Matrix4,
    elMatrix: new THREE.Matrix4,
    inverseView: new THREE.Matrix4,
    projectionInverse: new THREE.Matrix4
  };
  
  //update camera position
  scene.camera.position.z = 15;
  scene.camera.position.x = -15;
  scene.camera.position.y = 0;
  var x = scene.camera.position.x;
  var y = scene.camera.position.y;
  var z = scene.camera.position.z;
  var dist =  Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  scene.thetaxz = Math.PI-Math.asin(z/dist);
  scene.thetazy = Math.PI-Math.asin(y/dist);


  var drag  = false;
  $(canvas).mousedown( function(event) {     
        mousedown = [event.pageX, event.pageY];
        drag = true;
        $(document).mousemove( function(e) {
            if(drag){
                if ((mousedown[0] - e.pageX) > 0){
                  scene.thetaxz -= .1;
                  scene.camera.position.z = dist*Math.sin(scene.thetaxz );
                  scene.camera.position.x = dist*Math.cos(scene.thetaxz );
                }else if ((mousedown[0] - e.pageX) < 0){
                  scene.thetaxz += .1;
                  scene.camera.position.z = dist*Math.sin(scene.thetaxz );
                  scene.camera.position.x = dist*Math.cos(scene.thetaxz );
                }
                if ((mousedown[1] - e.pageY) > 0){    
                  scene.thetazy -= .1;
                  scene.camera.position.y -= 1;
                }else if (mousedown[1] - e.pageY < 0) {
                  scene.thetazy += .31;
                  scene.camera.position.y += 1;
                }
                if (scene.thetaxz > Math.PI*2) {
                  scene.thetaxz -= Math.PI*2;
                }
                if (scene.thetazy > Math.PI*2) {
                  scene.thetazy -= Math.PI*2;
                }
                mousedown = [e.pageX, e.pageY];
            }
        });
    });

    $(document).mouseup( function(event) {
                drag = false;
            });


var program = glData.program;

  if (true) {
    
    
    var tiger = document.getElementById('tiger');
    

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tiger);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex = gl.getUniformLocation(program, "tex");
    gl.uniform1i(tex, 6);
  

    var posx = document.getElementById('posx');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, posx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex0 = gl.getUniformLocation(program, "tex0");
    gl.uniform1i(tex0, 0);

    var posy = document.getElementById('posy');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, posy);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex1 = gl.getUniformLocation(program, "tex1");
    gl.uniform1i(tex1, 1);

    var posz = document.getElementById('posz');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, posz);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex2 = gl.getUniformLocation(program, "tex2");
    gl.uniform1i(tex2, 2);
  
    var negx = document.getElementById('negx');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex3 = gl.getUniformLocation(program, "tex3");
    gl.uniform1i(tex3, 3);

    var negy = document.getElementById('negy');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negy);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex4 = gl.getUniformLocation(program, "tex4");
    gl.uniform1i(tex4, 4);

    var negz = document.getElementById('negz');
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, negz);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var tex5 = gl.getUniformLocation(program, "tex5");
    gl.uniform1i(tex5, 5);

}

  mapReduce();
};







function mapReduce() {
  Grid.x.step = Grid.y.step = Grid.z.step =  $('#step').val()/100;
  var x = Grid.x,
      xfrom = x.from,
      xto = x.to,
      xstep = x.step,
      nx = ((xto - xfrom) / den),
      y = Grid.y,
      yfrom = y.from,
      yto = y.to,
      ystep = y.step,
      ny = ((yto - yfrom) / den),
      z = Grid.z,
      zfrom = z.from,
      zto = z.to,
      zstep = z.step,
      nz = ((zto - zfrom) / den);
  
  workerGroup.map(function(nb) {
    var idx = nb % den,
        idy = ((nb / den) >> 0) % den,
        idz = ((nb / den / den) >> 0) % den;
    //console.log(idx + " " + idy + " " + idz);
    var o = {
      grid: {
        x: {
          from: xfrom + idx * nx,
          to: xfrom + idx * nx + nx,
          step: xstep
        },
        y: {
          from: yfrom + idy * ny,
          to: yfrom + idy * ny + ny,
          step: ystep
        },
        z: {
          from: zfrom + idz * nz,
          to: zfrom + idz * nz + nz,
          step: zstep
        }
      },
      isolevel: $('#iso').val()/10,
      balls: balls.ballsArray
    };
    return o;
  });


  var indexAcum = 0, initialValue = {
    vertices: [],
    normals: [],
    indices: []
  };

  workerGroup.reduce({
    reduceFn: function (x, y) {
      var l = y.vertices.length /3;
      x.vertices = x.vertices.concat(y.vertices);
      x.normals = x.normals.concat(y.normals);
      while (l--) {
        x.indices.push(indexAcum++);
      }
      return x;
    },
    initialValue: initialValue,
    onComplete: complete
  });
}

 


  var enverts = new Array();
  var envnorm = new Array();
  var enindic = new Array();

  var draw_environment = function() {
  
    var scale = 100;
    var p1 = [scale*Grid.x.from, scale*Grid.y.from , scale*Grid.z.from];
    var p2 = [scale*Grid.x.from, scale*Grid.y.from , scale*Grid.z.to];
    var p3 = [scale*Grid.x.to, scale*Grid.y.from , scale*Grid.z.to];
    var p4 = [scale*Grid.x.to, scale*Grid.y.from , scale*Grid.z.from];
    var p5 = [scale*Grid.x.from, scale*Grid.y.to , scale*Grid.z.from];
    var p6 = [scale*Grid.x.from, scale*Grid.y.to , scale*Grid.z.to];
    var p7 = [scale*Grid.x.to, scale*Grid.y.to , scale*Grid.z.to];
    var p8 = [scale*Grid.x.to, scale*Grid.y.to , scale*Grid.z.from];


  // bottom
    enverts.push (p1[0], p1[1], p1[2]); enindic.push (enverts.length/3-1); enverts.push (p2[0], p2[1], p2[2]); enindic.push (enverts.length/3-1); enverts.push(p3[0], p3[1], p3[2]); enindic.push (enverts.length/3-1);
    enverts.push (p1[0], p1[1], p1[2]); enindic.push (enverts.length/3-1); enverts.push (p4[0], p4[1], p4[2]); enindic.push (enverts.length/3-1); enverts.push(p3[0], p3[1], p3[2]); enindic.push (enverts.length/3-1);
    envnorm.push (0,1,0); envnorm.push (0,1,0); envnorm.push (0,1,0); envnorm.push (0,1,0); envnorm.push (0,1,0); envnorm.push (0,1,0);
  // top
    enverts.push (p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1); enverts.push (p6[0], p6[1], p6[2]); enindic.push (enverts.length/3-1); enverts.push(p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1);
    enverts.push (p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1); enverts.push (p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1); enverts.push(p8[0], p8[1], p8[2]); enindic.push (enverts.length/3-1);
    envnorm.push (0,-1,0); envnorm.push (0,-1,0); envnorm.push (0,-1,0); envnorm.push (0,-1,0); envnorm.push (0,-1,0); envnorm.push (0,-1,0);
  // left
    enverts.push (p1[0], p1[1], p1[2]); enindic.push (enverts.length/3-1); enverts.push (p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1); enverts.push(p2[0], p2[1], p2[2]); enindic.push (enverts.length/3-1);
    enverts.push (p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1); enverts.push (p2[0], p2[1], p2[2]); enindic.push (enverts.length/3-1); enverts.push(p6[0], p6[1], p6[2]); enindic.push (enverts.length/3-1);
    envnorm.push (-1,0,0); envnorm.push (-1,0,0); envnorm.push (-1,0,0); envnorm.push (-1,0,0); envnorm.push (-1,0,0); envnorm.push (-1,0,0);
  // right
    enverts.push (p4[0], p4[1], p4[2]); enindic.push (enverts.length/3-1); enverts.push (p3[0], p3[1], p3[2]); enindic.push (enverts.length/3-1); enverts.push(p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1);
    enverts.push (p4[0], p4[1], p4[2]); enindic.push (enverts.length/3-1); enverts.push (p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1); enverts.push(p8[0], p8[1], p8[2]); enindic.push (enverts.length/3-1);
    envnorm.push (1,0,0); envnorm.push (1,0,0); envnorm.push (1,0,0); envnorm.push (1,0,0); envnorm.push (1,0,0); envnorm.push (1,0,0); 
  // back
    enverts.push (p1[0], p1[1], p1[2]); enindic.push (enverts.length/3-1); enverts.push (p4[0], p4[1], p4[2]); enindic.push (enverts.length/3-1); enverts.push(p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1);
    enverts.push (p5[0], p5[1], p5[2]); enindic.push (enverts.length/3-1); enverts.push (p8[0], p8[1], p8[2]); enindic.push (enverts.length/3-1); enverts.push(p4[0], p4[1], p4[2]); enindic.push (enverts.length/3-1);
    envnorm.push (0,0,1); envnorm.push (0,0,1); envnorm.push (0,0,1); envnorm.push (0,0,1); envnorm.push (0,0,1); envnorm.push (0,0,1);
  // front
    enverts.push (p2[0], p2[1], p2[2]); enindic.push (enverts.length/3-1); enverts.push (p3[0], p3[1], p3[2]); enindic.push (enverts.length/3-1); enverts.push(p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1);
    enverts.push (p2[0], p2[1], p2[2]); enindic.push (enverts.length/3-1); enverts.push (p7[0], p7[1], p7[2]); enindic.push (enverts.length/3-1); enverts.push(p6[0], p6[1], p6[2]); enindic.push (enverts.length/3-1);
    envnorm.push (0,0,-1); envnorm.push (0,0,-1); envnorm.push (0,0,-1); envnorm.push (0,0,-1); envnorm.push (0,0,-1); envnorm.push (0,0,-1);
  // 
  } 

draw_environment();




//called once all workers information has been aggregated
function complete(data) {
  var vertices = data.vertices,
      normals = data.normals,
      indices = data.indices,
      viewMatrix = scene.viewMatrix,
      inverseView = scene.inverseView,
      projectionInverse = scene.projectionInverse,
      elMatrix = scene.elMatrix,
      camera = scene.camera,
      vertexBuffer = glData.vertexBuffer,
      normalBuffer = glData.normalBuffer,
      indexBuffer = glData.indexBuffer,
      program = glData.program,
      gl = glData.ctx,
      lighting = scene.lighting,
      floor_texture = scene.floor_texture,
      vP = camera.position;

  

  //draw scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  //update camera position
  camera.updateMatrix();
  viewMatrix.multiply(camera.matrix, elMatrix);

  // invert view 
  inverseView = THREE.Matrix4.makeInvert(viewMatrix);
  projectionInverse = THREE.Matrix4.makeInvert(camera.projectionMatrix);
  // send camera position
  gl.uniform3f(program.viewerPosition, vP.x, vP.y, vP.z);

  // send grid size
  var scale = 100;
  gl.uniform3f(program.grid, scale*Grid.x.to, scale*Grid.y.to, scale*Grid.z.to);

  //send matrices
  gl.uniformMatrix4fv(program.viewMatrix, false, viewMatrix.flatten());
  gl.uniformMatrix4fv(program.projectionMatrix, false, camera.projectionMatrix.flatten());
  
  gl.uniformMatrix4fv(program.inverseView, false, inverseView.flatten());

  //send normal matrix for lighting
  var normalMatrix = THREE.Matrix4.makeInvert(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(program.normalMatrix, false, normalMatrix.flatten());

  //will probably be changed when we add that awesome silver material ;)
  gl.uniform4f(program.color, 0.75, 0.75, 0.75, 1.0);
  
  //send lighting data
  gl.uniform1i(program.enableFloorTexture, false);
  gl.uniform1i(program.enableLighting, lighting.enable);
  if(lighting.enable) {
    //set ambient light color
    if(lighting.ambient) {
      var acolor = lighting.ambient;
      gl.uniform3f(program.ambientColor, acolor[0], acolor[1], acolor[2]);
    }
    //set directional light
    if(lighting.directional) {
      var dir = lighting.directional,
          color = dir.color,
          pos = dir.direction,
          vd = new THREE.Vector3(pos[0], pos[1], pos[2]).normalize();
      gl.uniform3f(program.lightingDirection, vd.x, vd.y, vd.z);
      gl.uniform3f(program.directionalColor, color[0], color[1], color[2]);
    }
  }


  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  gl.uniform1i(program.cubeMap, 6);

  //console.log(vertices);
  //send vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
  
  //send normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.normal, 3, gl.FLOAT, false, 0, 0);
  
  //send indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  

  gl.uniform1i(program.enableFloorTexture, floor_texture.enable);





  //send vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enverts), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
  
  //send normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(envnorm), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.normal, 3, gl.FLOAT, false, 0, 0);
  
  //send indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(enindic), gl.STATIC_DRAW);

  gl.drawElements(gl.TRIANGLES, enindic.length, gl.UNSIGNED_SHORT, 0);

  
  
  
  //vertices.push (Grid.x.from, 0, Grid.z.from);
  //vertices.push (Grid.x.to, 0, Grid.z.from);
  //vertices.push (Grid.x.from, 0, Grid.z.to);

 
  //update all balls positions
  balls.radius = $('#radius').val();
  balls.update($('#energy').val());

  //call the mapReduce to recalculate vertices and re-render the scene!
  setTimeout(mapReduce, 10);
}


