//import { Vpl } from './data.js';
//import { Vpp } from './data.js';
//import { Fpl } from './data.js';
//import { Fpp } from './data.js';
console.clear();

// ----------------------------------------------
// Axis data (do not modify)
// ----------------------------------------------

let A = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
];

let plane_vert = Vpl;
let prop_vert = Vpp;
let plane_face = Fpl;
let prop_face = Fpp;

// ----------------------------------------------
// end axis data
// ----------------------------------------------

// ----------------------------------------------
// Simuation control (do not modify)
// ----------------------------------------------

let xang = 0;
let yang = 0;
let zang = 0;
let rot = 0;
let axisRotation = null;
let rot_inc = 10;

function startRotation(rotationFunc) {
    if (axisRotation !== null) clearInterval(axisRotation);
    axisRotation = setInterval(rotationFunc, 100);
}

function stopRotation() {
    clearInterval(axisRotation);
    axisRotation = null;
}

document.addEventListener('mouseup', stopRotation);

document.addEventListener('mousedown', function (event) {
    switch ( event.target.id ) {
        case "pitch-up":
            startRotation(() => { xang = ( xang + rot_inc ) % 360; });
            break;
        case "pitch-down":
            startRotation(() => { xang = ( xang - rot_inc ) % 360; });
            break;
        case "roll-left":
            startRotation(() => { zang = ( zang + rot_inc ) % 360; });
            break;
        case "roll-right":
            startRotation(() => { zang = ( zang - rot_inc ) % 360; });
            break;
        case "yaw-left":
            startRotation(() => { yang = ( yang + rot_inc ) % 360; });
            break;
        case "yaw-right":
            startRotation(() => { yang = ( yang - rot_inc ) % 360; });
            break;
        case "reset":
            xang = yang = zang = 0; 
            break;
        default:
            stopRotation();
    }
});

// ----------------------------------------------
// End simuation control
// ----------------------------------------------

let canvases = [];          // Store all 4 canvases
let contextInfo = [];       // Store WebGL context info for each canvas
let vertex_data = [];       // All vertices for plane, prop, and axes
let size = 3;               // We are rendering with triangles
let axis_index = 0;         // Will store the length of plane + prop vertices
let prop_offset = -0.37;    // Used to put propeller at front of plane

function createVertexData() {
    
    let row = 0;

    // add plane vertices + faces to vertex.data
    for ( let i=0; i<Fpl.length; i++ ) {
        vertex_data[row++] = Vpl[ Fpl[i][0] ];
        vertex_data[row++] = Vpl[ Fpl[i][1] ];
        vertex_data[row++] = Vpl[ Fpl[i][2] ];
    }

    // add propeller vertices + faces to vertex.data
    for ( let i=0; i<Fpp.length; i++ ) {
        vertex_data[row++] = Vpp[ Fpp[i][0] ];
        vertex_data[row++] = Vpp[ Fpp[i][1] ];
        vertex_data[row++] = Vpp[ Fpp[i][2] ];
    }

    // create axes
    axis_index = vertex_data.length;
    
    for ( let i=0; i<A.length; i++ ) {
         vertex_data[row++] = A[i];
    }

}

function configure() {
    // Get each canvas
    canvases.push(document.getElementById("xyz"));
    canvases.push(document.getElementById("xz"));
    canvases.push(document.getElementById("yz"));
    canvases.push(document.getElementById("xy"));

    // For each canvas, setup WebGL context info
    for(let canvas of canvases) {
        let gl = canvas.getContext("webgl");
        let program = initShaders(gl, "vertex-shader", "fragment-shader");

        gl.useProgram(program);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);
    
        // Store context information
        contextInfo.push({
            gl: gl,
            program: program,
            attr_vertex: gl.getAttribLocation(program, "vertex"),
            uniform_props: gl.getUniformLocation(program, "props"),
            uniform_color: gl.getUniformLocation(program, "color"),
            uniform_z_translation: gl.getUniformLocation(program, "z_translation")
        });
    }    

}

function allocateMemory() {
    for (let info of contextInfo) {
        let gl = info.gl;
        let buffer_id = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);
        gl.vertexAttribPointer(info.attr_vertex, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(info.attr_vertex);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_data), gl.STATIC_DRAW);
    }
}

function draw() {
    
    // XYZ 
    drawPlane(contextInfo[0], xang, yang, zang);

    // XZ - yaw
    drawPlane(contextInfo[1], -90, yang, 0);

    // YZ - pitch
    drawPlane(contextInfo[2], xang, 0, 0);

    // XY - roll 
    drawPlane(contextInfo[3], 0, -90, zang);

}

function drawPlane(info, xAngle, yAngle, zAngle) {
    let gl = info.gl;

    gl.uniform4f(info.uniform_props,
        xAngle * Math.PI/180,
        yAngle * Math.PI/180,
        zAngle * Math.PI/180,
        1.75);

    // Draw wireframe for plane
    gl.uniform4f(info.uniform_color, 0.5, 0.5, 0.5, 1);
    for (let j = 0; j < plane_face.length * 3; j += 3) {
        gl.drawArrays(gl.LINE_STRIP, j, size);
    }

    // Offset for propeller
    gl.uniform1f(info.uniform_z_translation, prop_offset);
    gl.uniform4f(info.uniform_props,
        xAngle * Math.PI/180,
        yAngle * Math.PI/180,
        (zAngle+rot) * Math.PI/180,
        1.75);

    // Draw propeller wireframe
    for (let j = plane_face.length * 3; j < axis_index; j += 3) {
        gl.drawArrays(gl.LINE_STRIP, j, size);
    }

    // Draw propeller triangles
    gl.uniform4f(info.uniform_color, 0.81, 0.81, 0.81, 1.0);
    gl.drawArrays(gl.TRIANGLES, plane_face.length * 3, prop_face.length * 3);

    // Reset to default view
    gl.uniform1f(info.uniform_z_translation, 0);
    gl.uniform4f(info.uniform_props,
        xAngle * Math.PI/180,
        yAngle * Math.PI/180,
        zAngle * Math.PI/180,
        1.75);

    // Draw triangles for plane
    gl.drawArrays(gl.TRIANGLES, 0, plane_face.length * 3);

    // Draw axes
    gl.uniform4f(info.uniform_color, 1.0, 0.0, 0.0, 1.0); // Red
    gl.drawArrays(gl.LINES, axis_index, 2);

    gl.uniform4f(info.uniform_color, 0.0, 1.0, 0.0, 1.0);  // Green
    gl.drawArrays(gl.LINES, axis_index + 2, 2);

    gl.uniform4f(info.uniform_color, 0.0, 0.0, 1.0, 1.0);  // Blue
    gl.drawArrays(gl.LINES, axis_index + 4, 2);

    rot = ( rot + rot_inc ) % 360
}

// Run all functions
createVertexData();
configure();
allocateMemory();
setInterval(draw, 100);