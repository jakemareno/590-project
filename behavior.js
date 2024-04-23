console.clear();

// ----------------------------------------------
// create variables used in your program
// ----------------------------------------------

let gl = null;
let MGS_index = 0;
let mars_y_rot = 0;
let attr_vertex = null;
let attr_normal = null;
let uniform_color = null;
let uniform_view = null;
let uniform_props = null;
let uniform_perspective = null;
let uniform_light = null;
let vertex_data = [];
let normal_data = [];
let canvas = null;
let program = null;
let count = 2;
let size = 3;


// ----------------------------------------------
// camera parameters
// ----------------------------------------------
let xt = 0.5;
let yt = 0.5;
let zt = 0.5;
let fov = 45;

// ----------------------------------------------
// light parameters
// ----------------------------------------------
let lxt = 1.0;
let lyt = 1.0;
let lzt = 1.0;

// ----------------------------------------------
// orbit dynamic parameters
// ----------------------------------------------
let orbit_speed = 0;
let orbit_speed_crd = 3; 
let orbit_radius_crd = 0.65; 
let orbit_angle_crd = 45; 

// ----------------------------------------------
// camera orientation parameters
// ----------------------------------------------
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);


// ----------------------------------------------
// Event listeners
// ----------------------------------------------

// listener for the orbit speed slider
document.getElementById("os").addEventListener("input", function (e) {
    orbit_speed_crd = parseFloat(document.getElementById("os").value);
    document.getElementById("os_crd").innerHTML = " = " + orbit_speed_crd;
});

// listener for the orbit distance slider
document.getElementById("od").addEventListener("input", function (e) {
    orbit_radius_crd = parseFloat(e.target.value);
    document.getElementById("od_crd").innerHTML = " = " + orbit_radius_crd;
});

// listener for the orbit angle slider
document.getElementById("oa").addEventListener("input", function (e) {
    orbit_angle_crd = parseFloat(document.getElementById("oa").value);
    document.getElementById("oa_crd").innerHTML = " = " + orbit_angle_crd;
});

document.getElementById("zt").addEventListener("click", function (e) {
    zt = document.getElementById("zt").value;
    document.getElementById("z_crd").innerHTML = "= " + zt;
});

document.getElementById("xt").addEventListener("click", function (e) {
    xt = document.getElementById("xt").value;
    document.getElementById("x_crd").innerHTML = "= " + xt;
});

document.getElementById("yt").addEventListener("click", function (e) {
    yt = document.getElementById("yt").value;
    document.getElementById("y_crd").innerHTML = "= " + yt;
});
document.getElementById("fov").addEventListener("click", function (e) {
    fov = document.getElementById("fov").value;
    document.getElementById("fovy").innerHTML = "= " + fov;
});

document.getElementById("lzt").addEventListener("click", function (e) {
    lzt = document.getElementById("lzt").value;
    document.getElementById("lz_crd").innerHTML = "= " + lzt;
});

document.getElementById("lxt").addEventListener("click", function (e) {
    lxt = document.getElementById("lxt").value;
    document.getElementById("lx_crd").innerHTML = "= " + lxt;
});

document.getElementById("lyt").addEventListener("click", function (e) {
    lyt = document.getElementById("lyt").value;
    document.getElementById("ly_crd").innerHTML = "= " + lyt;
});

document.getElementById("reset_cl").addEventListener("click", function (e) {
    xt = yt = zt = 0.5;
    lxt = lyt = lzt = 1.0;
    fov = 45;
    document.getElementById("xt").value = xt;
    document.getElementById("x_crd").innerHTML = "= " + xt;
    document.getElementById("yt").value = yt;
    document.getElementById("y_crd").innerHTML = "= " + yt;
    document.getElementById("zt").value = zt;
    document.getElementById("z_crd").innerHTML = "= " + zt;
    document.getElementById("fov").value = fov;
    document.getElementById("fovy").innerHTML = "= " + fov;
    document.getElementById("lxt").value = lxt;
    document.getElementById("lx_crd").innerHTML = "= " + lxt;
    document.getElementById("lyt").value = lyt;
    document.getElementById("ly_crd").innerHTML = "= " + lyt;
    document.getElementById("lzt").value = lzt;
    document.getElementById("lz_crd").innerHTML = "= " + lzt;
});

document.getElementById("reset_ss").addEventListener("click", function (e) {
    orbit_speed_crd = 3; 
    orbit_radius_crd = 0.65; 
    orbit_angle_crd = 45; 
    document.getElementById("os").value = orbit_speed_crd;
    document.getElementById("os_crd").innerHTML = " = " + orbit_speed_crd;
    document.getElementById("od").value = orbit_radius_crd;
    document.getElementById("od_crd").innerHTML = " = " + orbit_radius_crd;
    document.getElementById("oa").value = orbit_angle_crd;
    document.getElementById("oa_crd").innerHTML = " = " + orbit_angle_crd;
    draw();
});

// ----------------------------------------------
// Add your coding solution
// ----------------------------------------------


function createVertexData() {
    let row = 0;
    
    for ( let i=0; i<F_p.length; i++ ) {
        
        vertex_data[row++] = V_p[ F_p[i][0] ];
        vertex_data[row++] = V_p[ F_p[i][1] ];
        vertex_data[row++] = V_p[ F_p[i][2] ];
        
    }
    
    MGS_index = vertex_data.length;
    
    for ( let i=0; i<F_s.length; i++ ) {
        vertex_data[row++] = V_s[ F_s[i][0] ];
        vertex_data[row++] = V_s[ F_s[i][1] ];
        vertex_data[row++] = V_s[ F_s[i][2] ];
    }
}

function createNormalData() {
    let row = 0;
    
    for (let i = 0; i < F_p.length; i++){
        let p1 = V_p[ F_p[i][0] ];
        let p2 = V_p[ F_p[i][1] ];
        let p3 = V_p[ F_p[i][2] ];
        let v1 = subtract(p2, p1);
        let v2 = subtract(p3, p1);
        
        let crossProd = cross(v1,v2);
        let normalVector = normalize(crossProd);
        
        normal_data[row++] = normalVector;
        normal_data[row++] = normalVector;
        normal_data[row++] = normalVector;
    }
    
    for (let i = 0; i < F_s.length; i++){
        p1 = V_s[ F_s[i][0] ];
        p2 = V_s[ F_s[i][1] ];
        p3 = V_s[ F_s[i][2] ];
        v1 = subtract(p2, p1);
        v2 = subtract(p3, p1);
        
        crossProd = cross(v1,v2);
        normalVector = normalize(crossProd);
        
        normal_data[row++] = normalVector;
        normal_data[row++] = normalVector;
        normal_data[row++] = normalVector;
    }
}

function configure() {
    canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl");
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    attr_vertex = gl.getAttribLocation( program, "vertex" );
    attr_normal = gl.getAttribLocation( program, "normal" );
    
    uniform_color = gl.getUniformLocation( program, "color" );
    uniform_view = gl.getUniformLocation( program, "V" );
    uniform_perspective = gl.getUniformLocation( program, "P" );
    uniform_light = gl.getUniformLocation( program, "light" ); 
    uniform_props = gl.getUniformLocation( program, "props");
    
    gl.enable( gl.DEPTH_TEST );
}

function allocateMemory() {
    let vertex_id = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_id);
    gl.vertexAttribPointer(attr_vertex, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attr_vertex);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_data), gl.STATIC_DRAW);
    
    let normal_id = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_id);
    gl.vertexAttribPointer(attr_normal, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attr_normal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normal_data), gl.STATIC_DRAW);
}

function draw() {
    //lightVector = vec4(lxt, lyt, lzt, 0);
    //let perspectiveMatrix = perspective(fov, 1.0, 0.3, 3.0);
    
    
    let eye = vec3( xt, yt, zt);
    let V = lookAt( eye, at, up );
    let P = perspective( fov, 1.0, 0.3, 3.0 );
    
    gl.uniformMatrix4fv( uniform_view, false, flatten( V ) );
    gl.uniformMatrix4fv( uniform_perspective, false, flatten( P ) );
    
    
    drawMars();
    drawMGS();
    
    console.log("Drawing");
}

function drawMars() {
    mars_y_rot = (mars_y_rot + 1) % 360
    gl.uniform4f(uniform_props, 0, radians(mars_y_rot), 0, 1);
    gl.uniform4f( uniform_color, 0.75, 0.13, 0.13, 1.0 );
    gl.drawArrays( gl.TRIANGLES, 0, MGS_index );
}

function drawMGS() {
    
}

/*

create the data (including normals), 
context configuration,
memory allocation, and buffering,
set the camera, light, and shading parameters,
transform and draw the model(s), and
animation (i.e., draw at timed intervals)

*/


createVertexData();
createNormalData();
configure();
allocateMemory();
setInterval(draw, 100);