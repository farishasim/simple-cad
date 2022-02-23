var gl = null

var vertices = [
    0, 0.5,
    -0.75, 0.75,
    -0.5, 0,
    -0.75, -0.75,
    0, -0.5,
    0.75, -0.75,
    0.5, 0,
    0.75, 0.75
]

var shaderProgram = null

function main() {
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    shaderProgram = createShader()

    // var vertex_buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // var index_buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    
    // gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    drawPolygon(vertices)
}

function drawPolygon(vertices) {
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var indices = []
    for(var i=0; i < vertices.length-2; i++) {
        indices.push(0);
        indices.push(i+1);
        indices.push(i+2);
    } 

    var index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

main()