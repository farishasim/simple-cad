
//  initialize variables
var gl = null
var shaderProgram = null

var canvas = document.getElementById("canvas")

var states = ["select", "create", "move"]

var button = {
    select: document.getElementById("select"),
    create: document.getElementById("create"),
    draw: document.getElementById("draw"),
    move: document.getElementById("move"),
    save: document.getElementById("save"),
    load: document.getElementById("load")
}

var currentState = "select"

var objState = "polygon"

var onhold = false

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
var selectedObject;
var idxPoint;

var vertices = [];
var vtxcolor = [];
var ctlpoint = [];

var polygons = [];

function main() {
    // initialization gl and shader
    init()

    // set background color to black
    gl.clearColor(0.8, 0.8, 0.8, 1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById("canvas").addEventListener('mousedown', event => {
        handleInput(event);
    })

    button.select.addEventListener("click", () => changeState("select"))
    button.create.addEventListener("click", () => changeState("create"))
    button.move.addEventListener("click", () => changeState("move"))
    button.draw.addEventListener("click", () => {
        // drawPolygon(vertices);
        polygons.push({
            vertices, 
            vtxcolor,
            ctlpoint,
            type: objState, // "lines", "square", "polygon"
        })
        render()
        vertices = [];
        vtxcolor = [];
        ctlpoint = [];
    })
    button.save.addEventListener("click", () => save())
    button.load.addEventListener("click", () => load())

    var menu = document.getElementById("mymenu")
    menu.addEventListener("click", () => {
        cindex = menu.selectedIndex;
    })
}

function handleInput(event) {
    switch (currentState) {
        case "create":
            // get coordinates of clicked
            var x = getX(event)
            var y = getY(event)
            // add to array
            vertices.push(x, y);
            vtxcolor = vtxcolor.concat(colors[cindex])
            ctlpoint.push(newCtrlPoint(x, y))
            render()
            break;
        case "select":
            // get coordinates of clicked
            var x = getX(event)
            var y = getY(event)
            var idx = getIdxOfLastPolygonThatContains(x,y);
            console.log(idx)
            if (idx >= 0) changeColor(polygons[idx]);
            render()
            break;
        case "move":
            var x = getX(event)
            var y = getY(event)
            checkControlPoint(x, y)
            console.log("selected object", selectedObject)
            if (selectedObject != null) {
                onhold = true
                canvas.addEventListener("mouseup", event => {
                    changeControlPoint(event)
                    render()
                    onhold = false
                })
            } else {
                canvas.removeEventListener("mouseup", event => {
                    changeControlPoint(event)
                })
            }
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

function draw(obj) {
    if (obj.type == "polygon") {
        drawPolygon(obj.vertices, obj.vtxcolor)
        obj.ctlpoint.forEach( p => {
            drawPolygon(p.vertices, p.vtxcolor)
        })
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    polygons.forEach( pol => draw(pol))
    ctlpoint.forEach( p => {
        drawPolygon(p.vertices, p.vtxcolor)
    })
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

function newCtrlPoint(x, y) {
    var control_point = [
        x-0.025, y+0.025, x+0.025, y+0.025,
        x+0.025, y-0.025, x-0.025, y-0.025
    ]
    var ctlcolor = getWhite(4)

    return {
        vertices: control_point,
        vtxcolor: ctlcolor
    }
}

function getWhite(n) {
    var whites = []
    for (let i = 0; i < n; i++) {
        whites = whites.concat(colors[0])        
    }
    return whites
}

function insideBox(point, box) {
    return point[0] >= box[0] && point[0] <= box[4] &&
        point[1] <= box[1] && point[1] >= box[5]
}

function getX(event) {
    var bound = canvas.getBoundingClientRect()
    var x = event.clientX - bound.left
    return (x - canvas.width/2) / (canvas.width/2)
}

function getY(event) {
    var bound = canvas.getBoundingClientRect()
    var y = event.clientY - bound.left
    return (y - canvas.height/2) / (canvas.height/2) * -1
}

function checkControlPoint(x, y) {
    selectedObject = null
    polygons.forEach( pol => {
        pol.ctlpoint.forEach( (point, i) => {
            if (insideBox([x, y], point.vertices)) {
                selectedObject = pol;
                idxPoint = i;
            }
        })
    })
}

function changeControlPoint(event) {
    var x = getX(event)
    var y = getY(event)

    if (onhold) {
        selectedObject.vertices[idxPoint*2] = x
        selectedObject.vertices[idxPoint*2+1] = y

        selectedObject.ctlpoint[idxPoint] = newCtrlPoint(x,y)
    }
}

function save() {
    var data = JSON.stringify(polygons);
    var filename = "data"
    download(filename + ".json", data);
}

function download(filename, text) {
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
}

function load() {
    var file = document.getElementById("import_file").files[0]
    var reader = new FileReader();
    // var data = [];
    reader.onload = function(e){
        console.log('file imported')
        polygons = JSON.parse(e.target.result);
        // console.log(data)
        // arrObjects = data
        render()
    }
    
    reader.readAsText(file);
    if (!file) {
        alert('Blank file')
    }
}

main()