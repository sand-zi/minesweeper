'use strict'

// startTimer() - think later on other option to calculate time check Nevo's lesson
// Think if you need className functions
// timer on mouse button not on click
const MINE = '💣';



var gBoard;
var gLevel = {
    size: 4,
    mines: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gStartTime;
var gTimeInterval;


// This is called when page loads
function initGame() {
    gGame.isOn = true
    gBoard = buildBoard();
    placeMine();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    // console.log(getMinesCells(gBoard))
}

// Randomly Place the bombs
function placeMine() {
    var emptyCells = getEmptyCells(gBoard);

    for (var n = 0; n < 2; n++) {
        var randomIndex = getRandomInt(0, emptyCells.length);
        var coords = emptyCells[randomIndex];
        gBoard[coords.i][coords.j].isMine = true;
        gBoard[coords.i][coords.j].isShown = false;
        emptyCells.splice(randomIndex, 1);
    };
    // console.log(emptyCells)

};


// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        if (!cell.isMarked) {
            cell.isMarked = true
            elCell.classList.add('marked')


        } else {
            cell.isMarked = false;
            elCell.classList.remove('marked')

        }
    } else return

}

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    var minesToCheck = getMinesCells();
    renderHiddenCells()
    if (minesToCheck.length === gLevel.mines) {
       prompt('you won');

    } else{
        gameOver();
    }
     
};

// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, i, j) { };

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        cell.isShown = true;
        elCell.classList.add('revealed');
        if (cell.isMine) {
            cell.isBlown = true;
            elCell.classList.add('blowed');
            elCell.innerText = MINE;
            renderMines();
            gameOver();
        };
        if (cell.minesAroundCount) {
            elCell.innerText = cell.minesAroundCount
        };
    } else return


};

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            cell.minesAroundCount = countNegs(board, i, j);
        };
    };
    
};

// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = createMat(4, 4)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isBlown: false

            };
        };
    };
    return board;
};

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var cellClass = getClassName({ i: i, j: j })
            strHTML += `\t<td class="cell ${cellClass}" onclick="cellClicked(this,${i},${j})" oncontextmenu ="cellMarked(this,${i},${j})">\n`
            strHTML += '\t</td>\n';
        };
        strHTML += '</tr>\n';
    };
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
};

// counts the Neighboors that are bomb
function countNegs(mat, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat.length) continue
            if (rowIdx === i && colIdx === j) continue
            if (!mat[i][j].isMine) continue
            count++;
        }
    }
    return count;
}

// gets array of empty cells
function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if ((!board[i][j].isMine) && (!board[i][j].minesAroundCount)) {
                var cell = { i: i, j: j };
                emptyCells.push(cell);
            };
        };
    };
    
    return emptyCells;
};

function getMinesCells() {
    var minesCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if ((gBoard[i][j].isMine) && (!gBoard[i][j].isShown) && (gBoard[i][j].isMarked)) {

                minesCells.push(gBoard[i][j]);
            };
        };
    };
    return minesCells;

}


function renderMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if ((gBoard[i][j].isMine) && (!gBoard[i][j].isBlown)) {
                var cell = { i: i, j: j };
                var elMine = document.querySelector(`.cell-${cell.i}-${cell.j}`);
                console.log(elMine)
                elMine.innerText = MINE;
                elMine.classList.add('revealed')
            };
        };
    };

};

function renderHiddenCells(){
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            
            if (!gBoard[i][j].isShown)    {
                gBoard[i][j].isShown=true
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                if(gBoard[i][j].isMine){
                    elCell.innerText=MINE;
                }
                if(gBoard[i][j].minesAroundCount){
                    elCell.innerText=gBoard[i][j].minesAroundCount
                }
                elCell.classList.add('revealed')
            };
        };
    };

}

// startTimer() - think later on other option to calculate time check Nevo's lesson
function startTimer() {
    if (gTimeInterval) return
    else {
        gStartTime = new Date().getTime();
        gTimeInterval = setInterval(renderTime, 1000)
    };

};

function gameOver() {
    gGame.isOn = false;
    clearInterval(gTimeInterval);
    console.log('you lost');
};

function renderTime() {
    var currTime = new Date().getTime();
    var diff = currTime - gStartTime
    var sec = Math.floor((diff % (1000 * 60) / 1000));
    var elTimer = document.querySelector('.timer span');
    elTimer.innerText = sec;
};


function preventDefault(ev) {
    ev.preventDefault();
}
