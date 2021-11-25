'use strict'

const EMPTY = 'empty';
const MINE = '💣';
const FLAG = '🚩';

var gBoard = [];
var gMinesCoords = [];
var gFirstCoord = null;
var gTimerInterval = null;

var gGame = {
   isOn: false,
   shownCount: 0,
   markedCount: 0,
   secsPassed: 0,
   livesLeft: 2,
   hintsLeft: 3,
   hintMode: false,
   costumMode: false,
   minesPlaced: 0,
   safeClicksLeft: 3
}

var gLevel = {
   SIZE: 4,
   MINES: 2,
   LIVES: 2
}

function initGame() {
   gGame = {
      isOn: false,
      shownCount: 0,
      markedCount: 0,
      secsPassed: 0,
      livesLeft: gLevel.LIVES,
      hintsLeft: 3,
      hintMode: false,
      costumMode: false,
      minesPlaced: 0,
      safeClicksLeft: 3
   }
   gMinesCoords = [];
   gFirstCoord = null;
   gTimerInterval = null;
   gBoard = buildBoard();
   renderBoard(gBoard);
   updateEmojy(0);
   updateLives();
   updateHints();
   document.querySelector('.flag-count span').innerText = gLevel.MINES;
   document.querySelector('.timer span').innerText = 0;
   document.querySelector('#costum-mines').style.display = 'none';
   document.querySelector('.safe-btn span').innerText = '(' + gGame.safeClicksLeft + ')';
}

function start() {
   if (!gGame.costumMode) placeMines(gBoard, gLevel.MINES);
   gBoard = setMinesNegsCount(gBoard);
   renderBoard(gBoard);
   updateHints();
   gTimerInterval = setInterval(timer, 1000);
}

function buildBoard() {
   var board = [];
   for (var i = 0; i < gLevel.SIZE; i++) {
      var row = [];
      for (var j = 0; j < gLevel.SIZE; j++) {
         var cell = {
            minesAroundCount: null,
            isShown: false,
            isMine: false,
            isMarked: false
         }
         row.push(cell);
      }
      board.push(row);
   }

   return board;
}

function placeMines(board, minesNum) {
   var count = 0;
   while (count < minesNum) {
      var i = getRandomInt(0, gBoard.length);
      var j = getRandomInt(0, gBoard.length);
      if (i !== gFirstCoord.i && j !== gFirstCoord.j && !board[i][j].isMine) {
         board[i][j].isMine = true;
         gMinesCoords.push({ i, j });
         count++;
      }
   }
   return board;
}

function setMinesNegsCount(board) {
   for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard.length; j++) {
         if (!board[i][j].isMine)
            board[i][j].minesAroundCount = getMineNegsCount({ i, j }, false);
      }
   }
   return board;
}

function getMineNegsCount(location, wantFlags) {
   var mineCount = 0;
   var flagsCount = 0;
   for (var i = location.i - 1; i <= location.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = location.j - 1; j <= location.j + 1; j++) {
         if (j < 0 || j >= gBoard.length) continue;
         if (i === location.i && j === location.j) continue;
         var cell = gBoard[i][j];
         if (cell.isMine) mineCount++;
         if (cell.isMarked || (cell.isShown && cell.isMine)) flagsCount++;
      }
   }
   return (wantFlags) ? flagsCount : mineCount;
}

function renderBoard(board) {
   var boardHTML = '';
   for (var i = 0; i < board.length; i++) {
      boardHTML += '<tr>';
      for (var j = 0; j < board.length; j++) {
         var cellId = getIdName({ i, j });
         boardHTML += `<td id="${cellId}" class="hidden" oncontextmenu="cellMarked(this,event)"
          onclick="cellClicked(this, ${i}, ${j})" ></td>`;
      }
      boardHTML += '</tr>';
   }
   var elBoard = document.querySelector('.board');
   elBoard.innerHTML = boardHTML;
}

function renderCell(location, toClearCell = false) {
   var currCell = gBoard[location.i][location.j];
   var elCell = document.querySelector('#' + getIdName(location));
   var cellContent = '';
   if (currCell.isMarked) {
      cellContent = FLAG;
   } else if (toClearCell) {
      cellContent = null;
   } else {
      if (currCell.isMarked) return;
      cellContent = (currCell.isMine) ? MINE : (currCell.minesAroundCount > 0) ? currCell.minesAroundCount : '';
   }

   elCell.innerHTML = cellContent;
}

function cellClicked(elCell, i, j) {
   var currCell = gBoard[i][j];
   // Costum mode click
   if (gGame.costumMode && gGame.minesPlaced < gLevel.MINES) {
      placeCostumMine({ i, j });
      return;
   }

   // if it's the first click
   if (!gGame.isOn && !gFirstCoord) {
      console.log('click');
      gFirstCoord = { i, j };
      gGame.isOn = true;
      start();
      elCell = document.querySelector('#' + getIdName({ i, j }));
   }
   if (!gGame.isOn || currCell.isMarked) return; // Don't let the user play after game is over

   // cell clicked for hint
   if (gGame.hintMode) {
      gGame.hintsLeft--;
      getHint({ i, j });
      updateHints();
      gGame.hintMode = false;
      if (gFirstCoord) return;
   }

   // if (currCell.isMarked) return;

   if (!currCell.isMine) {
      if (!currCell.isShown) {
         gGame.shownCount++;
         currCell.isShown = true;
         elCell.classList.remove('hidden');
         checkGameOver(false);
      } else {
         expandShown(gBoard, i, j)
      }
      if (currCell.minesAroundCount === 0) expandShown(gBoard, i, j);
   } else if (!currCell.isShown) {
      mineClicked(elCell, { i, j });
   }
   renderCell({ i, j }, false);

}

function mineClicked(elCell, location) {
   var cell = gBoard[location.i][location.j];
   gGame.livesLeft--;
   gGame.markedCount++;
   // model:
   cell.isShown = true;
   // DOM:
   elCell.classList.replace('hidden', 'revealed-mine');
   document.querySelector('.flag-count span').innerText = (gLevel.MINES - gGame.markedCount);
   updateLives();
   checkGameOver((!gGame.livesLeft) ? true : false);
}

function cellMarked(elCell, event) {
   event.preventDefault();
   var location = getCellCoord(elCell.id);
   var currCell = gBoard[location.i][location.j];

   if (currCell.isShown || !gGame.isOn) return;

   (currCell.isMarked) ? gGame.markedCount-- : gGame.markedCount++;
   // model:
   currCell.isMarked = !currCell.isMarked;
   // DOM:
   renderCell(location, true)
   elCell.classList.toggle('flagged');
   document.querySelector('.flag-count span').innerText = (gLevel.MINES - gGame.markedCount);

   checkGameOver(false);
}

function expandShown(board, row, col) {
   var Negsflagged = getMineNegsCount({ i: row, j: col }, true);
   if (gBoard[row][col].minesAroundCount !== Negsflagged) return;
   for (var i = row - 1; i <= row + 1; i++) {
      if (i < 0 || i >= board.length) continue;
      for (var j = col - 1; j <= col + 1; j++) {
         if (j < 0 || j >= board.length) continue;
         if (i === row && j === col) continue;
         var currCell = board[i][j];
         if (currCell.isMarked) continue;
         var elCurrCell = document.querySelector('#' + getIdName({ i, j }));
         if (!currCell.isShown) {
            cellClicked(elCurrCell, i, j);
         }
      }
   }
}

function revealMines() {
   for (var i = 0; i < gMinesCoords.length; i++) {
      var mineCoords = gMinesCoords[i]
      var currMine = gBoard[mineCoords.i][mineCoords.j];
      currMine.isShown = true;
      renderCell(mineCoords)
      var elCell = document.querySelector('#' + getIdName(mineCoords));
      elCell.classList.remove('hidden');
   }
}

function checkGameOver(isLose) {
   if ((gGame.markedCount === gLevel.MINES &&
      (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2)) || isLose) {
      gGame.isOn = false;
      clearInterval(gTimerInterval);
      updateEmojy((isLose) ? 2 : 1);
      revealMines();
   }
}

function restart() {
   clearInterval(gTimerInterval);
   initGame();
}

function changeLevel(size, mines, lives) {
   gLevel = {
      SIZE: size,
      MINES: mines,
      LIVES: lives
   }
   restart();
}