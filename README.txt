Best Search First Maze Solving AI
By: Jeremy Rico
Timestamp: 03 - 11 - 2020 12:36

This program creates a HTML canvas based maze and uses a Best Search First algorithm
to find the best path in the maze. The BestFS uses a priority queue which sorts maze
tiles based on their heuristic function value.

For this project the heuristic function of each tile is calculated as its manhattan
distance from the goal tile. This is as follows:

H(n) = abs(startX - goalX) + abs(startX - goalX)

The program then implements ONE STEP of the BestFS algorithm for animation purposes.
Once the goal tile is reached the program returns the path of tiles the bot took
to get to the goal. 

TO RUN: simply drag the "index.html" file into the internet browser of your choice

Contents:
README.txt - this file
index.html - main .html file with some basic CSS
p5 - folder of javascript functions for easy animation and canvas painting
sketch.js - main js script contains drawing functions and algorithm

sketch.js rundown:

1. Calls p5.js to do some basic canvas drawing and animation
2. Creates the grid which the bot is to move on
3. Creates the bot
4. Implements a graph using an adjacency list
5. Implements a priority queue using an array

