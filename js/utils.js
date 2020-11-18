

function createMat(rowNum, colNum) {
    var mat = []
    for (var i = 0; i < rowNum; i++) {
        mat[i] = []
        for (var j = 0; j < colNum; j++) {
            mat[i][j] = ''
        }
    }
    return mat
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min); // Min is inclusive, Max is Exclusive
}


function getClassName(location) {
	var cellClass = `cell-${location.i}-${location.j}`;
	return cellClass;
}
