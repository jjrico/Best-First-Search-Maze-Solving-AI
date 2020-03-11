// Global
var cols = 37, rows = 29;
var tileSize = 20; //each tile is 20x20 pixels
var tiles = [];
var frame_count;
var frame_rate;
var bot; // to hold bot
var g; // Graph
var pq; // priority queue
var startTile;
var goalTile;
var currTile;
var path = [];

// ================ SETUP PARAMETERS ==========================================

function setup() {
  // set up canvas in middle of window
  // each cell is 20 x 20 pixels
  var canvas = createCanvas(cols * tileSize, rows * tileSize);
  canvas.parent('sketch-holder');

  tiles = create_grid(rows, cols); // array of tiles
  startTile = tiles[38];
  goalTile = tiles[1034];
  currTile = startTile;
  g = new Graph(cols * rows); // graph of size grid

  // Create graph here
  // Add all vertexes to graph
  for (var i = 0; i < tiles.length; i++){
    g.addVertex(tiles[i])
  }
  // Add all edges
  for (var i = 38; i < tiles.length - 3; i++){
    if (tiles[i].navigable) {
      var neighbors = sample(i)
      for (var j = 0; j < neighbors.length; j++) {
        g.addEdge(tiles[i], neighbors[j])
      }
    }
  }

  // create bot instance
  bot = new Bot(startTile, goalTile);

  frame_count = 0;
  frame_rate = 22;

}

// P5 Draw function
function draw() {
  background(0);
  for (var i = 0; i < tiles.length; i++){
    tiles[i].show();
  }
  bot.show();
  ++frame_count;
  if (frame_count % frame_rate == 0) {
    draw_update();
  }
}

// P5 update draw used for animation
function draw_update() {
  currTile = g.BestFS_oneStep(currTile, goalTile)
  bot.moveToCell(currTile);
  bot.show();
  currTile.traveled()
}

// But definition
function Bot(currTile) {
  this.currX = currTile.getX();
  this.currY = currTile.getY();

  // draw dot at current location
  this.show = function() {
    stroke('purple');
    strokeWeight(18);
    point(this.currX + 10, this.currY + 10);
  }

  // Move to a cell on the grid
  this.moveToCell = function(destCell) {
    this.currX = destCell.getX();
    this.currY = destCell.getY()
  }
}


// Tile definition
// the grid is made up of tiles which are either navigable (red) or not (black)
function Tile(i, j, type, traveled = false) {
  this.i = i; // column number
  this.j = j; // row number
  this.navigable = type // tile type
  this.trav = traveled // if tile has been navigated by the bot
  // HEURISTIC FUNCTION
  // calculate manhattan distance from destination tile
  this.H = Math.abs(i - (cols) + 2) + Math.abs(j - rows + 1)

  // getters
  this.getX = function() {return this.i * 20;}
  this.getY = function() {return this.j * 20;}
  this.getH = function() {return this.H;}

  // setter for traveled
  this.traveled = function() {this.trav = true}

  // display tile on the canvas
  this.show = function() {
    var x = this.i * tileSize;
    var y = this.j * tileSize;
    stroke(255);
    strokeWeight(1);
    if (this.navigable) {fill('red');} // red for navigable
    else {fill('black');} // black for wall
    rect(x,y,tileSize,tileSize);

    // if traveled print a small black dot to show path
    if (this.trav) {
      stroke('black');
      strokeWeight(5);
      point(x + 10, y + 10);
    }
  }
}

// GRAPH CLASS DEFINITION
// Adjacency list implementation
class Graph {
  // initialize graph with size and empty list
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices;
    this.adjList = new Map();
    this.explored = new Set();
  }

  // Add Vertex
  addVertex(v){
    // initialize new node of list with another empty list
    this.adjList.set(v, []);
  }

  // Add edge between v & w
  addEdge(v, w) {
    // Get list element and insert w into list
    this.adjList.get(v).push(w);
    // for undirected graph do the same the other way
    // not necessary for this project
    // this.adjList.get(w).push(v);
  }


  // Prints the vertex and adjacency list
  print()
  {
      // get all the vertices
      var get_keys = this.adjList.keys();

      // iterate over the vertices
      for (var i of get_keys) {
          // great the corresponding adjacency list
          // for the vertex
          var get_values = this.adjList.get(i);
          var conc = "";

          // iterate over the adjacency list
          // concatenate the values into a string
          for (var j of get_values)
              conc += j + " ";

          // print the vertex and its adjacency list
          console.log(i + " -> " + conc);
      }
  }

  // BEST FIRST SEARCH
  // Only does one step of the BestFS for animation purposes
  BestFS_oneStep(currTile, goalTile) {
    pq = new PriorityQueue(); //define new pq (so bot only moves to a neighbors)
    pq.push(currTile) // push current tile
    var u = pq.pop(); // pop the front (highest priority)

    // if goal tile is reached return path
    if (u.getX() == goalTile.getX() && u.getY() == goalTile.getY()) {
      return this.explored;
    } else {
      var n = this.adjList.get(u); // array of navigable neighbors
      for (var i = 0; i < n.length; i++) {
        if (!this.explored.has(n[i])) { // if unvisited
          this.explored.add(n[i]); // mark as visited
          // push items to pq and let it determine priority based on heuristic
          // function
          pq.push(n[i]);
        }
      }
    }
    return pq.front();
  }

}

// PRIORIY QUEUE IMPLEMENTATION
// Array based queue
class PriorityQueue {

  constructor() {
    this.items = [];
  }

  push(tile) {
    var contain = false;

    // iterate through array to find location
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].getH() > tile.getH()) {
        this.items.splice(i, 0, tile);
        contain = true;
        break
      }
    }

    // if element has highest priority add it to front
    if(!contain) {this.items.push(tile);}
  }

  // remove highest priority element and return it
  pop() {
    if(this.isEmpty()) { return "Underflow"; }
    return this.items.shift();
  }

  // return front element without popping
  front() {
    if (this.isEmpty()) { return "Queue is Empty"; }
    return this.items[0];
  }

  // empty helper function
  isEmpty() {
    return this.items.length == 0;
  }

}

// helper function to create graph
// gets all neighbors of a tile and pushes them to a list
function sample(i) {
  var n = []
  if (i == 0) {
    var adj = [tiles[i + 1], tiles[i + 37]];
  } else if (i >= 1034) {
    var adj = [tiles[i + 1], tiles[i - 1], tiles[i - 37]];
  } else {
    var adj = [tiles[i + 1], tiles[i + 37], tiles[i - 1],
               tiles[i - 37]];
  }
  for (var j = 0; j < adj.length; j++) {
    if (adj[j].navigable) { n.push(adj[j]); }
  }
  return n;
}

// MASSIVE function to recreate the grid in the project description
// creates an array of tiles to be saved in tiles[]
// The array is later iterated through to print each cell to the canvas
// Seriously this took me like three hours 
function create_grid(rows, cols){
  // Create the grid
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      switch (y) {
        case 1:
          if(x >= 1 && x <= 3 || x >= 9 && x <= 18 || x >= 25 && x <= 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 2:
          if(x == 1 || x >= 3 && x <= 5 || x == 9 || x == 11 ||
            x >= 18 && x <= 22 || x == 25 || x == 27 || x >= 31 && x <= 33) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 3:
          if(x >= 0 && x <= 3 || x == 5 || x >= 9 && x <= 11 ||
             x >= 22 && x <= 27 || x == 33) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 4:
          if(x == 0 || x == 5 || x == 33) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 5:
          if(x >= 0 && x <= 3 || x >= 5 && x <= 6 || x >= 13 && x <= 15 ||
             x >= 17 && x <= 19 || x >= 22 && x <= 26 || x >= 29 && x <= 33) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 6:
          if(x == 1 || x == 3 || x == 6 || x == 13|| x >= 15 && x <= 17 ||
             x == 19 || x >= 21 && x <= 22 || x == 26 || x == 29 || x == 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 7:
          if(x >= 1 && x <= 3 || x >= 6 && x <= 7 || x == 13||
             x >= 17 && x <= 21 || x == 26 || x >= 29 && x <= 34) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 8:
          if(x == 1 || x == 7 || x == 13 || x >= 26 && x <= 29 || x == 34) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 9:
          if(x == 1 || x >= 7 && x <= 13 || x >= 20 && x <= 22 || x == 34) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 10:
          if(x >= 0 && x <= 1 || x == 9 || x == 11 || x == 20 || x == 22 ||
             x >= 34 && x <=35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 11:
          if(x == 0 || x >= 9 && x <= 14 || x >= 20 && x <= 22 ||
             x >= 27 && x <= 30 || x == 35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 12:
          if(x == 0 || x == 11 || x == 14 || x == 21 || x == 27 || x == 30 ||
             x >= 34 && x <= 35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 13:
          if(x == 0 || x >= 5 && x <= 11 || x >= 13 && x <= 15 ||
             x >= 17 && x <= 19 || x == 21 || x >= 25 && x <= 27 ||
             x >= 29 && x <= 31 || x == 34) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 14:
          if(x >= 0 && x <= 1 || x == 5 || x == 7 || x == 13 || x == 15 ||
             x == 17 || x >= 19 && x <= 21 || x == 25 || x == 29 ||
             x >= 31 && x <= 34) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 15:
          if(x == 1 || x >= 4 && x <= 7 || x >= 13 && x <= 15 ||
             x >= 17 && x <= 19 || x == 25 || x >= 29 && x <= 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 16:
          if(x == 1 || x == 4 || x == 14 || x == 18 || x == 25 || x == 30) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 17:
          if(x >= 1 && x <= 2 || x == 4 || x >= 14 && x <= 18 ||
             x >= 22 && x <= 27 || x == 30) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 18:
          if(x == 2 || x >= 4 && x <= 5 || x == 22 || x == 25 || x == 27 ||
             x == 30) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 19:
          if(x == 2 || x == 5 || x >= 15 && x <= 17 || x == 22 ||
             x >= 25 && x <= 27 || x == 30) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 20:
          if(x == 2 || x == 5 || x == 15 || x == 17 || x >= 19 && x <= 22 ||
             x == 25 || x == 27 || x == 30) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 21:
          if( x >= 1 && x <= 3 || x == 5 || x >= 8 && x <= 11 ||
              x >= 13 && x <= 15 || x == 17 || x == 19 || x == 25 || x == 27 ||
              x >= 29 && x <= 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 22:
          if( x == 1 || x >= 3 && x <= 5 || x == 8 || x >= 11 && x <= 13 ||
              x == 15 || x >= 17 && x <= 19 || x == 25 || x == 27 || x == 29 ||
              x == 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 23:
          if( x >= 1 && x <= 3 || x >= 8 && x <= 9 || x >= 13 && x <= 15 ||
              x >= 24 && x <= 25 || x == 27 || x >= 29 && x <= 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 24:
          if(x == 1 || x == 9 || x == 14 || x == 24 || x == 27 || x == 29 ||
             x == 31) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 25:
          if(x >= 1 && x <= 2 || x >= 5 && x <= 7 || x == 9 || x == 14 ||
             x >= 17 && x <= 19 || x >= 24 && x <= 25 || x >= 27 && x <= 29 ||
             x == 31 || x >= 33 && x <= 35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 26:
          if(x == 2 || x == 5 || x >= 7 && x <= 9 || x == 14 || x == 17 ||
             x >= 19 && x <= 22 || x == 25 || x == 31 || x == 33 || x == 35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 27:
          if(x >= 2 && x <= 3 || x >= 5 && x <= 7 || x >= 14 && x <= 19 ||
             x >= 22 && x <= 25 || x >= 31 && x <= 35) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        case 28:
          if(x >= 3 && x <= 5) {
            var tile = new Tile(x, y, true); // create tile
          } else {
            var tile = new Tile(x, y, false); // create wall
          }
          break;

        default:
          var tile = new Tile(x, y, false);
      }
      tiles.push(tile);
    }
  }
  return tiles;
}
