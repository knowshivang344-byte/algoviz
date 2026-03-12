// pathfinding.js — Dijkstra on an interactive grid

const ROWS=20, COLS=52;
let _grid=[], _start={r:10,c:4}, _end={r:10,c:47};
let _tool='wall', _mouseDown=false, _pathRunning=false;

const T={ EMPTY:0, WALL:1, START:2, END:3 };

// --- Grid init ---------------------------------------------------

function _mkGrid() {
  _grid = Array.from({length:ROWS}, ()=>new Array(COLS).fill(T.EMPTY));
  _grid[_start.r][_start.c] = T.START;
  _grid[_end.r][_end.c]     = T.END;
}

function clearGrid() {
  _pathRunning=false; _mkGrid(); _drawGrid();
  document.getElementById('pStatus').textContent   = 'Draw walls then run';
  document.getElementById('pVisited').textContent  = 'Visited: 0';
  document.getElementById('pLength').textContent   = 'Path: —';
}

function clearPath() {
  _pathRunning=false;
  for(let r=0;r<ROWS;r++)
    for(let c=0;c<COLS;c++)
      if(_grid[r][c]!==T.WALL&&_grid[r][c]!==T.START&&_grid[r][c]!==T.END)
        _grid[r][c]=T.EMPTY;
  _drawGrid();
  document.getElementById('pStatus').textContent  = 'Ready';
  document.getElementById('pVisited').textContent = 'Visited: 0';
  document.getElementById('pLength').textContent  = 'Path: —';
}

// --- Maze (Recursive Backtracker / DFS) --------------------------

function generateMaze() {
  _pathRunning=false;
  // Fill everything with walls
  _grid = Array.from({length:ROWS}, ()=>new Array(COLS).fill(T.WALL));

  // Carve passages with DFS
  const visited = Array.from({length:ROWS}, ()=>new Array(COLS).fill(false));
  const DIRS = [[-2,0],[2,0],[0,-2],[0,2]];

  function carve(r,c){
    visited[r][c]=true; _grid[r][c]=T.EMPTY;
    const dirs=shuffleArr([...DIRS]);
    for(const [dr,dc] of dirs){
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!visited[nr][nc]){
        _grid[r+dr/2][c+dc/2]=T.EMPTY;  // carve wall between
        carve(nr,nc);
      }
    }
  }
  carve(1,1);

  _grid[_start.r][_start.c]=T.START;
  _grid[_end.r][_end.c]=T.END;
  // Ensure start/end accessible
  _grid[_start.r][_start.c+1]=T.EMPTY;
  _grid[_end.r][_end.c-1]=T.EMPTY;

  _drawGrid();
  document.getElementById('pStatus').textContent='Maze ready — Run Dijkstra!';
}

// --- Dijkstra ----------------------------------------------------

async function startDijkstra() {
  if(_pathRunning) return;
  _pathRunning=true; clearPath();

  const spd   = parseInt(document.getElementById('pSpeedSlider').value);
  const delay = speedToDelay(spd);

  const dist = Array.from({length:ROWS},()=>new Array(COLS).fill(Infinity));
  const prev = Array.from({length:ROWS},()=>new Array(COLS).fill(null));
  const done = Array.from({length:ROWS},()=>new Array(COLS).fill(false));
  dist[_start.r][_start.c]=0;

  // Min-heap via sorted array (good enough for our grid sizes)
  const pq=[{r:_start.r,c:_start.c,d:0}];
  let vcnt=0;
  document.getElementById('pStatus').textContent='Searching…';

  while(pq.length && _pathRunning){
    pq.sort((a,b)=>a.d-b.d);
    const {r,c,d}=pq.shift();
    if(done[r][c]) continue;
    done[r][c]=true; vcnt++;
    document.getElementById('pVisited').textContent='Visited: '+vcnt;

    if(_grid[r][c]!==T.START&&_grid[r][c]!==T.END) _grid[r][c]='V';

    if(vcnt%5===0||delay>5){ _drawGrid(); await sleep(Math.max(delay,1)); }

    if(r===_end.r&&c===_end.c){
      await _tracePath(prev,delay);
      document.getElementById('pStatus').textContent='Path found ✓';
      _pathRunning=false; return;
    }

    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nr=r+dr, nc=c+dc;
      if(nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
      if(_grid[nr][nc]===T.WALL||done[nr][nc]) continue;
      const nd=d+1;
      if(nd<dist[nr][nc]){
        dist[nr][nc]=nd; prev[nr][nc]={r,c};
        pq.push({r:nr,c:nc,d:nd});
      }
    }
  }

  _drawGrid();
  if(_pathRunning){
    document.getElementById('pStatus').textContent='No path found!';
  }
  _pathRunning=false;
}

async function _tracePath(prev,delay){
  const path=[]; let cur={..._end};
  while(cur){ path.unshift(cur); cur=prev[cur.r][cur.c]; }
  document.getElementById('pLength').textContent='Path: '+path.length+' cells';
  for(const {r,c} of path){
    if(!_pathRunning) break;
    if(_grid[r][c]!==T.START&&_grid[r][c]!==T.END) _grid[r][c]='P';
    _drawGrid(); await sleep(Math.max(delay,12));
  }
}

// --- Canvas renderer --------------------------------------------

function _drawGrid(){
  const canvas=document.getElementById('pathCanvas');
  const {w,h}=cSize(canvas);
  const ctx=canvas.getContext('2d');
  const cw=w/COLS, ch=h/ROWS;
  ctx.clearRect(0,0,w,h);

  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const v=_grid[r][c];
      ctx.fillStyle =
        v===T.WALL  ? '#1e3050' :
        v===T.START ? '#10b981' :
        v===T.END   ? '#f43f5e' :
        v==='V'     ? '#1d4ed8' :
        v==='P'     ? '#f59e0b' : '#0c1628';
      ctx.fillRect(c*cw+.5, r*ch+.5, cw-1, ch-1);
    }
  }
  // Grid lines (subtle)
  ctx.strokeStyle='rgba(30,48,80,.25)'; ctx.lineWidth=.5;
  for(let r=0;r<=ROWS;r++){ ctx.beginPath();ctx.moveTo(0,r*ch);ctx.lineTo(w,r*ch);ctx.stroke(); }
  for(let c=0;c<=COLS;c++){ ctx.beginPath();ctx.moveTo(c*cw,0);ctx.lineTo(c*cw,h);ctx.stroke(); }
}

// --- Tool & mouse ------------------------------------------------

function setTool(t){
  _tool=t;
  ['wall','erase','start','end'].forEach(x=>
    document.getElementById('tool-'+x).classList.toggle('active',x===t));
}

function _cell(e){
  const canvas=document.getElementById('pathCanvas');
  const rect=canvas.getBoundingClientRect();
  const x=e.clientX-rect.left, y=e.clientY-rect.top;
  return { r:Math.floor(y/rect.height*ROWS), c:Math.floor(x/rect.width*COLS) };
}

function _applyTool(r,c){
  if(r<0||r>=ROWS||c<0||c>=COLS) return;
  if(_tool==='wall'){
    if(_grid[r][c]===T.START||_grid[r][c]===T.END) return;
    _grid[r][c]=T.WALL;
  } else if(_tool==='erase'){
    if(_grid[r][c]===T.START||_grid[r][c]===T.END) return;
    _grid[r][c]=T.EMPTY;
  } else if(_tool==='start'){
    if(_grid[r][c]===T.WALL||_grid[r][c]===T.END) return;
    _grid[_start.r][_start.c]=T.EMPTY;
    _start={r,c}; _grid[r][c]=T.START;
  } else if(_tool==='end'){
    if(_grid[r][c]===T.WALL||_grid[r][c]===T.START) return;
    _grid[_end.r][_end.c]=T.EMPTY;
    _end={r,c}; _grid[r][c]=T.END;
  }
  _drawGrid();
}

function _onDown(e){ if(_pathRunning)return; _mouseDown=true; const {r,c}=_cell(e); _applyTool(r,c); }
function _onMove(e){ if(!_mouseDown||_pathRunning)return; const {r,c}=_cell(e); _applyTool(r,c); }
function _onUp(){ _mouseDown=false; }

// Attach mouse events after DOM ready (done in app.js)
function _attachPathEvents(){
  const c=document.getElementById('pathCanvas');
  c.addEventListener('mousedown',_onDown);
  c.addEventListener('mousemove',_onMove);
  c.addEventListener('mouseup',_onUp);
  c.addEventListener('mouseleave',_onUp);
  c.addEventListener('touchstart',e=>{ e.preventDefault(); _onDown(e.touches[0]); },{passive:false});
  c.addEventListener('touchmove', e=>{ e.preventDefault(); _onMove(e.touches[0]); },{passive:false});
  c.addEventListener('touchend',_onUp);
}

window.addEventListener('resize',()=>{
  const c=document.getElementById('pathCanvas');
  if(c.offsetParent===null) return;
  fitCanvas(c); _drawGrid();
});
