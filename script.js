let colors=['blue', 'red', 'green', 'purple', 'orange', 'cyan', 'gold', 'pink']

const canvas = document.getElementById("clusterCanvas");
const ctx = canvas.getContext("2d");

const runButton = window.document.getElementById("run-button");
const stepButton = window.document.getElementById("step-button");
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

let nums = [0.8, 0.1];
let clusterPoints = [];
let centroids = [];
running = false;

class clusterPoint {
    constructor(point) {
        pointLayer.activate();
        this.circle = new paper.Path.Circle(point, 5);
        this.circle.fillColor = 'black';
        this.centroid = null;
    }
}

class Centroid {
    constructor(point) {
        centroidLayer.activate();
        this.circle = new paper.Path.Circle({center:point, radius:10, opacity:0.5});
        this.circle.strokeColor = colors[centroids.length % colors.length]
        this.circle.fillColor = 'white';
        this.circle.onMouseDrag = function(event) {
            if (event.modifiers.shift) {
                this.position = event.point;
            }
        }
    }
}

paper.setup('clusterCanvas');

const pointLayer = new paper.Layer();

paper.project.addLayer(pointLayer);

const centroidLayer = new paper.Layer();

paper.project.addLayer(centroidLayer);


console.log(paper.project.layers);


// clusterPoints.push(new paper.Point(3, 9))
// console.log(clusterPoints[0])
addStuff()


function addStuff() {
    with (paper) { 
        var tool = new Tool();
        tool.fixedDistance = 20;
        tool.onMouseDown = function(event) {
            if (!event.modifiers.shift) {
                var aPoint = new clusterPoint(event.point)
                clusterPoints.push(aPoint);
            }
            // paper.project.activeLayer.insertChild(0, aPoint);
        }
        tool.onMouseDrag = function(event) {
            if (!event.modifiers.shift) {
                clusterPoints.push(new clusterPoint(event.point));
            }
        }
    }
}

function togglePlay() {
    if (running) {
        runButton.textContent = "Run";
    } else {
        runButton.textContent = "Pause";
    }
    running = !running;
}

function step() {
    addCluster(1);
}

function removeCluster(amount) {
    amount = (typeof amount !== 'undefined') ? amount : 1;
    while (amount > 0 && centroids.length > 0) {
        centroids.pop()
        amount--;
    }
}

function addCluster(amount) {
    amount = (typeof amount !== 'undefined') ? amount : 1;
    while (amount > 0) {
        y = Math.floor(Math.random() * canvas.clientHeight);
        x = Math.floor(Math.random() * canvas.clientWidth);
        centroids.push(new Centroid(new paper.Point(x, y)));
        amount--;
    }

}

function drawLine() {
    var path = new paper.Path();
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    path.moveTo(start);
    path.lineTo(start.add([ 200, -50 ]));
    // paper.view.draw();
}

function clearScreen() {
    with(paper) {
        project.clear()
    }
}