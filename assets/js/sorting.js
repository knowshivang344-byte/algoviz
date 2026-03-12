// sorting.js
// Records animation frames for all 5 sorting algorithms,
// then plays them back on the canvas.
// IMPORTANT: the UI runner is named runSortUI() to avoid
//            any name clash with other modules.

let _sortArr    = [];
let _sortFrames = [];
let _sortRunning = false;
let _sortAlgo   = 'bubble';

// --- Frame format ------------------------------------------------
// { arr:[], comparing:[], swapping:[], sorted:Set|[], pivot:-1 }

function _frame(arr, cmp=[], swp=[], srt=[], pvt=-1) {
  _sortFrames.push({ arr:[...arr], cmp:[...cmp], swp:[...swp], srt:[...srt], pvt });
}

// --- Algorithms --------------------------------------------------

function _recordBubble(a) {
  const n=a.length, srt=[];
  for(let i=0;i<n-1;i++){
    for(let j=0;j<n-i-1;j++){
      _frame(a,[j,j+1],[],srt);
      if(a[j]>a[j+1]){ [a[j],a[j+1]]=[a[j+1],a[j]]; _frame(a,[],[j,j+1],srt); }
    }
    srt.unshift(n-1-i);
  }
  srt.unshift(0);
  _frame(a,[],[],[...Array(n).keys()]);
}

function _recordInsertion(a) {
  const n=a.length, srt=[0];
  for(let i=1;i<n;i++){
    let j=i;
    while(j>0){
      _frame(a,[j-1,j],[],srt);
      if(a[j-1]>a[j]){ [a[j-1],a[j]]=[a[j],a[j-1]]; _frame(a,[],[j-1,j],srt); j--; }
      else break;
    }
    if(!srt.includes(i)) srt.push(i);
  }
  _frame(a,[],[],[...Array(n).keys()]);
}

function _recordSelection(a) {
  const n=a.length, srt=[];
  for(let i=0;i<n-1;i++){
    let m=i;
    for(let j=i+1;j<n;j++){ _frame(a,[m,j],[],srt); if(a[j]<a[m])m=j; }
    if(m!==i){ [a[i],a[m]]=[a[m],a[i]]; _frame(a,[],[i,m],srt); }
    srt.push(i);
  }
  _frame(a,[],[],[...Array(n).keys()]);
}

function _recordMerge(a) {
  function merge(a,l,m,r){
    const L=a.slice(l,m+1), R=a.slice(m+1,r+1);
    let i=0,j=0,k=l;
    while(i<L.length&&j<R.length){
      _frame(a,[l+i,m+1+j]);
      if(L[i]<=R[j]) a[k++]=L[i++]; else { a[k++]=R[j++]; }
      _frame(a,[],[k-1]);
    }
    while(i<L.length){ a[k++]=L[i++]; _frame(a,[],[k-1]); }
    while(j<R.length){ a[k++]=R[j++]; _frame(a,[],[k-1]); }
  }
  function ms(a,l,r){ if(l>=r)return; const m=Math.floor((l+r)/2); ms(a,l,m); ms(a,m+1,r); merge(a,l,m,r); }
  ms(a,0,a.length-1);
  _frame(a,[],[],[...Array(a.length).keys()]);
}

function _recordQuick(a) {
  function part(a,lo,hi){
    const pv=a[hi]; let i=lo-1;
    _frame(a,[],[],[],hi);
    for(let j=lo;j<hi;j++){
      _frame(a,[j,hi],[],[],hi);
      if(a[j]<=pv){ i++; [a[i],a[j]]=[a[j],a[i]]; _frame(a,[],[i,j],[],hi); }
    }
    [a[i+1],a[hi]]=[a[hi],a[i+1]];
    _frame(a,[],[i+1,hi],[],-1);
    return i+1;
  }
  function qs(a,lo,hi){ if(lo<hi){ const p=part(a,lo,hi); qs(a,lo,p-1); qs(a,p+1,hi); } }
  qs(a,0,a.length-1);
  _frame(a,[],[],[...Array(a.length).keys()]);
}

// --- Generate & draw ---------------------------------------------

function generateArray() {
  stopSort();
  const n = parseInt(document.getElementById('sizeSlider').value);
  _sortArr = Array.from({length:n}, () => randInt(4, 98));
  _sortFrames = [];
  _setChips(0,0,'Ready');
  _drawFrame({ arr:_sortArr, cmp:[], swp:[], srt:[], pvt:-1 });
}

function selectSortAlgo(algo) {
  stopSort();
  _sortAlgo = algo;
  ['bubble','insertion','selection','merge','quick'].forEach(a => {
    document.getElementById('pill-'+a).classList.toggle('active', a===algo);
    document.getElementById('cx-'+a).classList.toggle('active', a===algo);
  });
  const names={bubble:'Bubble Sort',insertion:'Insertion Sort',selection:'Selection Sort',merge:'Merge Sort',quick:'Quick Sort'};
  document.getElementById('sortAlgoName').textContent = names[algo];
  generateArray();
}

// --- Playback ----------------------------------------------------

async function startSort() {
  if(_sortRunning) return;
  _sortRunning = true;
  document.getElementById('sortRunBtn').disabled  = true;
  document.getElementById('sortStopBtn').disabled = false;

  // Record frames
  _sortFrames = [];
  const a = [..._sortArr];
  ({bubble:_recordBubble, insertion:_recordInsertion, selection:_recordSelection,
    merge:_recordMerge, quick:_recordQuick})[_sortAlgo](a);

  let cmp=0, swp=0;
  for(let i=0; i<_sortFrames.length; i++){
    if(!_sortRunning) break;
    const f = _sortFrames[i];
    if(f.cmp.length) cmp++;
    if(f.swp.length) swp++;
    _drawFrame(f);
    _setChips(cmp, swp, i===_sortFrames.length-1 ? 'Done ✓' : 'Running…');
    const spd = parseInt(document.getElementById('speedSlider').value);
    await sleep(speedToDelay(spd));
  }

  _sortRunning = false;
  document.getElementById('sortRunBtn').disabled  = false;
  document.getElementById('sortStopBtn').disabled = true;
}

function stopSort() {
  _sortRunning = false;
  document.getElementById('sortRunBtn').disabled  = false;
  document.getElementById('sortStopBtn').disabled = true;
}

function _setChips(cmp, swp, status) {
  document.getElementById('statComparisons').textContent = 'Comparisons: '+cmp;
  document.getElementById('statSwaps').textContent       = 'Swaps: '+swp;
  document.getElementById('sortStatus').textContent      = status;
}

// --- Canvas renderer ---------------------------------------------

function _drawFrame(f) {
  const canvas = document.getElementById('sortCanvas');
  const {w,h}  = cSize(canvas);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);

  const n    = f.arr.length;
  const bw   = (w-2)/n;
  const maxV = Math.max(...f.arr,1);

  f.arr.forEach((v,i) => {
    const bh = Math.max((v/maxV)*(h-4), 2);
    const x  = i*bw+1;
    const y  = h-bh;

    let col = '#2d3f5a';
    if(f.srt.includes(i))   col = '#10b981';
    if(f.pvt===i)           col = '#818cf8';
    if(f.cmp.includes(i))   col = '#f59e0b';
    if(f.swp.includes(i))   col = '#f43f5e';

    ctx.fillStyle = col;
    const r = bw>6 ? 2 : 0;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(bw-1,1), bh, r);
    ctx.fill();

    if(n<=32 && bw>14){
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.font = `${Math.min(9,bw-3)}px IBM Plex Mono`;
      ctx.textAlign='center';
      ctx.fillText(v, x+bw/2-.5, y+12);
    }
  });
}

window.addEventListener('resize', () => {
  const c = document.getElementById('sortCanvas');
  if(c.offsetParent===null) return;
  fitCanvas(c);
  _drawFrame({ arr:_sortArr, cmp:[], swp:[], srt:[], pvt:-1 });
});
