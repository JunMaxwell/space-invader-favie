# Three.js game project

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Description
This is a simple game project using Three.js library. The game is about anti-bacterial cells that are trying to kill the player. The player has to kill the anti-bacterial cells by shooting them. The player can move around the map and shoot the anti-bacterial cells. The player has 3 lives and the game is over when the player loses all of them. The player can also collect power-ups that will help him in the game.

## Controls
- Using the 2 arrows keys to move the player
- The space ship automatically shoots
- The enemies are moving towards the player at random intervals

## Technologies
- Three.js
- Webpack
- JavaScript
- Node.js