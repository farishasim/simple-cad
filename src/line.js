//  initialize variables
var gl = null

var states = ["draw", "change"]

var button = {
    change: document.getElementById("change"),
    draw: document.getElementById("draw")
}

var currentState = "draw"

var vertices = [];

var lines = [];

var circle = [];

var radius = 8;

var moveObject = false;

function handleInput(event, gl) {
    switch (currentState) {
        case "draw":
            // get coordinates of clicked
            var x = event.clientX
            var y = event.clientY
            // add to array
            vertices.push(x, y);
            if (vertices.length == 4){
                lines.push({vertices});
                circle.push(vertices[0], vertices[1]);
                circle.push(vertices[2], vertices[3]);

                drawLine(gl, vertices[0], vertices[1], vertices[2], vertices[3]);
                drawCircle(gl, vertices[0], vertices[1], radius);
                drawCircle(gl, vertices[2], vertices[3], radius);

                vertices = [];
            }
            break;
        case "change":
            // get coordinates of clicked
            var x = event.clientX
            var y = event.clientY

            idxCircle = -1
            for (let i = 0; i < circle.length; i += 2){
                if (isPointInCircle(x, y, circle[i], circle[i+1])) {
                    idxCircle = i;
                }
            }

            if (idxCircle != -1){
                moveObject = true;
                canvas.addEventListener("mouseup", event => {
                    if (moveObject) {
                        var newX = event.clientX
                        var newY = event.clientY

                        idxLine = -1
                        idxPointLine = -1
                        for (let i = 0; i < lines.length; i++){
                            if (lines[i].vertices[0] == circle[idxCircle] && lines[i].vertices[1] == circle[idxCircle + 1]){
                                idxLine = i
                                idxPointLine = 0
                            }
                            if (lines[i].vertices[2] == circle[idxCircle] && lines[i].vertices[3] == circle[idxCircle + 1]){
                                idxLine = i
                                idxPointLine = 2
                            }
                        }

                        lines[idxLine].vertices[idxPointLine] = newX;
                        lines[idxLine].vertices[idxPointLine + 1] = newY;

                        circle[idxCircle] = newX;
                        circle[idxCircle + 1] = newY;

                        gl.clearRect(0, 0, 500, 500);
                        gl.fillStyle = "#C4C4C4";
                        gl.fillRect(0, 0, 500, 500);
                        gl.lineCap = 'round'

                        for (let i = 0; i < circle.length; i += 2){
                            drawCircle(gl, circle[i], circle[i + 1], radius);
                        }

                        for (let i = 0; i < lines.length; i++){
                            drawLine(gl, lines[i].vertices[0], lines[i].vertices[1], lines[i].vertices[2], lines[i].vertices[3]);
                        }

                        moveObject = false;
                    };
                });
            } 
            break;
        default:
            break;
    }
}

function drawLine(gl, startX, startY, endX, endY){
    gl.beginPath();
    gl.moveTo(startX, startY);
    gl.lineTo(endX, endY);
    gl.lineWidth = 3
    gl.stroke();
    gl.closePath();
}

function drawCircle(gl, x, y, r){
    gl.beginPath();
    gl.arc(x, y, r, 0, 2 * Math.PI);
    gl.fillStyle = "black";
    gl.fill();
    gl.closePath();
}

function isPointInCircle(x,y,circleX,circleY){
    var dx = x - circleX - 6;
    var dy = y - circleY - 6;
    return(dx*dx + dy*dy <= radius*radius);
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

function main() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext('2d');

    gl.fillStyle = "#C4C4C4";
    gl.fillRect(0, 0, 500, 500);

    gl.lineCap = 'round'

    document.getElementById("canvas").addEventListener('mousedown', event => {
        handleInput(event, gl);
    })

    button.change.addEventListener("click", () => changeState("change"))
    button.draw.addEventListener("click", () => changeState("draw"))
}

main()