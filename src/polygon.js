
//  initialize variables
var gl = null
var shaderProgram = null

function main() {
    // initialization
    init()

    // set background color to black
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertices = []

    document.getElementById("canvas").addEventListener('mousedown', event => {
        var x = 2*event.clientX/canvas.width-1
        var y = 2*(canvas.height-event.clientY)/canvas.height-1
        vertices.push(x, y);
        console.log(vertices);
    })

    document.getElementById("draw").addEventListener("click", () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawPolygon(vertices);
        vertices = [];
    });
}

function drawPolygon(vertices) {
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var indices = []
    for(var i=0; i < vertices.length/2-2; i++) {
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
    console.log(indices)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

main()