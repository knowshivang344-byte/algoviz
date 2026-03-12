// app.js — entry point, section switching, canvas init

function switchSection(name) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('section-'+name).classList.add('active');
  document.querySelector('[data-section="'+name+'"]').classList.add('active');

  setTimeout(()=>{
    if(name==='sorting'){
      fitCanvas(document.getElementById('sortCanvas'));
      _drawFrame({ arr:_sortArr, cmp:[], swp:[], srt:[], pvt:-1 });
    } else if(name==='graph'){
      fitCanvas(document.getElementById('graphCanvas'));
      if(_gNodes.length) _drawGraph(); else buildGraph();
    } else if(name==='pathfinding'){
      fitCanvas(document.getElementById('pathCanvas'));
      _drawGrid();
    }
  }, 40);
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Sorting init ---
  const sc = document.getElementById('sortCanvas');
  sc.style.height = '320px';
  fitCanvas(sc);
  selectSortAlgo('bubble');  // generates array & draws

  // --- Graph init ---
  const gc = document.getElementById('graphCanvas');
  gc.style.height = '420px';
  fitCanvas(gc);
  buildGraph();

  // --- Pathfinding init ---
  const pc = document.getElementById('pathCanvas');
  pc.style.height = '380px';
  fitCanvas(pc);
  _mkGrid();
  _drawGrid();
  _attachPathEvents();

  // Highlight first complexity card
  document.getElementById('cx-bubble').classList.add('active');
});
