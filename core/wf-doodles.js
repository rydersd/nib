/* wf-doodles.js — procedural margin-doodle vocabulary (24 primitives), a tenant
 * of the shared napkin stroke engine (WFNapkin.gesture/wrap/ink). Drives the
 * doodle lab AND scatters sparse marks on real pages at napkin fidelity.
 * Load AFTER wf-napkin.js. Exposes window.WFDoodles. */
(function () {
  var N = window.WFNapkin;
  if (!N) { if (window.console) console.warn('wf-doodles.js: WFNapkin not loaded first'); return; }
  var gesture = N.gesture, wrap = N.wrap, ink = N.ink, dot = N.dot,
      rnd = N.rnd, ri = N.ri, r1 = N.r1, pick = N.pick, TAU = N.TAU;

  // Doodle pen profile — intentionally tuned lower pool/skip than the canonical
  // card PENS_INK, and drops the ink-frame-only tail/frag/catch fields. gesture()
  // reads only the common fields, so it stays profile-agnostic.
  var DOODLE_PENS = [
  { name:'rotring',   rgb:[22,23,26], w:[0.55,0.8], a:[0.55,0.72], pool:0.6,  poolR:[1.5,2.2], skip:0.18, skipLen:[2,5],  endDot:0.5,  twin:0.05 },
  { name:'muji gel',  rgb:[30,31,38], w:[1.0,1.35], a:[0.42,0.55], pool:0.22, poolR:[1.3,1.8], skip:0.08, skipLen:[2,4],  endDot:0.35, twin:0.05 },
  { name:'ballpoint', rgb:[48,53,74], w:[0.65,0.9], a:[0.30,0.42], pool:0.05, poolR:[1.2,1.5], skip:0.40, skipLen:[4,14], endDot:0.4,  twin:0.30 },
  { name:'marker',    rgb:[32,29,27], w:[1.7,2.4],  a:[0.55,0.68], pool:0.30, poolR:[1.4,1.9], skip:0.04, skipLen:[2,4],  endDot:0.25, twin:0 }
];

  /* ---------- geometry helpers ---------- */
function ringPts(cx,cy,r,over){
  var n=24, start=rnd(0,TAU), sweep=TAU+(over||rnd(0,.5)), pts=[];
  for(var i=0;i<=n;i++){ var t=start+sweep*i/n, rr=r*(1+rnd(-.05,.05)); pts.push([cx+Math.cos(t)*rr, cy+Math.sin(t)*rr*rnd(.95,1)]); }
  return pts;
}
function over(x1,y1,x2,y2,o){ // extend a segment past both ends (hand overshoot)
  var dx=x2-x1,dy=y2-y1,L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L,uy=dy/L, a=rnd(0,o), b=rnd(0,o);
  return [[x1-ux*a,y1-uy*a],[x2+ux*b,y2+uy*b]];
}

/* ---------- primitives: draw centered in BxB, return body string ---------- */
var PRIMS = {
  spiral:function(pen,cx,cy,S){
    var turns=rnd(2.5,4), n=Math.round(turns*22), spin=rnd(0,TAU), R=S*.46, pts=[];
    for(var i=0;i<=n;i++){ var t=i/n; pts.push([cx+Math.cos(t*turns*TAU+spin)*R*t, cy+Math.sin(t*turns*TAU+spin)*R*t]); }
    return gesture(pts,pen);
  },
  bullseye:function(pen,cx,cy,S){
    var n=ri(2,3), out='';
    for(var i=0;i<n;i++) out+=gesture(ringPts(cx,cy,S*.18+S*.16*i),pen,{noEnd:true});
    if(Math.random()<.7) out+=dot(cx,cy,S*.06,pen,rnd(.5,.7));
    return out;
  },
  starburst:function(pen,cx,cy,S){
    var spokes=ri(7,12), out='', a0=rnd(0,TAU), step=TAU/spokes;
    for(var i=0;i<spokes;i++){
      var ang=a0+i*step+rnd(-step*0.45, step*0.45);            // jittered angle, not evenly spaced
      var len=S*rnd(.16,.5);                                    // wider length spread
      var ox=cx+rnd(-S*.035,S*.035), oy=cy+rnd(-S*.035,S*.035); // scattered origins, not one point
      var ex=cx+Math.cos(ang)*len, ey=cy+Math.sin(ang)*len;
      var pts;
      if(Math.random()<0.45){                                  // a human curves some rays
        var bend=rnd(-0.24,0.24);
        pts=[[ox,oy],[(ox+ex)/2 - Math.sin(ang)*len*bend, (oy+ey)/2 + Math.cos(ang)*len*bend],[ex,ey]];
      } else { pts=[[ox,oy],[ex,ey]]; }
      out+=gesture(pts,pen,{poolMul:0,noEnd:true});
      if(Math.random()<0.35) out+=dot(ex,ey, rnd(pen.w[0],pen.w[1])*rnd(1.3,2.4), pen, rnd(.5,.75)); // pen sat at the end and pooled
    }
    return out;
  },
  scribble:function(pen,cx,cy,S){
    var n=110, ax=rnd(2.6,4.2), ay=rnd(3.4,5.5), px=rnd(0,TAU), drift=rnd(-.35,.35), R=S*.32, pts=[];
    for(var i=0;i<=n;i++){ var t=i/n, env=.4+.6*Math.sin(t*Math.PI);
      pts.push([cx+Math.sin(t*ax*TAU+px)*R*env+(t-.5)*S*drift, cy+Math.sin(t*ay*TAU)*R*.7*env]); }
    var out=gesture(pts,pen,{aMul:.85});  // overwork: extra offset passes build the "gone over many times" density
    for(var k=0;k<2;k++) out+=gesture(pts.map(function(p){return [p[0]+rnd(-1.6,1.6),p[1]+rnd(-1.6,1.6)];}),pen,{aMul:.72,noEnd:true,poolMul:0,skipMul:0});
    return out;
  },
  crosshatch:function(pen,cx,cy,S){
    var out='', w=S*.5, h=S*.5, a1=rnd(-.4,.4), a2=a1+rnd(1,1.4), gap=S*.09;
    [[a1,gap],[a2,gap*rnd(1,1.5)]].forEach(function(set){
      var ang=set[0], g=set[1], ux=Math.cos(ang),uy=Math.sin(ang), nx=-uy,ny=ux, n=Math.floor(w/g);
      for(var i=-n;i<=n;i++){ var ox=nx*i*g, oy=ny*i*g, half=Math.sqrt(w*w+h*h)/2*rnd(.3,.5);
        if(Math.abs(i*g)>w/2*1.05) continue;
        out+=gesture([[cx+ox-ux*half,cy+oy-uy*half],[cx+ox+ux*half,cy+oy+uy*half]],pen,{poolMul:.3,noEnd:true}); }
    });
    return out;
  },
  squiggle:function(pen,cx,cy,S){
    var lines=ri(2,4), out='', y=cy-(lines-1)*S*.13/1;
    for(var L=0;L<lines;L++){ var len=S*rnd(.55,.92), x0=cx-len/2, amp=S*rnd(.035,.06), w=rnd(2.2,3.4), n=Math.max(10,len/5), pts=[];
      for(var i=0;i<=n;i++){ var t=i/n; pts.push([x0+len*t, y+L*S*.16+Math.sin(t*w*TAU)*amp]); }
      out+=gesture(pts,pen,{poolMul:.5}); }
    return out;
  },
  box:function(pen,cx,cy,S){
    var w=S*rnd(.5,.66), h=S*rnd(.42,.6), x=cx-w/2, y=cy-h/2, o=S*.07, out='';
    [[x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]].forEach(function(s){ var e=over(s[0],s[1],s[2],s[3],o); out+=gesture(e,pen); });
    if(Math.random()<.35){ var e1=over(x,y,x+w,y+h,o); out+=gesture(e1,pen); var e2=over(x+w,y,x,y+h,o); out+=gesture(e2,pen); } // crossed-out box
    return out;
  },
  triangle:function(pen,cx,cy,S){
    var R=S*.42, a0=-Math.PI/2+rnd(-.2,.2), p=[], o=S*.08, out='';
    for(var i=0;i<3;i++){ var ang=a0+i*TAU/3; p.push([cx+Math.cos(ang)*R, cy+Math.sin(ang)*R]); }
    for(var i=0;i<3;i++){ var s=p[i], e=p[(i+1)%3], ext=over(s[0],s[1],e[0],e[1],o); out+=gesture(ext,pen); }
    return out;
  },
  arrow:function(pen,cx,cy,S){
    var ang=rnd(-.5,.5)+ (Math.random()<.5?0:Math.PI), len=S*rnd(.55,.8), bend=rnd(-.25,.25);
    var ax=cx-Math.cos(ang)*len/2, ay=cy-Math.sin(ang)*len/2, bx=cx+Math.cos(ang)*len/2, by=cy+Math.sin(ang)*len/2;
    var mx=(ax+bx)/2 - Math.sin(ang)*len*bend, my=(ay+by)/2 + Math.cos(ang)*len*bend;
    var out=gesture([[ax,ay],[mx,my],[bx,by]],pen);
    var hl=S*.16, ha=Math.atan2(by-my,bx-mx);
    out+=gesture([[bx,by],[bx-Math.cos(ha-.4)*hl, by-Math.sin(ha-.4)*hl]],pen,{poolMul:0,noEnd:true});
    out+=gesture([[bx,by],[bx-Math.cos(ha+.4)*hl, by-Math.sin(ha+.4)*hl]],pen,{poolMul:0,noEnd:true});
    return out;
  },
  dotted:function(pen,cx,cy,S){
    var len=S*rnd(.6,.85), ang=rnd(-.6,.6), bend=rnd(-.3,.3), n=ri(7,12), out='';
    var ax=cx-Math.cos(ang)*len/2, ay=cy-Math.sin(ang)*len/2, bx=cx+Math.cos(ang)*len/2, by=cy+Math.sin(ang)*len/2;
    var mx=(ax+bx)/2 - Math.sin(ang)*len*bend, my=(ay+by)/2 + Math.cos(ang)*len*bend;
    for(var i=0;i<=n;i++){ var t=i/n, x=(1-t)*(1-t)*ax+2*(1-t)*t*mx+t*t*bx, y=(1-t)*(1-t)*ay+2*(1-t)*t*my+t*t*by;
      out+=dot(x+rnd(-1,1),y+rnd(-1,1),rnd(pen.w[0],pen.w[1])*rnd(.8,1.3),pen,rnd(.4,.6)); }
    return out;
  },
  checkbox:function(pen,cx,cy,S){
    var w=S*.34, x=cx-w/2, y=cy-w/2, o=S*.05, out='';
    [[x,y,x+w,y],[x+w,y,x+w,y+w],[x+w,y+w,x,y+w],[x,y+w,x,y]].forEach(function(s){ out+=gesture(over(s[0],s[1],s[2],s[3],o),pen,{noEnd:true}); });
    if(Math.random()<.6) out+=gesture([[x+w*.2,y+w*.55],[x+w*.45,y+w*.82],[x+w*1.05,y+w*.1]],pen,{poolMul:.4}); // tick, often overshoots box
    return out;
  },
  emphasis:function(pen,cx,cy,S){
    var len=S*rnd(.4,.7), out=gesture([[cx-len/2,cy],[cx+len/2,cy]],pen,{poolMul:.5});
    if(Math.random()<.5) out+=gesture([[cx-len/2,cy+S*.07],[cx+len/2*rnd(.6,1),cy+S*.07]],pen,{noEnd:true}); // 2nd underline
    return out;
  },
  brace:function(pen,cx,cy,S){  // curly annotation brace
    var h=S*.72, y0=cy-h/2, x=cx, b=S*.13;
    return gesture([[x+b,y0],[x,y0+h*.16],[x,y0+h*.4],[x-b,cy],[x,y0+h*.6],[x,y0+h*.84],[x+b,y0+h]],pen);
  },
  ticTacToe:function(pen,cx,cy,S){  // # grid + a partial game of X's and O's
    var G=S*.62, x0=cx-G/2, y0=cy-G/2, st=G/3, o=S*.06, out='';
    out+=gesture(over(x0+st,y0,x0+st,y0+G,o),pen,{noEnd:true})+gesture(over(x0+2*st,y0,x0+2*st,y0+G,o),pen,{noEnd:true});
    out+=gesture(over(x0,y0+st,x0+G,y0+st,o),pen,{noEnd:true})+gesture(over(x0,y0+2*st,x0+G,y0+2*st,o),pen,{noEnd:true});
    var cells=[]; for(var r=0;r<3;r++)for(var c=0;c<3;c++)cells.push([r,c]);
    cells.sort(function(){return Math.random()-.5;});
    var nMarks=ri(2,5);
    for(var i=0;i<nMarks;i++){ var mc=x0+(cells[i][1]+.5)*st, mr=y0+(cells[i][0]+.5)*st, m=st*.28;
      if(i%2===0) out+=gesture([[mc-m,mr-m],[mc+m,mr+m]],pen,{poolMul:0,noEnd:true})+gesture([[mc+m,mr-m],[mc-m,mr+m]],pen,{poolMul:0,noEnd:true});
      else out+=gesture(ringPts(mc,mr,m),pen,{noEnd:true}); }
    return out;
  },
  grid:function(pen,cx,cy,S){  // arbitrary cell grid, a couple cells hatched in
    var cols=ri(2,4), rows=ri(2,4), W=S*.66, H=S*.6, x0=cx-W/2, y0=cy-H/2, o=S*.05, out='', cw=W/cols, ch=H/rows;
    [[x0,y0,x0+W,y0],[x0+W,y0,x0+W,y0+H],[x0+W,y0+H,x0,y0+H],[x0,y0+H,x0,y0]].forEach(function(s){out+=gesture(over(s[0],s[1],s[2],s[3],o),pen,{noEnd:true});});
    for(var c=1;c<cols;c++){ var gx=x0+cw*c; out+=gesture(over(gx,y0,gx,y0+H,o*.6),pen,{noEnd:true}); }
    for(var r=1;r<rows;r++){ var gy=y0+ch*r; out+=gesture(over(x0,gy,x0+W,gy,o*.6),pen,{noEnd:true}); }
    var nFill=ri(1,2);
    for(var f=0;f<nFill;f++){ var fx=x0+ri(0,cols-1)*cw, fy=y0+ri(0,rows-1)*ch;
      for(var li=1;li<5;li++){ var t=li/5;
        out+=gesture([[fx,fy+ch*t],[fx+cw*t,fy]],pen,{poolMul:0,noEnd:true,aMul:.7})+gesture([[fx+cw*t,fy+ch],[fx+cw,fy+ch*t]],pen,{poolMul:0,noEnd:true,aMul:.7}); } }
    return out;
  },
  nodeNetwork:function(pen,cx,cy,S){  // graph — nodes + edges (Equinix interconnection)
    var n=ri(4,6), R=S*.42, nodes=[], out='', tries=0;
    while(nodes.length<n && tries<60){ tries++; var ang=rnd(0,TAU), rr=rnd(.2,1)*R, x=cx+Math.cos(ang)*rr, y=cy+Math.sin(ang)*rr, ok=true;
      for(var i=0;i<nodes.length;i++){ if(Math.hypot(nodes[i][0]-x,nodes[i][1]-y)<S*.2){ok=false;break;} }
      if(ok) nodes.push([x,y]); }
    for(var i=0;i<nodes.length;i++){
      var d=nodes.map(function(nd,j){return [Math.hypot(nd[0]-nodes[i][0],nd[1]-nodes[i][1]),j];}).filter(function(z){return z[1]!==i;}).sort(function(a,b){return a[0]-b[0];});
      var k=ri(1,2); for(var e=0;e<k && e<d.length;e++){ var j=d[e][1]; if(j>i) out+=gesture([[nodes[i][0],nodes[i][1]],[nodes[j][0],nodes[j][1]]],pen,{poolMul:0,noEnd:true,aMul:.85}); } }
    for(var i=0;i<nodes.length;i++){ var nr=S*.05; out+=gesture(ringPts(nodes[i][0],nodes[i][1],nr),pen,{noEnd:true}); if(Math.random()<.4) out+=dot(nodes[i][0],nodes[i][1],nr*.6,pen,.6); }
    return out;
  },
  cube:function(pen,cx,cy,S){  // isometric box
    var w=S*.4, dx=S*.2, dy=-S*.2, x=cx-w/2-dx/2, y=cy-w/2-dy/2, o=S*.05, out='';
    var fr=[[x,y],[x+w,y],[x+w,y+w],[x,y+w]], bk=fr.map(function(p){return [p[0]+dx,p[1]+dy];});
    for(var i=0;i<4;i++){ var s=fr[i],ee=fr[(i+1)%4]; out+=gesture(over(s[0],s[1],ee[0],ee[1],o),pen,{noEnd:true}); }
    out+=gesture(over(bk[0][0],bk[0][1],bk[1][0],bk[1][1],o),pen,{noEnd:true})+gesture(over(bk[1][0],bk[1][1],bk[2][0],bk[2][1],o),pen,{noEnd:true});
    [0,1,2].forEach(function(i){ out+=gesture([[fr[i][0],fr[i][1]],[bk[i][0],bk[i][1]]],pen,{poolMul:0,noEnd:true}); });
    return out;
  },
  flow:function(pen,cx,cy,S){  // 2-3 boxes wired with arrows — mini wireframe flow
    var n=ri(2,3), bw=S*.26, bh=S*.2, gap=S*.16, total=n*bw+(n-1)*gap, x=cx-total/2, o=S*.04, out='', prev=null;
    for(var i=0;i<n;i++){ var bx=x+i*(bw+gap), by=cy-bh/2;
      [[bx,by,bx+bw,by],[bx+bw,by,bx+bw,by+bh],[bx+bw,by+bh,bx,by+bh],[bx,by+bh,bx,by]].forEach(function(s){out+=gesture(over(s[0],s[1],s[2],s[3],o),pen,{noEnd:true});});
      if(prev!==null){ out+=gesture([[prev,cy],[bx,cy]],pen,{poolMul:0,noEnd:true});
        out+=gesture([[bx,cy],[bx-S*.05,cy-S*.04]],pen,{poolMul:0,noEnd:true})+gesture([[bx,cy],[bx-S*.05,cy+S*.04]],pen,{poolMul:0,noEnd:true}); }
      prev=bx+bw; }
    return out;
  },
  loopCluster:function(pen,cx,cy,S){  // run of cursive loops / spring line
    var loops=ri(3,5), len=S*.7, x0=cx-len/2, r=S*.13, n=loops*16, pts=[];
    for(var i=0;i<=n;i++){ var t=i/n, ph=t*loops*TAU; pts.push([x0+len*t+Math.cos(ph)*r*.4, cy+Math.sin(ph)*r]); }
    return gesture(pts,pen);
  },
  crossDots:function(pen,cx,cy,S){  // scatter of tiny crosses + dots
    var n=ri(6,10), out='', R=S*.4;
    for(var i=0;i<n;i++){ var x=cx+rnd(-R,R), y=cy+rnd(-R,R);
      if(Math.random()<.5){ var m=S*rnd(.04,.07); out+=gesture([[x-m,y],[x+m,y]],pen,{poolMul:0,noEnd:true})+gesture([[x,y-m],[x,y+m]],pen,{poolMul:0,noEnd:true}); }
      else out+=dot(x,y,rnd(pen.w[0],pen.w[1])*rnd(.9,1.5),pen,rnd(.45,.65)); }
    return out;
  },
  tally:function(pen,cx,cy,S){  // long strokes crossed by perpendicular ticks (ref-tally-crossbars)
    var n=ri(1,3), out='', ang=Math.PI/2+rnd(-.3,.3);  // near-vertical
    for(var s=0;s<n;s++){ var ox=(s-(n-1)/2)*S*.16+rnd(-3,3), len=S*rnd(.6,.9);
      var x1=cx+ox-Math.cos(ang)*len/2, y1=cy-Math.sin(ang)*len/2, x2=cx+ox+Math.cos(ang)*len/2, y2=cy+Math.sin(ang)*len/2;
      out+=gesture([[x1,y1],[x2,y2]],pen,{wMul:.8});
      var ticks=ri(1,3), px=Math.cos(ang+Math.PI/2), py=Math.sin(ang+Math.PI/2);
      for(var t=0;t<ticks;t++){ var tt=rnd(.2,.8), mx=x1+(x2-x1)*tt, my=y1+(y2-y1)*tt, tl=S*rnd(.08,.16);
        out+=gesture([[mx-px*tl,my-py*tl],[mx+px*tl*rnd(.6,1.2),my+py*tl*rnd(.6,1.2)]],pen,{poolMul:0,noEnd:true}); } }
    return out;
  },
  penTest:function(pen,cx,cy,S){  // elongated directional zigzag scribble (ref-pen-test-scribbles)
    var ang=rnd(0,Math.PI), len=S*rnd(.42,.72), amp=S*rnd(.05,.11), n=ri(10,18), pts=[];
    var ux=Math.cos(ang), uy=Math.sin(ang), nx=-uy, ny=ux;
    for(var i=0;i<=n;i++){ var t=i/n, along=(t-.5)*len, side=(i%2?1:-1)*amp*rnd(.7,1); pts.push([cx+ux*along+nx*side, cy+uy*along+ny*side]); }
    var out=gesture(pts,pen,{aMul:.85});
    if(Math.random()<.5) out+=gesture(pts.map(function(p){return [p[0]+rnd(-1.2,1.2),p[1]+rnd(-1.2,1.2)];}),pen,{aMul:.7,noEnd:true,poolMul:0,skipMul:0});
    return out;
  },
  burst:function(pen,cx,cy,S){  // dense knot + radiating whippy tendrils (ref-burst-knot-tendrils)
    var out='', kn=24, kr=S*.08, kpts=[];
    for(var i=0;i<=kn;i++){ var a=rnd(0,TAU), r=rnd(0,kr); kpts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); }
    out+=gesture(kpts,pen,{aMul:.9,skipMul:0});
    var k=ri(5,9);
    for(var t=0;t<k;t++){ var a2=rnd(0,TAU), len=S*rnd(.26,.48), bend=rnd(-.4,.4), ex=cx+Math.cos(a2)*len, ey=cy+Math.sin(a2)*len;
      var mx=(cx+ex)/2-Math.sin(a2)*len*bend, my=(cy+ey)/2+Math.cos(a2)*len*bend;
      out+=gesture([[cx,cy],[mx,my],[ex,ey]],pen,{poolMul:0,noEnd:Math.random()<.6,wMul:.65,aMul:.8}); }
    return out;
  },
  sprig:function(pen,cx,cy,S){  // curved stem + wispy flower-head burst (ref-wildflower-stems / sprig-grass)
    var h=S*rnd(.7,.9), baseX=cx+rnd(-S*.1,S*.1), baseY=cy+h/2, topX=cx+rnd(-S*.15,S*.15), topY=cy-h/2, bend=rnd(-.25,.25);
    var mx=(baseX+topX)/2+S*bend, my=(baseY+topY)/2, out=gesture([[baseX,baseY],[mx,my],[topX,topY]],pen,{wMul:.65,aMul:.8});
    var petals=ri(5,9);
    for(var p=0;p<petals;p++){ var a=-Math.PI/2+rnd(-1.1,1.1), pl=S*rnd(.08,.18); out+=gesture([[topX,topY],[topX+Math.cos(a)*pl,topY+Math.sin(a)*pl]],pen,{poolMul:0,noEnd:true,wMul:.55,aMul:.75}); }
    if(Math.random()<.5){ var lt=rnd(.3,.6), lx=baseX+(topX-baseX)*lt, ly=baseY+(topY-baseY)*lt, side=Math.random()<.5?1:-1; out+=gesture([[lx,ly],[lx+side*S*.12,ly-S*.06]],pen,{poolMul:0,noEnd:true,wMul:.55}); }
    return out;
  }
};
var ORDER = ['spiral','bullseye','starburst','scribble','crosshatch','squiggle','box','triangle','arrow','dotted','checkbox','emphasis','brace','ticTacToe','grid','nodeNetwork','cube','flow','loopCluster','crossDots','tally','penTest','burst','sprig'];

/* ---------- render ---------- */
// faint ballpoint disappears at small sizes — bias small marks to darker pens
function penFor(S){ return (S<64 && Math.random()<.65) ? pick([DOODLE_PENS[0],DOODLE_PENS[1],DOODLE_PENS[3]]) : pick(DOODLE_PENS); }
function cellSVG(kind, B){
  var pen=penFor(B), body=PRIMS[kind](pen, B/2, B/2, B*0.9);
  return { svg:wrap(B,B,body,{w:B,h:B}), pen:pen.name };
}
function renderCatalog(){
  var host=document.getElementById('catalog'), B=128, html='';
  ORDER.forEach(function(kind){
    var c=cellSVG(kind,B);
    html+='<div class="cell">'+c.svg+'<div class="lbl">'+kind+'</div><div class="pen">'+c.pen+'</div></div>';
  });
  host.innerHTML=html;
}
function renderSheet(){
  var W=760, H=560, body='', placed=[], tries=0, target=ri(5,8);
  while(placed.length<target && tries<200){
    tries++;
    var S=rnd(46,92), x=rnd(S, W-S), y=rnd(S, H-S), ok=true;
    for(var i=0;i<placed.length;i++){ var p=placed[i]; if(Math.hypot(p[0]-x,p[1]-y) < (p[2]+S)*0.62){ ok=false; break; } }
    if(!ok) continue;
    placed.push([x,y,S]);
    var pen=penFor(S);
    body+='<g transform="rotate('+r1(rnd(-18,18))+' '+r1(x)+' '+r1(y)+')">'+PRIMS[pick(ORDER)](pen,x,y,S)+'</g>';
  }
  document.getElementById('sheetHost').innerHTML=
    wrap(W,H,body,{w:'100%',scale:1.6,freq:'0.016 0.022'}).replace('<svg ','<svg class="sheet" preserveAspectRatio="xMidYMid meet" ');
}
function renderAll(){ renderCatalog(); renderSheet(); }

  // ── on-page sparse placement — a few faint margin doodles, biased to the
  //    side gutters so they don't bury content. Called from WFNapkin's gated
  //    asset pass at napkin fidelity only; self-guards against double-run. ──
  function scatterDoodles(opts) {
    opts = opts || {};
    if (document.documentElement.getAttribute('data-wf-fidelity') !== 'napkin') return;
    if (document.querySelector('.wf-doodle-layer')) return;
    var docH = Math.max(document.body.offsetHeight, window.innerHeight);
    var bodyW = document.body.clientWidth || window.innerWidth;
    var layer = document.createElement('div');
    layer.className = 'wf-doodle-layer';
    layer.setAttribute('aria-hidden', 'true');
    // z-index:-1 — doodles sit ON THE BOARD, behind the page content (which is at
    // the default z:auto), peeking through gutters/margins like the coffee/tea
    // stains. (Was 50, which rendered them on top of the content.)
    layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:' + docH +
      'px;pointer-events:none;overflow:hidden;z-index:-1;';
    // Count: 0 to n — often a couple, rarely none, occasionally a flurry.
    var count = opts.count != null ? opts.count : (Math.random() < 0.10 ? 0 : ri(1, 8));
    // Sometimes the doodles CLUSTER — a person sitting on one side of the board,
    // doodling in one spot while others talk — rather than scattered around it.
    var clustered = count > 2 && Math.random() < 0.5, ccx, ccy, sx, sy;
    if (clustered) {
      ccx = (Math.random() < 0.5 ? rnd(0.04, 0.24) : rnd(0.76, 0.96)) * bodyW; // one side
      ccy = rnd(0.08, 0.92) * docH;
      sx = bodyW * rnd(0.07, 0.15); sy = docH * rnd(0.04, 0.11);
    }
    for (var i = 0; i < count; i++) {
      var S = rnd(54, 104), kind = pick(ORDER), pen = penFor(S);
      var svg = wrap(S, S, PRIMS[kind](pen, S / 2, S / 2, S * 0.9), { w: S, h: S });
      var x, y;
      if (clustered) { x = ccx + rnd(-sx, sx) - S / 2; y = ccy + rnd(-sy, sy) - S / 2; }
      else {
        // bias to the left/right margins (off to the sides), occasionally central
        var zr = Math.random();
        if (zr < 0.42) x = rnd(-S * 0.35, bodyW * 0.18);
        else if (zr < 0.84) x = rnd(bodyW * 0.82 - S, bodyW - S * 0.55);
        else x = rnd(bodyW * 0.18, Math.max(bodyW * 0.18, bodyW * 0.82 - S));
        y = rnd(-S * 0.3, Math.max(S, docH - S * 0.5));
      }
      x = Math.max(-S * 0.3, Math.min(x, bodyW - S * 0.6));
      y = Math.max(0, Math.min(y, docH - S * 0.6));
      var d = document.createElement('div');
      d.className = 'wf-doodle';
      d.style.cssText = 'position:absolute;left:' + Math.round(x) + 'px;top:' + Math.round(y) +
        'px;width:' + Math.round(S) + 'px;height:' + Math.round(S) +
        'px;opacity:' + (0.5 + Math.random() * 0.3).toFixed(2) +
        ';transform:rotate(' + Math.floor(rnd(-20, 20)) + 'deg);';
      d.innerHTML = svg;
      layer.appendChild(d);
    }
    document.body.appendChild(layer);
  }

  window.WFDoodles = {
    DOODLE_PENS: DOODLE_PENS, PRIMS: PRIMS, ORDER: ORDER, penFor: penFor,
    cellSVG: cellSVG, renderCatalog: renderCatalog, renderSheet: renderSheet,
    renderAll: renderAll, scatterDoodles: scatterDoodles, scatterPage: scatterDoodles
  };

  // If the napkin asset pass already ran before this tenant finished loading
  // (common when this script is injected async after window 'load'), scatter
  // now — scatterPage self-guards against a double .wf-doodle-layer.
  if (document.documentElement.classList.contains('wf-napkin-ready')) { try { scatterDoodles(); } catch (e) {} }
})();
