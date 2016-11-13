// http://www.theodinproject.com/courses/javascript-and-jquery/lessons/jquery-and-the-dom
'use strict';



///////////////////////////////////////////////////////////////////////////////
// Function to create/update game space, using a grid of divs
///////////////////////////////////////////////////////////////////////////////
function updateGameGrid(GRIDSIZE, htmlElement) {
    // if the game grid has already been initialized,
    // then clear grid in preparation for drawing new snake position
    if (document.getElementById('grid')) {
        var cellList = document.getElementsByClassName('cell');
        for (var i = 0; i < cellList.length; i += 1) {
            cellList[i].style.backgroundColor = 'white';
            cellList[i].textContent = '';
        }
        return;
    }

    // create new grid from scratch
    var grid = document.createElement('div');
    grid.setAttribute('id', 'grid');

    // create rows
    for (var i = 0; i < GRIDSIZE[0]; i += 1) {

        var row = document.createElement('div');
        row.className = 'row';
        row.id = 'row' + i;

        row.style.clear = 'left';

        // create cells (i.e. "columns")
        for (var j = 0; j < GRIDSIZE[1]; j += 1) {

            var cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell' + i + '-' + j;

            cell.style.float = 'left';
            var cellBorderSize = 0; // px
            cell.style.border = cellBorderSize + 'px solid gray';
            var cellSize = 10; // px
            cell.style.height = '' + cellSize + 'px';
            cell.style.width = cell.style.height;
            cell.style.lineHeight = cell.style.height;

            row.appendChild(cell);
        }

        grid.appendChild(row);
    }

    htmlElement.style.border = '3px solid black';
    htmlElement.style.margin = 'auto';
    htmlElement.style.width =
        '' + GRIDSIZE[0] * (cellSize + cellBorderSize * 2) + 'px';
    htmlElement.style.overflow = 'auto';
    htmlElement.appendChild(grid);
}





///////////////////////////////////////////////////////////////////////////////
// Snake object
///////////////////////////////////////////////////////////////////////////////
var snakeCharacter = {

    currentDirection: 38, // default is up
    newDirection: 38,

    bodyCoordinates: [[]],

    // updates direction
    updateSnakeDirection: function (newKeyDirection) {
        this.newDirection = newKeyDirection;
    },

    // updates body coordinates of the entire snake object
    updateSnakePosition: function () {
        // direction sanity check
        if (this.newDirection === 37 && this.currentDirection === 39 ||
            this.newDirection === 39 && this.currentDirection === 37 ||
            this.newDirection === 38 && this.currentDirection === 40 ||
            this.newDirection === 40 && this.currentDirection === 38) {
            // if new direction is opposite of current, do nothing
        } else {
            this.currentDirection = this.newDirection;
        }
        // update tail position
        for (var i = this.bodyCoordinates.length - 1; i > 0; i -= 1) {
            this.bodyCoordinates[i][0] = this.bodyCoordinates[i - 1][0];
            this.bodyCoordinates[i][1] = this.bodyCoordinates[i - 1][1];
        }
        // update head position based on current direction
        if (this.currentDirection === 37) {
            this.bodyCoordinates[0][1] -= 1; // left
        } else if (this.currentDirection === 38) {
            this.bodyCoordinates[0][0] -= 1; // up
        } else if (this.currentDirection === 39) {
            this.bodyCoordinates[0][1] += 1; // right
        } else if (this.currentDirection === 40) {
            this.bodyCoordinates[0][0] += 1; // down
        }
    },

    // updates html grid elements based on the current snake position
    drawSnakePosition: function () {
        var gridSnakePosition = [];
        for (var i = 0; i < this.bodyCoordinates.length; i += 1) {
            gridSnakePosition[i] =
                'cell' + this.bodyCoordinates[i][0] +
                '-' + this.bodyCoordinates[i][1];
            document.getElementById(gridSnakePosition[i])
                .style.backgroundColor = 'green'; // snake body color
        }
        document.getElementById(gridSnakePosition[0])
            .style.backgroundColor = '#f07000'; // snake head color
    },

    // returns true if snake hits food
    checkFood: function () {
        for (var i = 0; i < foodCoordinates.length; i += 1) {
            if (this.bodyCoordinates[0][0] === foodCoordinates[i][0] &&
                this.bodyCoordinates[0][1] === foodCoordinates[i][1]) {
                return true;
            }
        }
    },

    // adds one length to tail
    lengthenTail: function () {
        var currLength = this.bodyCoordinates.length;
        this.bodyCoordinates[currLength] = [
            this.bodyCoordinates[currLength - 1][0],
            this.bodyCoordinates[currLength - 1][1]
        ];
    },

    // returns true if collision occurs
    checkCollision: function () {
        // check wall collision
        if (this.bodyCoordinates[0][0] < 0 ||
            this.bodyCoordinates[0][1] < 0 ||
            this.bodyCoordinates[0][0] === GRIDSIZE[0] ||
            this.bodyCoordinates[0][1] === GRIDSIZE[1]) {
            return true;
        }
        // check tail collision
        for (var i = 1; i < this.bodyCoordinates.length; i += 1) {
            if (this.bodyCoordinates[0][0] === this.bodyCoordinates[i][0] &&
                this.bodyCoordinates[0][1] === this.bodyCoordinates[i][1]) {
                return true;
            }
        }
    }
};





///////////////////////////////////////////////////////////////////////////////
// Function to randomly generate food on game grid
///////////////////////////////////////////////////////////////////////////////
function generateFood(replacedCoordinates) {

    function locationMatch(randCoords) {
        // if [xCoord,yCoord] ever matches a snake bodyCoordinate,
        // then this function returns an array of those matching elements
        return (
            // returns all matching elements
            snakeCharacter.bodyCoordinates.filter(
                function (el) {
                    if (el[0] === this[0] && el[1] === this[1]) {
                        return true;
                    }
                }, randCoords)
        );
    };

    // replace an eaten food with a newly generated food
    // if no input is given, food will be generated randomly (i.e. initialization)
    for (var i = 0; i < foodAmountTotal; i += 1) {
        // generate random food coordinates until they no longer
        // overlap with the snake
        do {
            var randomCoords = [
                Math.floor(Math.random() * (GRIDSIZE[0] - 1)),
                Math.floor(Math.random() * (GRIDSIZE[0] - 1))
                ];
            var matchingLocations = locationMatch(randomCoords);
        } while (matchingLocations.length > 0);

        if (replacedCoordinates) {
            if (foodCoordinates[i][0] === replacedCoordinates[0] &&
                foodCoordinates[i][1] === replacedCoordinates[1]) {
                foodCoordinates[i] = randomCoords;
            }
        } else {
            foodCoordinates[i] = randomCoords;
        }
    }
}





///////////////////////////////////////////////////////////////////////////////
// Function to draw food on game grid
///////////////////////////////////////////////////////////////////////////////
function drawFood() {
    var gridFoodPosition = [];

    for (var i = 0; i < foodCoordinates.length; i += 1) {

        gridFoodPosition[i] =
            'cell' + foodCoordinates[i][0] +
            '-' + foodCoordinates[i][1];
        document.getElementById(gridFoodPosition[i])
            .textContent = '$';
    }
}





///////////////////////////////////////////////////////////////////////////////
// Function to record arrow key presses
///////////////////////////////////////////////////////////////////////////////
function keyPressHandler(keyPress) {
    if (keyPress.keyCode > 36 && keyPress.keyCode < 41) {
        snakeCharacter.updateSnakeDirection(keyPress.keyCode);
    }
}

window.addEventListener('keydown', keyPressHandler);





///////////////////////////////////////////////////////////////////////////////
// Main game loop
///////////////////////////////////////////////////////////////////////////////
function renderGame() {

    snakeCharacter.updateSnakePosition();

    if (snakeCharacter.checkFood() && isGameRunning) {
        snakeCharacter.lengthenTail();
        generateFood(snakeCharacter.bodyCoordinates[0]);
        document.getElementById('score').textContent =
            'Score: ' + (snakeCharacter.bodyCoordinates.length - 4);
    }

    if (snakeCharacter.checkCollision() && isGameRunning) {
        document.getElementById('game-status').textContent = 'Game Over';
        document.getElementById('container').style.border = '3px dotted red';
        isGameRunning = false;
        return;
    }

    isGameRunning = true;

    updateGameGrid();

    snakeCharacter.drawSnakePosition();

    drawFood();

    setTimeout(renderGame, GAMESPEED);
}





///////////////////////////////////////////////////////////////////////////////
// Function to start/restart the game
///////////////////////////////////////////////////////////////////////////////
function startGame() {

    document.getElementById('container').style.border = '3px solid black';
    document.getElementById('game-status').textContent = 'Snaaake';
    document.getElementById('startButton').textContent = 'Restart';
    document.getElementById('score').textContent = 'Score: 0';

    // reset snake
    snakeCharacter.currentDirection = 38;
    snakeCharacter.newDirection = 38;
    snakeCharacter.bodyCoordinates = [
        [startCoordinate, startCoordinate], // head
        [startCoordinate, startCoordinate], // tail
        [startCoordinate, startCoordinate], // tail
        [startCoordinate, startCoordinate] // tail
    ];

    // initial food generation
    generateFood();

    // this keeps bad stuff from happening,
    // because the game speeds up for some reason
    // when user spams the reset/start button (?)
    if (isGameRunning === true) {
        return;
    } else {
        renderGame();
    }
};





///////////////////////////////////////////////////////////////////////////////
// Initialize new game
///////////////////////////////////////////////////////////////////////////////
var GRIDSIZE = [30, 30];
var startCoordinate = Math.round(GRIDSIZE[0] / 2);
var GAMESPEED = 1000 / 5; // updates per second
var foodAmountTotal = Math.round(GRIDSIZE[0] / 3);
var foodCoordinates = [];
var isGameRunning = false;

updateGameGrid(GRIDSIZE, document.getElementById('container'));
