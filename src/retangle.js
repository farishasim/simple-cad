//  initialize variables
var gl = null
var shaderProgram = null


// mode/states
var states = ["create", "c_size"]

// button
var button = {
    create: document.getElementById("create"),
    c_size: document.getElementById("c_size"),
}

// current state
var currentState = "create"

// colors
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

// inisialisasi var awal

var cindex = 0;
var x1,x2,x3,x4;
var y1,y2,y3,y4;
var vertices = [];
var vtxcolor = [];

var rectangles = [];

firstClick = true

// main
function main() {
    // initialization
    init()

    // set background color to black
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);

    

    document.getElementById("canvas").addEventListener('mousedown', event => {
        handleInput(event);
    })
    
    button.create.addEventListener("click", () => changeState("create"))
    button.c_size.addEventListener("click", () => changeState("c_size"))
    
}


function handleInput(event) {
    switch (currentState) {
        case "create":
            // get coordinates of clicked

            if(firstClick){
                firstClick = false
                x1 = 2*event.clientX/canvas.width-1
                y1 = 2*(canvas.height-event.clientY)/canvas.height-1
                

            }else{
                firstClick = true
                x2 = 2*event.clientX/canvas.width-1
                y2 = 2*(canvas.height-event.clientY)/canvas.height-1

                x3 = x1
                y3 = y2

                x4 = x2
                y4 = y1

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

                // push to rectangles
                rectangles.push({vertices, vtxcolor})

                console.log(vertices)
                // render
                render()
                // clear vertices
                vertices = []
                vtxcolor = []
            }    

            break;
        // case "select":
        //     // get coordinates of clicked
        //     var x = 2*event.clientX/canvas.width-1
        //     var y = 2*(canvas.height-event.clientY)/canvas.height-1
        //     var idx = getIdxOfLastPolygonThatContains(x,y);
        //     console.log(idx)
        //     if (idx >= 0) changeColor(polygons[idx]);
        //     render()
        //     break;
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

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    rectangles.forEach( pol => drawPolygon(pol.vertices, pol.vtxcolor))
}




main()




















