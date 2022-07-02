const canvas = document.getElementById("clusterCanvas");
const ctx = canvas.getContext("2d");

const runButton = document.getElementById("run-button");
const clearButton = document.getElementById("clear-button");

const kmeansInput = document.getElementById("kmeans-input");
const dbscanInput = document.getElementById("dbscan-input");
const otherInput = document.getElementById("other-input");

const modelButtons = document.querySelectorAll('input[name="clustering_algo"]');
for(const modelButton of modelButtons){
    modelButton.addEventListener('change', doSomething);
}

function doSomething(e) {
    switch(e.target.value) {
        case "kmeans":
            dbscanInput.style.display = 'none';
            otherInput.style.display = 'none';
            kmeansInput.style.display = 'flex';
            break;
        case "dbscan":
            kmeansInput.style.display = 'none';
            otherInput.style.display = 'none';
            dbscanInput.style.display = 'flex';
            dbscanInput.style.flexDirection = 'column';
            break;
        case "other":
            kmeansInput.style.display = 'none';
            dbscanInput.style.display = 'none';
            otherInput.style.display = 'block';
            break;
    }
}

// canvas.height = 300;
// canvas.width = 300;

ctx.fillStyle = '#FF0000';
ctx.fillRect(0,0,150,75);

canvas.addEventListener('mousedown', function(e) {
    let rect = e.target.getBoundingClientRect();
    console.log(e.target.getBoundingClientRect());
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "turquoise";
    ctx.fill();
    // ctx.strokeStyle = "turquoise";
    // ctx.stroke();
})

function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
