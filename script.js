let colors=['blue', 'red', 'green', 'purple', 'orange', 'cyan', 'gold', 'pink']

const canvas = document.getElementById("clusterCanvas");
const ctx = canvas.getContext("2d");

const runButton = window.document.getElementById("run-button");
const stepButton = window.document.getElementById("step-button");
const clearButton = document.getElementById("clear-button");

const kmeansInput = document.getElementById("kmeans-input");
kmeansInput.style.display = 'flex';
const dbscanInput = document.getElementById("dbscan-input");
const otherInput = document.getElementById("other-input");

const modelButtons = document.querySelectorAll('input[name="clustering_algo"]');
for(const modelButton of modelButtons){
    modelButton.addEventListener('change', doSomething);
}

window.addEventListener("contextmenu", function(event){
        event.stopPropagation();
        event.preventDefault();
        return false;
});

let currentAlgo = "kmeans";

function doSomething(e) {
    currentAlgo = e.target.value;
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

const centroidLayer = new paper.Layer();

// paper.project.addLayer(pointLayer);

// paper.project.addLayer(centroidLayer);


// clusterPoints.push(new paper.Point(3, 9))
// console.log(clusterPoints[0])
addStuff()

let rightClick = false;

var hitOptions = {
    fill: true, 
    stroke: true, 
    segments: true, 
    tolerance: 20 
};


function addStuff() {
    with (paper) { 
        pointLayer.activate()
        var tool = new Tool();
        tool.fixedDistance = 20;
        tool.onMouseDown = function(event) {
            if(event.event.button === 2) {
                if (tool.fixedDistance !== 1) {
                    tool.fixedDistance = 1;
                }
                rightClick = true;
                let pointResult = pointLayer.hitTest(event.point, hitOptions);
                let centroidResult = centroidLayer.hitTest(event.point);
                if (pointResult) {
                    console.log(pointResult.item.index);
                    pointResult.item.remove();
                }
                if (centroidResult) {
                    centroidResult.item.remove();
                }
            } else {
                if (tool.fixedDistance !== 20) {
                    tool.fixedDistance = 20;
                }
                if (!event.modifiers.shift) {
                    var aPoint = new clusterPoint(event.point)
                    clusterPoints.push(aPoint);
                } else {
                    if (currentAlgo === "kmeans") {
                        console.log('hi');
                        let hitResult = centroidLayer.hitTest(event.point);
                        if (!hitResult) {
                            centroids.push(new Centroid(event.point));
                        }
                    }
                }
            }
            // paper.project.activeLayer.insertChild(0, aPoint);
        }
        tool.onMouseUp = function(event) {
            rightClick = false;
        }
        tool.onMouseDrag = function(event) {
            if (!event.modifiers.shift && !rightClick) {
                console.log(event.event);
                clusterPoints.push(new clusterPoint(event.point));
            } else if (!event.modifiers.shift && rightClick) {
                let pointResult = pointLayer.hitTest(event.point, hitOptions);
                let centroidResult = centroidLayer.hitTest(event.point);
                if (pointResult) {
                    console.log(pointResult.item.index);
                    pointResult.item.remove();
                }
                if (centroidResult) {
                    centroidResult.item.remove();
                }
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
    switch(currentAlgo) {
        case "kmeans":
            kmeans_step();
    }
}

function kmeans_step() {
    if (centroids.length === 0) {

    }
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
        pointLayer.removeChildren();
        centroidLayer.removeChildren();
        clusterPoints = [];
        centroids = [];
    }
}

