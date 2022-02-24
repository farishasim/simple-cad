function createShader() {
    // compile vertex shader
    var vertCode = document.getElementById("vertex-shader").innerText;
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    // compile fragment shader
    var fragCode = document.getElementById("fragment-shader").innerText;
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader); 
    gl.attachShader(shaderProgram, fragShader);

    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    
    return shaderProgram;
}

function init() {
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height);
 
    shaderProgram = createShader()
}