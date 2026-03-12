// graph.js — BFS and DFS on a random undirected graph

let _gNodes   = [];
let _gEdges   = [];
let _gAdj     = {};
let _gRunning = false;
let _gAlgo    = 'bfs';

const NR = 22;  // node radius

const PSEUDO = {
  bfs:
`BFS(graph, start):
  queue ← [start]
  visited ← {start}

  while queue not empty:
    node ← queue.dequeue()
    visit(node)

    for neighbor of node:
      if not visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`,
  dfs:
`DFS(graph, start):
  stack ← [start]
  visited ← {}

  while stack not empty:
    node ← stack.pop()
    if visited: continue
    visited.add(node)
    visit(node)

    for neighbor of node:
      if not visited:
        stack.push(neighbor)`
};

// --- Build graph -------------------------------------------------

function buildGraph() {
  stopGraph();
  _clearLog();
  const canvas = document.getElementById('graphCanvas');
  const {w,h}  = cSize(canvas);
  const N = 12;
  _gNodes=[]; _gEdges=[]; _gAdj={};

  // Place nodes in a 4×3 grid with jitter
  const cols=4, rows=3;
  const px=w*.12, py=h*.15;
  const cw=(w-px*2)/(cols-1), ch=(h-py*2)/(rows-1);

  for(let i=0;i<N;i++){
    const c=i%cols, r=Math.floor(i/cols);
    _gNodes.push({
      id:i, label:String(i),
      x: px+c*cw+(Math.random()-.5)*cw*.35,
      y: py+r*ch+(Math.random()-.5)*ch*.35,
      state:'unvisited'
    });
    _gAdj[i]=[];
  }

  // Ensure connectivity: link shuffled order
  const ord = shuffleArr([...Array(N).keys()]);
  for(let i=1;i<ord.length;i++) _addEdge(ord[i-1],ord[i]);

  // Add random extras
  for(let k=0;k<Math.floor(N*.7);k++){
    const a=randInt(0,N-1), b=randInt(0,N-1);
    if(a!==b && !_gAdj[a].includes(b)) _addEdge(a,b);
  }

  document.getElementById('pseudocode').textContent = PSEUDO[_gAlgo];
  _drawGraph();
}

function _addEdge(a,b){
  _gEdges.push({from:a,to:b});
  _gAdj[a].push(b);
  _gAdj[b].push(a);
}

// --- Select algo -------------------------------------------------

function selectGraphAlgo(algo) {
  _gAlgo = algo;
  document.getElementById('pill-bfs').classList.toggle('active', algo==='bfs');
  document.getElementById('pill-dfs').classList.toggle('active', algo==='dfs');
  document.getElementById('gAlgoChip').textContent = algo==='bfs' ? 'BFS' : 'DFS';
  document.getElementById('pseudocode').textContent = PSEUDO[algo];
  _resetStates();
}

// --- Traversal ---------------------------------------------------

async function startGraphTraversal() {
  if(_gRunning) return;
  _gRunning = true;
  _resetStates();
  _clearLog();

  const spd   = parseInt(document.getElementById('gSpeedSlider').value);
  const delay = speedToDelay(spd);

  if(_gAlgo==='bfs') await _bfs(0, delay);
  else               await _dfs(0, delay);

  _gRunning = false;
  document.getElementById('gStatus').textContent = 'Done ✓';
  _addLog('Traversal complete!','d');
}

function stopGraph() {
  _gRunning = false;
  document.getElementById('gStatus').textContent = 'Stopped';
}

async function _bfs(start, delay) {
  const visited = new Set([start]);
  const queue   = [start];
  _gNodes[start].state = 'queued';
  _drawGraph(); let cnt=0;

  while(queue.length && _gRunning) {
    document.getElementById('gFrontier').textContent = 'Queue: ['+queue.join(',')+']';
    const node = queue.shift();
    _gNodes[node].state = 'visiting';
    cnt++; document.getElementById('gVisited').textContent='Visited: '+cnt;
    _addLog('Visit node '+node,'v');
    _drawGraph(); await sleep(delay*2);

    for(const nb of _gAdj[node]){
      if(!visited.has(nb)){
        visited.add(nb); queue.push(nb);
        _gNodes[nb].state='queued';
        _addLog('  Enqueue '+nb,'q');
        _drawGraph(); await sleep(delay);
      }
    }
    _gNodes[node].state='visited';
    _drawGraph(); await sleep(delay);
  }
}

async function _dfs(start, delay) {
  const visited = new Set();
  const stack   = [start];
  let cnt=0;

  while(stack.length && _gRunning) {
    document.getElementById('gFrontier').textContent = 'Stack: ['+stack.join(',')+']';
    const node = stack.pop();
    if(visited.has(node)) continue;
    visited.add(node);
    _gNodes[node].state='visiting';
    cnt++; document.getElementById('gVisited').textContent='Visited: '+cnt;
    _addLog('Visit node '+node,'v');
    _drawGraph(); await sleep(delay*2);

    for(const nb of [..._gAdj[node]].reverse()){
      if(!visited.has(nb)){
        stack.push(nb);
        _gNodes[nb].state='queued';
        _addLog('  Push '+nb,'q');
        _drawGraph(); await sleep(delay);
      }
    }
    _gNodes[node].state='visited';
    _drawGraph(); await sleep(delay);
  }
}

// --- Canvas renderer ---------------------------------------------

function _drawGraph() {
  const canvas = document.getElementById('graphCanvas');
  const {w,h}  = cSize(canvas);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);

  const COLORS = {unvisited:'#1e3050', queued:'#f59e0b', visiting:'#818cf8', visited:'#10b981'};

  // Edges
  _gEdges.forEach(({from,to}) => {
    const a=_gNodes[from], b=_gNodes[to];
    const bothDone = a.state==='visited' && b.state==='visited';
    ctx.strokeStyle = bothDone ? 'rgba(16,185,129,.35)' : '#1a2e4a';
    ctx.lineWidth   = bothDone ? 2 : 1.5;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  });

  // Nodes
  _gNodes.forEach(nd => {
    const col = COLORS[nd.state]||COLORS.unvisited;
    if(nd.state==='visiting'||nd.state==='queued'){
      ctx.shadowColor=col; ctx.shadowBlur=14;
    } else { ctx.shadowBlur=0; }

    ctx.beginPath();
    ctx.arc(nd.x, nd.y, NR, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = nd.state==='unvisited' ? '#2d4060' : col;
    ctx.lineWidth=2; ctx.stroke();
    ctx.shadowBlur=0;

    ctx.fillStyle   = nd.state==='unvisited' ? '#4a6080' : '#fff';
    ctx.font        = '600 12px IBM Plex Mono';
    ctx.textAlign   = 'center';
    ctx.textBaseline= 'middle';
    ctx.fillText(nd.label, nd.x, nd.y);
  });
}

// --- Helpers -----------------------------------------------------

function _resetStates() {
  _gNodes.forEach(n=>n.state='unvisited');
  document.getElementById('gVisited').textContent  = 'Visited: 0';
  document.getElementById('gFrontier').textContent = 'Queue: []';
  document.getElementById('gStatus').textContent   = 'Click play to start';
  _drawGraph();
}

function _clearLog() {
  const el = document.getElementById('tlog');
  el.innerHTML = '<span class="tlog-empty">Run to see log…</span>';
}

function _addLog(msg, type='') {
  const el = document.getElementById('tlog');
  el.querySelector('.tlog-empty')?.remove();
  const e = document.createElement('div');
  e.className='log-entry '+type;
  e.textContent=msg;
  el.appendChild(e);
  el.scrollTop=el.scrollHeight;
}

window.addEventListener('resize', () => {
  const c = document.getElementById('graphCanvas');
  if(c.offsetParent===null) return;
  fitCanvas(c); _drawGraph();
});
