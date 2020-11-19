'use strict'

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
    secsPassed: 0,
    isFirstClick: true,
    userLives: 3,
    userHints: 3
};
var gMood = {
    normal: '😃',
    sad: '🤯',
    won: '😎'
}


var gStartTime;
var gTimeInterval;
var gAskedAdvice = false;


// This is called when page loads
function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true,
        userLives: 3,
        userHints: 3
    }
    clearInterval(gTimeInterval)
    gBoard = buildBoard();
    gAskedAdvice = false;
    renderBoard(gBoard);
    renderMinesCount();
    renderTime();
    renderFlagsPlaced();
    renderUserLives();
    renderUserHints();
    document.querySelector('.score span').innerText = gGame.shownCount;
    document.querySelector('.restart').style.display = 'none';
    document.querySelector('.check-win').style.display = 'block';
    document.querySelector('.mood span').innerText = gMood.normal


};

function setLevel(elLevel) {
    gLevel.size = +elLevel.dataset.size
    gLevel.mines = +elLevel.dataset.mines
    var choices = document.querySelectorAll(".level-choice")
    for (var i = 0; i < choices.length; i++) {
        var choice = choices[i];
        if (choice.id !== elLevel.id) {
            choice.checked = false
        };
    };
    initGame();
};
// Randomly Place the bombs
function placeMine() {
    var emptyCells = getEmptyCells(gBoard);

    for (var n = 0; n < gLevel.mines; n++) {
        var randomIndex = getRandomInt(0, emptyCells.length);
        var coords = emptyCells[randomIndex];
        gBoard[coords.i][coords.j].isMine = true;
        gBoard[coords.i][coords.j].isShown = false;
        emptyCells.splice(randomIndex, 1);
    };
};


// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        if (!cell.isMarked) {
            cell.isMarked = true;
            gGame.markedCount++;
            elCell.classList.add('marked');
            renderFlagsPlaced();
        } else {
            cell.isMarked = false;
            gGame.markedCount--;
            elCell.classList.remove('marked');
            renderFlagsPlaced();
        }
    } else return;
};

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    var minesToCheck = getMinesCells();
    renderHiddenCells()
    if (minesToCheck.length === gLevel.mines && gGame.markedCount === gLevel.mines) {
        setTimeout(function () { alert('You Won') }, 1000)
        document.querySelector('.mood span').innerText = gMood.won
        gameOver();
    } else {
        setTimeout(function () { alert('Maybe Next Time') }, 1000)
        document.querySelector('.mood span').innerText = gMood.sad;
        gameOver();
    };

};

// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (rowIdx === i && colIdx === j) continue
            if (board[i][j].isShown) continue
            board[i][j].isShown = true;
            updateScore();
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (board[i][j].minesAroundCount) {
                elCell.innerText = board[i][j].minesAroundCount
            }
            elCell.classList.add('revealed');
        };
    };

};

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        if (gAskedAdvice && gGame.isFirstClick) {
            alert('Sorry, no hints on very first move');
            gAskedAdvice = false;
            return
        }
        if (gGame.isFirstClick) {
            cell.isShown = true;
            elCell.classList.add('revealed');
            placeMine();
            setMinesNegsCount(gBoard);
            gGame.isFirstClick = false;
        }

        if (gAskedAdvice && gGame.userHints) {
            showCellsForHint(gBoard, i, j)
            setTimeout(hideCellsForHint, 500, gBoard, i, j)
            gGame.userHints--
            gAskedAdvice = false
            renderUserHints()
            return
        }
        if ((cell.isMine) && (gGame.userLives)) {
            alert('try another spot')
            gGame.userLives--
            renderUserLives()
            return
        }
        cell.isShown = true;
        elCell.classList.add('revealed');
        if ((cell.isMine) && (!gGame.userLives)) {
            elCell.innerText = MINE;
            cell.isBlown = true;
            elCell.classList.add('blowed');
            document.querySelector('.mood span').innerText = gMood.sad;
            renderMines();
            gameOver();
        } else if (cell.minesAroundCount) {
            elCell.innerText = cell.minesAroundCount
            updateScore();
        } else {
            updateScore();
            expandShown(gBoard, i, j);
        }
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
    var board = createMat(gLevel.size, gLevel.size)

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
            if ((!board[i][j].isShown) && (!board[i][j].minesAroundCount)) {
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

};

function setHint() {
    gAskedAdvice = true;
}


function renderMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if ((gBoard[i][j].isMine) && (!gBoard[i][j].isBlown)) {
                var cell = { i: i, j: j };
                var elMine = document.querySelector(`.cell-${cell.i}-${cell.j}`);
                elMine.innerText = MINE;
                elMine.classList.add('revealed');
            };
        };
    };

};

function renderHiddenCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {

            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                if (gBoard[i][j].minesAroundCount) {
                    elCell.innerText = gBoard[i][j].minesAroundCount
                }
                if (gBoard[i][j].isMine) {
                    elCell.innerText = MINE;
                }

                elCell.classList.add('revealed')
            };
        };
    };

}

function showCellsForHint(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (board[i][j].isShown) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (board[i][j].minesAroundCount) {
                elCell.innerText = board[i][j].minesAroundCount
            }
            if (board[i][j].isMine) {
                elCell.innerText = MINE
            }
            elCell.classList.add('revealed');

        };
    };

};

function hideCellsForHint(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (board[i][j].isShown) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (board[i][j].minesAroundCount) {
                elCell.innerText = ''
            }
            if (board[i][j].isMine) {
                elCell.innerText = ''
            }
            elCell.classList.remove('revealed');

        };
    };

};



function gameOver() {
    gGame.isOn = false;
    clearInterval(gTimeInterval);
    showRestart();
};

// startTimer() - think later on other option to calculate time check Nevo's lesson
function startTimer() {
    if (gTimeInterval) return
    else {
        gStartTime = new Date().getTime();
        gTimeInterval = setInterval(function () {
            getGameTime()
            renderTime()
        }, 1000)
    };

};


function getGameTime() {
    var currTime = new Date().getTime();
    var diff = currTime - gStartTime
    var sec = Math.floor((diff % (1000 * 60) / 1000));
    gGame.secsPassed = sec;

};
function renderTime() {
    var elTimer = document.querySelector('.timer span');
    elTimer.innerText = gGame.secsPassed;
}


function renderMinesCount() {
    document.querySelector('.mines-to-reveal span').innerText = gLevel.mines
}

function renderFlagsPlaced() {
    document.querySelector('.flags-placed span').innerText = gGame.markedCount
}
function renderUserLives() {
    document.querySelector('.user-lives span').innerText = gGame.userLives
}

function renderUserHints() {
    document.querySelector('.user-hints span').innerText = gGame.userHints
}

function preventDefault(ev) {
    ev.preventDefault();
}

function updateScore() {
    gGame.shownCount++
    document.querySelector('.score span').innerText = gGame.shownCount
}

function showRestart() {
    document.querySelector('.restart').style.display = 'block'
    document.querySelector('.check-win').style.display = 'none'
}
