
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

var colors = [
    [0.0, 0.0, 0.0, 0.0],  // white
    [0.0, 0.0, 0.0, 1.0],  // black
    [1.0, 0.0, 0.0, 1.0],  // red
    [1.0, 1.0, 0.0, 1.0],  // yellow
    [0.0, 1.0, 0.0, 1.0],  // green
    [0.0, 0.0, 1.0, 1.0],  // blue
    [1.0, 0.0, 1.0, 1.0],  // magenta
    [0.0, 1.0, 1.0, 1.0]   // cyan
];

var cindex = 0;

var vertices = [];
var vtxcolor = [];

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
        polygons.push({vertices, vtxcolor})
        render()
        vertices = [];
        vtxcolor = [];
    })

    var menu = document.getElementById("mymenu")
    menu.addEventListener("click", () => {
        cindex = menu.selectedIndex;
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
            vtxcolor = vtxcolor.concat(colors[cindex])
            break;
        case "select":
            // get coordinates of clicked
            var x = 2*event.clientX/canvas.width-1
            var y = 2*(canvas.height-event.clientY)/canvas.height-1
            var idx = getIdxOfLastPolygonThatContains(x,y);
            console.log(idx)
            if (idx >= 0) changeColor(polygons[idx]);
            render()
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

function drawPolygon(vertices, color_per_vtc) {
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var indices = []
    for(var i=0; i < vertices.length/2-2; i++) {
        indices.push(0);
        indices.push(i+1);
        indices.push(i+2);
    } 
    console.log(indices);
    console.log(vertices);
    console.log(vertices.length);

    var index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord)

    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(color_per_vtc), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( shaderProgram, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vColor);
    gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0)
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    polygons.forEach( pol => drawPolygon(pol.vertices, pol.vtxcolor))
}

function changeColor(polygon) {
    var n_vertex = polygon.vertices.length/2;
    var newColor = [];
    for(var i=0; i < n_vertex; i++){
        newColor = newColor.concat(colors[cindex])
    }
    polygon.vtxcolor = newColor;
}

function getIdxOfLastPolygonThatContains(x,y) {
    var idx = -1;
    polygons.forEach((element,i) => {
        if (inside([x,y], element.vertices)) idx = i;
    });
    return idx;
}

main()