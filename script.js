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
            kmeansInput.style.display = 'block';
            break;
        case "dbscan":
            kmeansInput.style.display = 'none';
            otherInput.style.display = 'none';
            dbscanInput.style.display = 'block';
            break;
        case "other":
            kmeansInput.style.display = 'none';
            dbscanInput.style.display = 'none';
            otherInput.style.display = 'block';
            break;
    }
}
