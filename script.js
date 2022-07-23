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

const epsInput = document.getElementById("eps-input");
const minPointsInput = document.getElementById("minPoints-input");

const modelButtons = document.querySelectorAll('input[name="clustering_algo"]');
for(const modelButton of modelButtons){
    modelButton.addEventListener('change', doSomething);
}

canvas.addEventListener("contextmenu", function(event){
        event.stopPropagation();
        event.preventDefault();
        return false;
});

let currentAlgo = "kmeans";
let curCore = null;
let curNeighbors = [];

function doSomething(e) {
    if (runningKmeans) {
        clearTimeout(kmeansTimeout);
        togglePlay();
    }
    currentAlgo = e.target.value;
    blackPoints();
    centroidLayer.removeChildren();
    centroids = [];
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
let running = false;
let lastTotalDist = 0;

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
            if (currentAlgo === "dbscan" && runningDBscan === true) {
                runAlgo();
                blackPoints();
            }
            if(event.event.button === 2) {
                if (tool.fixedDistance !== 1) {
                    tool.fixedDistance = 1;
                }
                rightClick = true;
                let pointResult = pointLayer.hitTest(event.point, hitOptions);
                let centroidResult = centroidLayer.hitTest(event.point);
                if (pointResult) {
                    // console.log(pointResult.item.index);
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
                        // console.log('hi');
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
                // console.log(event.event);
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

let runningKmeans = false;
let runningDBscan = false;
let kmeansTimeout = null;
let dbscanTimeout = null;

function runAlgo() {
    togglePlay();
    switch(currentAlgo) {
        case "kmeans":
            if (runningKmeans) {
                runningKmeans = false;
                clearTimeout(kmeansTimeout);
            } else {
                runningKmeans = true;
                runKmeans();
            }
        case "dbscan":
            if (runningDBscan) {
                runningDBscan = false;
                clearTimeout(dbscanTimeout);
            } else {
                runningDBscan = true;
                runDBScan();
            }
    }
}

function runKmeans() {
    totalDist = kmeans_step(1000);
    kmeansTimeout = setTimeout(runKmeans, 1500);
    if (Math.abs(lastTotalDist - totalDist) < 10) {
        clearTimeout(kmeansTimeout);
        runningKmeans = false;
        togglePlay();
    }
    console.log(Math.abs(lastTotalDist - totalDist));
    lastTotalDist = totalDist;
}

function runDBScan() {

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
            runningKmeans = true;
            kmeans_step(1000);
            runningKmeans = false;
        case "dbscan":
            runningDBscan = true;
            dbscan_step(1000, parseInt(epsInput.value), parseInt(minPointsInput.value));
            runningDBscan = false;
    }
}

function kmeans_step(tweenTime) {
    if (centroidLayer.children.length === 0) {
        for (const circle of pointLayer.children) {
            circle.fillColor = "black";
        }
    } else if (centroidLayer.children.length === 1) {
        let fillColor = centroidLayer.children[0].strokeColor;
        let totalPoint = new paper.Point((0,0));
        for (const circle of pointLayer.children) {
            circle.fillColor = fillColor;
            totalPoint = totalPoint.add(circle.position);
            console.log(totalPoint);
        }
        totalPoint = totalPoint.divide(pointLayer.children.length);
        centroidLayer.children[0].tweenTo({position : totalPoint}, tweenTime)
    } else {
        let totalPoints = Array(centroidLayer.children.length).fill(new paper.Point((0,0)));
        let numPoints = Array(centroidLayer.children.length).fill(0);
        let totalDistance = 0;
        for (const dataPoint of pointLayer.children) {
            let minDist = Number.MAX_SAFE_INTEGER;
            let leastIndex = 0;
            for (const centroid of centroidLayer.children) {
                // console.log(dataPoint.position);
                let dist = dataPoint.position.getDistance(centroid.position);
                if (dist < minDist) {
                    leastIndex = centroid.index;
                    minDist = dist;
                }
            }
            totalDistance += minDist;
            numPoints[leastIndex]++;
            totalPoints[leastIndex] = totalPoints[leastIndex].add(dataPoint.position);
            dataPoint.tweenTo({fillColor : centroidLayer.children[leastIndex].strokeColor}, tweenTime);
            // dataPoint.fillColor = centroidLayer.children[leastIndex].strokeColor;
        }
        for (let i = 0; i < totalPoints.length; i++) {
            if (numPoints[i] !== 0) {
                totalPoints[i] = totalPoints[i].divide(numPoints[i]);
            }
            centroidLayer.children[i].tweenTo({position : totalPoints[i]}, tweenTime);
        }
        return totalDistance;
    }
}

// Thoughts: each "step" is just one cluster- doing individual points would be a pain
// While running step, disable point addition/deletion to not mess things up

function dbscan_step(tweenTime, minPoint, EPS) {
    // if (curCore != null && (typeof(curCore.index) !== "undefined")) {

    // }
    let unClustered = []
    for (const dataPoint of pointLayer.children) {
        if (checkBlack(dataPoint.fillColor)) {
            unClustered.push(dataPoint);
        }
    }
    for (const dataPoint of unClustered) {

    }
}

function checkCore(dataPoint, unClustered) {
    for (const dataPoint of unClustered) {

    }
}

function checkBlack(color1) {
    return ((color1[0] === 0) && (color1[1] === 0) && (color1[2] === 0));
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

function blackPoints() {
    for (const circle of pointLayer.children) {
        circle.fillColor = "black";
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
        if (running) {
            runAlgo();
        }
        pointLayer.removeChildren();
        centroidLayer.removeChildren();
        clusterPoints = [];
        centroids = [];
    }
}

