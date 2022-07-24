let colors=['blue', 'red', 'green', 'purple', 'orange', 'cyan', 'gold', 'pink']

const canvas = document.getElementById("clusterCanvas");
const ctx = canvas.getContext("2d");

const runButton = window.document.getElementById("run-button");
const stepButton = window.document.getElementById("step-button");
const clearButton = document.getElementById("clear-button");

const kmeansInput = document.getElementById("kmeans-input");
kmeansInput.style.display = 'flex';
const dbscanInput = document.getElementById("dbscan-input");
// const otherInput = document.getElementById("other-input");

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

paper.setup('clusterCanvas');

const pointLayer = new paper.Layer();

const centroidLayer = new paper.Layer();

const keyLayer = new paper.Layer();

keyLayer.activate()

let epsPath = new paper.Path();

epsPath.strokeColor = "red";
epsPath.opacity = 1;
epsPath.add(paper.view.center.x - parseInt(epsInput.value) / 2, 20);
epsPath.add(paper.view.center.x + parseInt(epsInput.value) / 2, 20);
let leftepsBound = new paper.Path.Circle({
    center: [paper.view.center.x - parseInt(epsInput.value) / 2, 20],
    radius: 5,
    strokeColor: 'red',
    opacity: 1
});
let rightepsBound = new paper.Path.Circle({
    center: [paper.view.center.x + parseInt(epsInput.value) / 2, 20],
    radius: 5,
    strokeColor: 'red',
    opacity: 1
})

keyLayer.visible = false;


function doSomething(e) {
    // epsPath.remove();
    keyLayer.visible = false;
    if (runningKmeans) {
        clearTimeout(kmeansTimeout);
        togglePlay();
    }
    currentAlgo = e.target.value;
    resetDBScan();
    centroidLayer.removeChildren();
    centroids = [];
    switch(e.target.value) {
        case "kmeans":
            dbscanInput.style.display = 'none';
            // otherInput.style.display = 'none';
            kmeansInput.style.display = 'flex';
            kmeansInput.style.flexDirection = 'column';
            break;
        case "dbscan":
            kmeansInput.style.display = 'none';
            // otherInput.style.display = 'none';
            dbscanInput.style.display = 'flex';
            dbscanInput.style.flexDirection = 'column';

            // keyLayer.addChild(epsPath);
            keyLayer.visible = true;

            epsInput.addEventListener("input", function(event) {
                epsPath.segments[1].point.x = paper.view.center.x + parseInt(epsInput.value) / 2;
                epsPath.segments[0].point.x = paper.view.center.x - parseInt(epsInput.value) / 2;
                rightepsBound.position.x = paper.view.center.x + parseInt(epsInput.value) / 2;
                leftepsBound.position.x = paper.view.center.x - parseInt(epsInput.value) / 2;
            });
            break;
        // case "other":
        //     kmeansInput.style.display = 'none';
        //     dbscanInput.style.display = 'none';
        //     otherInput.style.display = 'block';
        //     break;
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
        this.circle.strokeColor = 'black';
        this.centroid = null;
        this.applyMatrix = false;
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
                resetDBScan();
            } else if (currentAlgo === "dbscan") {
                resetDBScan();
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
let dbClusterCount = 0;
let dbscanDone = false;

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
            break;
        case "dbscan":
            if (runningDBscan) {
                runningDBscan = false;
                clearTimeout(dbscanTimeout);
            } else {
                runningDBscan = true;
                runDBScan();
            }
            break;
    }
}

function runKmeans() {
    let totalDist = kmeans_step(1000);
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
    console.log('hi')
    dbscan_step(1000, parseInt(epsInput.value), parseInt(minPointsInput.value));
    dbscanTimeout = setTimeout(runDBScan, 1500);
    if (dbscanDone) {
        clearTimeout(dbscanTimeout);
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
            runningKmeans = true;
            kmeans_step(1000);
            runningKmeans = false;
            break;
        case "dbscan":
            runningDBscan = true;
            dbscan_step(1000, parseInt(epsInput.value), parseInt(minPointsInput.value));
            runningDBscan = false;
            break;
    }
}

function kmeans_step(tweenTime) {
    if (centroidLayer.children.length === 0) {
        for (const circle of pointLayer.children) {
            circle.fillColor = "black";
            circle.strokeColor = "black";
        }
    } else if (centroidLayer.children.length === 1) {
        let fillColor = centroidLayer.children[0].strokeColor;
        let strokeColor = centroidLayer.children[0].strokeColor;
        let totalPoint = new paper.Point(0,0);
        for (const circle of pointLayer.children) {
            circle.fillColor = fillColor;
            circle.strokeColor = strokeColor;
            totalPoint = totalPoint.add(circle.position);
            console.log(totalPoint);
        }
        totalPoint = totalPoint.divide(pointLayer.children.length);
        centroidLayer.children[0].tweenTo({position : totalPoint}, tweenTime)
    } else {
        let totalPoints = Array(centroidLayer.children.length).fill(new paper.Point(0,0));
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
            dataPoint.tweenTo({fillColor : centroidLayer.children[leastIndex].strokeColor,
            strokeColor : centroidLayer.children[leastIndex].strokeColor}, tweenTime);
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

// TODO: fix creation of multiple clusters when step pressed before completion of last step

function dbscan_step(tweenTime, eps, minPoints) {
    let unClustered = []
    dbscanDone = false;
    for (const dataPoint of pointLayer.children) {
        if (checkBlack(dataPoint.fillColor)) {
            unClustered.push(dataPoint);
        }
    }
    if (unClustered.length === 0) {
        dbscanDone = true;
        return;
    }
    let all_outliers = true;
    for (const dataPoint of unClustered) {
        let reachable = getReachable(dataPoint, unClustered, eps);
        if (reachable.length >= minPoints) {
            all_outliers = false;
            let clusterColor = colors[dbClusterCount % colors.length];
            let cluster = findCluster(dataPoint, unClustered, reachable, eps);
            animateDBPoints(cluster, clusterColor, tweenTime);
            dbClusterCount++;
            return;
        }
    }
    if (all_outliers) {
        animateDBPoints(unClustered, "magenta", tweenTime);
    }
}

function animateDBPoints(points, myFillColor, tweenTime) {
    animateDBPoint(points.pop(), myFillColor, tweenTime);
    let clusterTimeout = setTimeout(function() {animateDBPoints(points, myFillColor, tweenTime)}, 25);
    if (points.length == 0) {
        clearTimeout(clusterTimeout);
    }
}

function animateDBPoint(dataPoint, myFillColor, tweenTime) {
    let firstStep = dataPoint.tweenTo({strokeWidth : 15, fillColor : myFillColor, strokeColor : myFillColor}, tweenTime / 2);
    firstStep.then(function() {
        dataPoint.tweenTo({strokeWidth : 1}, tweenTime);
    });
}

function findCluster(dataPoint1, unClustered, reachable, eps) {
    let myCluster = [dataPoint1];
    unClustered.splice(unClustered.indexOf(dataPoint1), 1);
    for (dataPoint of reachable) {
        let myReachable = getReachable(dataPoint, unClustered, eps);
        myCluster = myCluster.concat(findCluster(dataPoint, unClustered, myReachable, eps));
    }
    return myCluster;
}

function getReachable(dataPoint1, unClustered, eps) {
    let reachable = []
    for (const dataPoint2 of unClustered) {
        let distance = dataPoint1.position.getDistance(dataPoint2.position);
        // console.log(distance);
        if (distance <= eps) {
            // console.log("hi");
            if (dataPoint1 !== dataPoint2) {
                // console.log(distance);
                reachable.push(dataPoint2)
            }
        }
    }
    // console.log(dataPoint1.position.x + " reaches " + reachable + " of " + unClustered);
    return reachable;
}

function checkBlack(color1) {
    let black = (color1.components[0] === 0) && (color1.components[1] === 0) && (color1.components[2] === 0);
    return black;
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
        circle.strokeColor = "black";
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
        // resetDBScan();
        resetDBScan();
        pointLayer.removeChildren();
        centroidLayer.removeChildren();
        clusterPoints = [];
        centroids = [];
    }
}

function resetDBScan() {
    blackPoints();
    dbScanDone = false;
    runningDBscan = false;
    dbClusterCount = 0;
}

