# AlgoViz — Algorithm Visualizer

> Interactive visualizer for sorting algorithms, graph traversal (BFS/DFS), and Dijkstra pathfinding. Every step animated in real time.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![Canvas](https://img.shields.io/badge/HTML5-Canvas-orange?style=flat-square)
![No Dependencies](https://img.shields.io/badge/dependencies-none-green?style=flat-square)

## Features

### 01 · Sorting (5 algorithms)
| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |

Adjustable array size (10–80), speed (1–5), live comparison + swap counter.

### 02 · Graph Traversal
- **BFS** — explores level-by-level using a queue
- **DFS** — dives deep using a stack
- Random connected graph, step-by-step traversal log, pseudocode panel

### 03 · Dijkstra Pathfinding
- Interactive grid (20×52), draw walls with mouse
- Move start/end nodes
- Generate random maze (recursive DFS backtracker)
- Animated visited cells + shortest path trace

## Structure
```
algoviz/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── utils.js       — sleep, randInt, fitCanvas
│       ├── sorting.js     — 5 algorithms + canvas renderer
│       ├── graph.js       — BFS, DFS, graph builder
│       ├── pathfinding.js — Dijkstra, maze gen, grid renderer
│       └── app.js         — section switching, init
└── README.md
```

## Run Locally
```bash
git clone https://github.com/YOURUSERNAME/algoviz.git
cd algoviz
open index.html   # no build step needed
```

## Tech
- Vanilla JS (ES6+) — zero dependencies
- HTML5 Canvas for all rendering
- CSS custom properties — dark terminal aesthetic
- Fonts: IBM Plex Mono + Bebas Neue + Outfit
