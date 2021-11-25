'use strict'


function getHint(location) {
   for (var i = location.i - 1; i <= location.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = location.j - 1; j <= location.j + 1; j++) {
         if (j < 0 || j >= gBoard.length) continue;
         if (gBoard[i][j].isShown) continue;
         var elCell = document.querySelector('#' + getIdName({ i, j }));
         elCell.classList.remove('hidden');
         renderCell({ i, j });
      }
   }
   setTimeout(() => {
      for (var i = location.i - 1; i <= location.i + 1; i++) {
         if (i < 0 || i >= gBoard.length) continue;
         for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (gBoard[i][j].isShown) continue;
            var elCell = document.querySelector('#' + getIdName({ i, j }));
            elCell.classList.add('hidden');
            renderCell({ i, j }, true);
         }
      }
   }, 1000, location);
   gGame.hintMode = false;
}

function updateHints() {
   var hintsHTML = '';
   for (var i = 0; i < gGame.hintsLeft; i++) {
      hintsHTML += '<span onclick="gGame.hintMode=!gGame.hintMode;">📡</span>';
   }
   if (!gGame.isOn) hintsHTML = '📡📡📡'
   document.querySelector('#hints').innerHTML = hintsHTML;
}

function updateLives() {
   var livesStr = '';
   for (var i = 0; i < gGame.livesLeft; i++) {
      livesStr += '❤';
   }
   document.querySelector('#lives').innerText = livesStr;
}

function updateEmojy(Idx) {
   var emojies = ['😐', '😎', '🤕'];
   document.querySelector('#emojy').innerText = emojies[Idx];
}

function getSafeCell() {
   if (!gGame.safeClicksLeft || !gGame.isOn) return;
   gGame.safeClicksLeft--;
   var safeCells = [];
   for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
         var currCell = gBoard[i][j];
         if (currCell.isMine || currCell.isMarked || currCell.isShown) continue;
         safeCells.push({ i, j });
      }
   }
   if (!safeCells.length) return;

   document.querySelector('.safe-btn span').innerText = '(' + gGame.safeClicksLeft + ')';

   var randomCoord = safeCells[getRandomInt(0, safeCells.length)];
   var elSafeCell = document.querySelector('#' + getIdName(randomCoord));
   renderCell(randomCoord);
   elSafeCell.classList.replace('hidden', 'safe-cell');
   setTimeout(() => {
      elSafeCell.classList.replace('safe-cell', 'hidden');
      renderCell(randomCoord, true);
   }, 1500, elSafeCell, randomCoord)
}

function costumMode() {
   restart();
   gGame.costumMode = true;
   document.querySelector('#costum-mines span').innerText = '0/' + gLevel.MINES;
   document.querySelector('#costum-mines').style.display = 'inline-block';
}

function placeMine(location) {
   var currCell = gBoard[location.i][location.j];
   if (currCell.isMine) return;
   currCell.isMine = true;
   gMinesCoords.push(location);
}

function showCostumMine(location) {
   var elCell = document.querySelector('#' + getIdName(location));
   elCell.classList.remove('hidden');
   var costumHTML = gGame.costumMinesPlaced + '/' + gLevel.MINES;
   document.querySelector('#costum-mines span').innerText = costumHTML;
}

function hideCostumMines() {
   setTimeout(() => {
      for (var i = 0; i < gMinesCoords.length; i++) {
         renderCell(gMinesCoords[i], true);
         var elCell = document.querySelector('#' + getIdName(gMinesCoords[i]));
         elCell.classList.add('hidden');
      }
      document.querySelector('#costum-mines').style.display = 'none';
   }, 300);
}

function boom7Mode() {
   restart();
   gGame.boom7Mode = true;
   var cellNth = 1;
   var minesCount = 0;
   for (var i = 0; i < gLevel.SIZE; i++) {
      for (var j = 0; j < gLevel.SIZE; j++) {
         if (is7(cellNth)) {
            placeMine({ i, j });
            minesCount++;
         }
         cellNth++;
      }
   }
   gLevel.MINES = minesCount;
}

function is7(num) {
   // if (num === 14) debugger
   if ((num % 7) === 0) return true;
   var numStr = '' + num;
   for (var i = 0; i < numStr.length; i++) {
      if (numStr.charAt(i) === '7') return true;
   }
   return false;
}