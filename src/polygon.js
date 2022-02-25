
//  initialize variables
var gl = null
var shaderProgram = null

var states = ["select", "create"]

var button = {
    select: document.getElementById("select"),
    create: document.getElementById("create"),
    draw: document.getElementById("draw")
}

var currentState = "select"

var vertices = [];

var polygons = [];

function main() {
    // initialization
    init()

    // set background color to black
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById("canvas").addEventListener('mousedown', event => {
        handleInput(event);
    })

    button.select.addEventListener("click", () => changeState("select"))
    button.create.addEventListener("click", () => changeState("create"))
    button.draw.addEventListener("click", () => {
        // drawPolygon(vertices);
        gl.clear(gl.COLOR_BUFFER_BIT);
        polygons.push(vertices)
        polygons.forEach( pol => drawPolygon(pol))
        vertices = [];
    })
}

function handleInput(event) {
    switch (currentState) {
        case "create":
            // get coordinates of clicked
            var x = 2*event.clientX/canvas.width-1
            var y = 2*(canvas.height-event.clientY)/canvas.height-1
            // add to array
            vertices.push(x, y);
            console.log(vertices);
            break;
        default:
            break;
    }
}

function changeState(newState) {
    if (states.indexOf(newState) === -1) return;

    for (var type in button) {
        if (Object.prototype.hasOwnProperty.call(button, type)) {
            button[type].removeAttribute("disabled");
        }
    }

    button[newState].setAttribute("disabled", "true");
    currentState = newState;
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
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

main()