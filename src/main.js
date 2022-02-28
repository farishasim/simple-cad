//  initialize variables
var gl = null
var shaderProgram = null

var canvas = document.getElementById("canvas")

var states = ["select", "create", "move", "polygon", "rectangle", "square"]

var button = {
    select: document.getElementById("select"),
    square: document.getElementById("square"),
    rectangle: document.getElementById("rectan"),
    polygon: document.getElementById("polygon"),
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

// variable global
var cindex = 0;
var selectedObject;
var idxPoint;
var firstClick= true;

// init titik rectangle
var x1,x2,x3,x4;
var y1,y2,y3,y3;

var vertices = [];
var vtxcolor = [];
var ctlpoint = [];

var delta = 0.25;

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
    button.square.addEventListener("click", () => changeState("square"))
    button.rectangle.addEventListener("click", () => changeState("rectangle"))
    button.polygon.addEventListener("click", () => changeState("polygon"))
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
        case "square":
            // get coordinates of clicked
            x1 = getX(event)
            y1 = getY(event)

            x2 = x1 + delta
            y2 = y1

            x3 = x1 + delta
            y3 = y1 - delta

            x4 = x1
            y4 = y1 - delta
            // add to array
            vertices.push(x1, y1);
            vertices.push(x2, y2);
            vertices.push(x3, y3);
            vertices.push(x4, y4);

            // color
            cindex = (cindex+1)%8
            vtxcolor = vtxcolor.concat(colors[cindex])
            vtxcolor = vtxcolor.concat(colors[cindex])
            vtxcolor = vtxcolor.concat(colors[cindex])
            vtxcolor = vtxcolor.concat(colors[cindex])

            // titik kontrol
            ctlpoint.push(newCtrlPoint(x1, y1))
            ctlpoint.push(newCtrlPoint(x2, y2))
            ctlpoint.push(newCtrlPoint(x3, y3))
            ctlpoint.push(newCtrlPoint(x4, y4))

            console.log("masuk sini")
            // push to squares
            polygons.push({
                vertices, 
                vtxcolor,
                ctlpoint,
                type: currentState
            })

            console.log(polygons)

            // render
            render()

            // clear vertices, vtx color, 
            vertices = []
            vtxcolor = []
            ctlpoint = []

            break;
        
        case "rectangle":
            // get coordinates of clicked
            if(firstClick){
                firstClick = false
                x1 = getX(event)
                y1 = getY(event)

            }else{
                firstClick = true
                x2 = getX(event)
                y2 = getY(event)

                x3 = x2
                y3 = y1

                x4 = x1
                y4 = y2

                // add to array
                vertices.push(x1, y1);
                vertices.push(x3, y3);
                vertices.push(x2, y2);
                vertices.push(x4, y4);

                // colors
                cindex = (cindex+1)%8
                vtxcolor = vtxcolor.concat(colors[cindex])
                vtxcolor = vtxcolor.concat(colors[cindex])
                vtxcolor = vtxcolor.concat(colors[cindex])
                vtxcolor = vtxcolor.concat(colors[cindex])

                // titik control
                ctlpoint.push(newCtrlPoint(x1, y1))
                ctlpoint.push(newCtrlPoint(x3, y3))
                ctlpoint.push(newCtrlPoint(x2, y2))
                ctlpoint.push(newCtrlPoint(x4, y4))

                // push to rectangles
                polygons.push({
                    vertices, 
                    vtxcolor,
                    ctlpoint,
                    type: currentState
                })

                console.log(vertices)
                // render
                render()
                // clear vertices
                vertices = []
                vtxcolor = []
                ctlpoint = []
            }    
            break;
        case "polygon":
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
    drawPolygon(obj.vertices, obj.vtxcolor)
    obj.ctlpoint.forEach( p => {
        drawPolygon(p.vertices, p.vtxcolor)
    })
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

    if (!onhold) {
        return
    }

    switch (selectedObject.type) {
        case "polygon":
            changeCtrlPolygon(x, y)
            break;
        case "square":
            changeCtrlSquare(x, y)
            break;
        case "rectangle":
            changeCtrlRect(x, y)
        default:
            break
    }
}

function changeCtrlPolygon(x, y) {
    selectedObject.vertices[idxPoint*2] = x
    selectedObject.vertices[idxPoint*2+1] = y

    selectedObject.ctlpoint[idxPoint] = newCtrlPoint(x,y)
}

function changeCtrlSquare(x, y) {
    // get factor
    var deltaX = x - selectedObject.vertices[idxPoint*2]
    var deltaY = y - selectedObject.vertices[idxPoint*2+1]
    var factor = (deltaX*deltaY>=0) ? 1 : -1;
    
    if (idxPoint == 0 || idxPoint == 2) {
        if (deltaX*deltaY>=0) {
            factor *= -1
        }
    } else {
        if (deltaX*deltaY < 0) {
            factor *= -1
        }
    }

    // get real Y
    y = selectedObject.vertices[idxPoint*2+1] + deltaX*factor

    changeCtrlRect(x,y)
}

function changeCtrlRect(x, y) {
    switch (idxPoint) {
        case 0:
            changeCtrlPolygon(x,y)

            // titik 1 ikut rubah y nya
            idxPoint = 1
            selectedObject.vertices[idxPoint*2+1] = y
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                selectedObject.vertices[idxPoint*2], y)
            
            // titik 3 ikut rubah x nya 
            idxPoint = 3
            selectedObject.vertices[idxPoint*2] = x
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                x, selectedObject.vertices[idxPoint*2+1])
            break;
        case 1:
            changeCtrlPolygon(x,y)

            // titik 0 ikut rubah y nya
            idxPoint = 0
            selectedObject.vertices[idxPoint*2+1] = y
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                selectedObject.vertices[idxPoint*2], y)
                            
            // titik 2 ikut rubah x nya 
            idxPoint = 2 
            selectedObject.vertices[idxPoint*2] = x
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                x, selectedObject.vertices[idxPoint*2+1])
            break;
        case 2:
            changeCtrlPolygon(x,y)

            // titik 1 ikut rubah x nya
            idxPoint = 1
            selectedObject.vertices[idxPoint*2] = x
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                x, selectedObject.vertices[idxPoint*2+1])
            
            // titik 3 ikut rubah y nya 
            idxPoint = 3
            selectedObject.vertices[idxPoint*2+1] = y
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                selectedObject.vertices[idxPoint*2], y)            
            break;
        case 3:
            changeCtrlPolygon(x,y)

            // titik 0 ikut rubah x nya
            idxPoint = 0
            selectedObject.vertices[idxPoint*2] = x
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                x, selectedObject.vertices[idxPoint*2+1])
            
            // titik 2 ikut rubah y nya 
            idxPoint = 2
            selectedObject.vertices[idxPoint*2+1] = y
            selectedObject.ctlpoint[idxPoint] = newCtrlPoint(
                selectedObject.vertices[idxPoint*2], y)
            break;
        default:
            break;
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