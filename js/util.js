// 'use strict'

function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min)) + min;
}

function getIdName(location) {
   var cellId = 'cell-' + location.i + '-' + location.j;
   return cellId;
}

function getCellCoord(strCellId) {
   var coord = {};
   var parts = strCellId.split('-');
   coord.i = +parts[1]
   coord.j = +parts[2];
   return coord;
}

function timer() {
   gGame.secsPassed++;
   var elTimeDiv = document.querySelector('.timer span');
   elTimeDiv.innerText = gGame.secsPassed;
}