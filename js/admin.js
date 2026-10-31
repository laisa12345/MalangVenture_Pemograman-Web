const rp=n=>'Rp '+Number(n).toLocaleString('id-ID');
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fd=d=>new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
const label={pending:'Menunggu',approved:'Disetujui',done:'Selesai',cancel:'Dibatalkan'};

/* ===== Data + penyimpanan (localStorage) ===== */
const KEY='mv_admin_v1';
const seed=()=>({
 orders:[
  {id:1,code:'MV-2025-0091',n:'Dimas Prasetyo',s:'Bromo Midnight Sunrise (Jeep)',d:'2025-05-24',t:1420000,st:'pending'},
  {id:2,code:'MV-2025-0088',n:'Rina Kusuma',s:'Rental Innova Reborn + Driver',d:'2025-05-26',t:800000,st:'pending'},
  {id:3,code:'MV-2025-0042',n:'Dimas Prasetyo',s:'Rental All New Avanza + Driver',d:'2025-04-18',t:1500000,st:'approved'},
  {id:4,code:'MV-2025-0030',n:'Budi Santoso',s:'Explore Tumpak Sewu & Goa Tetes',d:'2025-03-01',t:900000,st:'done'},
  {id:5,code:'MV-2025-0018',n:'Dimas Prasetyo',s:'Family Trip Batu (Jatim Park 2)',d:'2025-02-10',t:1100000,st:'done'},
  {id:6,code:'MV-2025-0015',n:'Sari Wulandari',s:'Rental HiAce Commuter',d:'2025-02-08',t:1100000,st:'cancel'}],
 fleet:[
  {id:1,name:'Toyota All New Avanza',type:'MPV · 7 kursi',price:350000,ok:1},
  {id:2,name:'Toyota Innova Reborn',type:'MPV Premium · 7 kursi',price:650000,ok:1},
  {id:3,name:'Toyota HiAce Commuter',type:'Minibus · 14 kursi',price:1100000,ok:0},
  {id:4,name:'HiAce Premio VIP',type:'Executive · 8 captain',price:1600000,ok:1},
  {id:5,name:'Pajero Sport Dakar',type:'SUV · 7 kursi',price:950000,ok:0},
  {id:6,name:'Daihatsu Grand Xenia',type:'MPV Hemat · 7 kursi',price:300000,ok:1}],
 tours:[
  {id:1,name:'Bromo Midnight Sunrise Adventure',loc:'Bromo Tengger Semeru',dur:'12 Jam (Midnight)',price:350000,ok:1},
  {id:2,name:'Explore Tumpak Sewu & Goa Tetes',loc:'Pronojiwo, Lumajang',dur:'1 Hari Penuh',price:450000,ok:1},
  {id:3,name:'Family Trip Kota Batu',loc:'Kota Wisata Batu',dur:'10 Jam Fleksibel',price:275000,ok:1}]
});
let db;try{db=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!db||!db.orders)db=seed();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}};

/* Skema form: [key, label, tipe, opsi] */
const schema={
 orders:{title:'Pesanan',nm:o=>'#'+o.code,f:[['n','Nama Pelanggan','text'],['s','Layanan','text'],['d','Tanggal','date'],['t','Total (Rp)','number'],['st','Status','select',label]]},
 fleet:{title:'Armada',nm:o=>o.name,f:[['name','Nama Kendaraan','text'],['type','Tipe / Kapasitas','text'],['price','Tarif per Hari (Rp)','number'],['ok','Status','select',{1:'Tersedia',0:'Disewa'}]]},
 tours:{title:'Paket Wisata',nm:o=>o.name,f:[['name','Nama Paket','text'],['loc','Lokasi','text'],['dur','Durasi','text'],['price','Harga per Pax (Rp)','number'],['ok','Status','select',{1:'Aktif',0:'Nonaktif'}]]}
};

/* ===== Render (Read) ===== */
const ib=(a,e,id,ic,t,c='')=>`<button class="btn ic ${c}" data-a="${a}" data-e="${e}" data-id="${id}" title="${t}" aria-label="${t}"><span class="i">${ic}</span></button>`;
function stats(){
 const o=db.orders;
 $('sTotal').textContent=o.length;
 $('sPend').textContent=o.filter(x=>x.st==='pending').length;
 $('sRev').textContent=rp(o.filter(x=>x.st==='approved'||x.st==='done').reduce((a,x)=>a+x.t,0));
 $('sFleet').textContent=db.fleet.filter(x=>x.ok).length+' / '+db.fleet.length;
}
function renderOrders(){
 const q=$('q').value.toLowerCase(),f=$('f').value;
 const list=db.orders.filter(o=>(!f||o.st===f)&&(o.code+o.n+o.s).toLowerCase().includes(q));
 $('tb').innerHTML=list.length?list.map(o=>`<tr>
  <td data-l="Kode"><b>#${esc(o.code)}</b></td>
  <td data-l="Pelanggan">${esc(o.n)}</td>
  <td data-l="Layanan">${esc(o.s)}</td>
  <td data-l="Tanggal">${fd(o.d)}</td>
  <td data-l="Total">${rp(o.t)}</td>
  <td data-l="Status"><span class="badge ${o.st}">${label[o.st]}</span></td>
  <td data-l="Aksi"><div class="act">
   ${o.st==='pending'?`<button class="btn ok" data-a="approved" data-id="${o.id}">Setujui</button><button class="btn no" data-a="cancel" data-id="${o.id}">Tolak</button>`:o.st==='approved'?`<button class="btn" data-a="done" data-id="${o.id}">Selesai</button>`:''}
   ${ib('edit','orders',o.id,'edit','Edit')}${ib('del','orders',o.id,'delete','Hapus','no')}
  </div></td></tr>`).join(''):'<tr><td class="empty" colspan="7">Tidak ada pesanan ditemukan.</td></tr>';
}
function cards(e,sub,price,on,off){
 $(e).innerHTML=db[e].length?db[e].map(x=>`<div class="car"><header><b>${esc(x.name)}</b><span class="badge ${x.ok?'done':'pending'}">${x.ok?on:off}</span></header>
  <p>${esc(sub(x))}</p><p class="pr">${price(x)}</p>
  <footer>${ib('edit',e,x.id,'edit','Edit')}${ib('del',e,x.id,'delete','Hapus','no')}</footer></div>`).join(''):'<p class="empty">Belum ada data.</p>';
}
function renderAll(){
 stats();renderOrders();
 cards('fleet',x=>x.type,x=>rp(x.price)+' / hari','Tersedia','Disewa');
 cards('tours',x=>x.loc+' · '+x.dur,x=>rp(x.price)+' / pax','Aktif','Nonaktif');
}

/* ===== Create / Update (modal form) ===== */
const dlg=$('dlg');let cur={};
function field([k,l,t,o],v){
 const inp=t==='select'?`<select class="in" name="${k}">${Object.entries(o).map(([a,b])=>`<option value="${a}"${String(v)===a?' selected':''}>${b}</option>`).join('')}</select>`
  :`<input class="in" name="${k}" type="${t}" value="${esc(v??'')}"${t==='number'?' min="1"':''}>`;
 return `<label class="fld">${l}${inp}<em></em></label>`;
}
function openForm(e,id){
 const sc=schema[e],item=id?db[e].find(x=>x.id===id):{ok:1,st:'pending',d:new Date().toISOString().slice(0,10)};
 cur={e,id};
 dlg.innerHTML=`<form id="fm" novalidate><h2>${id?'Edit':'Tambah'} ${sc.title}</h2>${sc.f.map(f=>field(f,item[f[0]])).join('')}
  <div class="mf"><button type="button" class="btn" data-a="close">Batal</button><button class="btn ok">Simpan</button></div></form>`;
 dlg.showModal();
}
function save1(fm){
 const sc=schema[cur.e],data={};let bad=false;
 sc.f.forEach(([k,l,t])=>{
  const el=fm.elements[k],v=el.value.trim(),p=el.closest('.fld');let err='';
  if(!v)err='Wajib diisi';else if(t==='number'&&!(+v>0))err='Harus lebih dari 0';
  p.classList.toggle('bad',!!err);p.querySelector('em').textContent=err;if(err)bad=true;
  data[k]=(t==='number'||k==='ok')?+v:v;
 });
 if(bad)return;
 if(cur.id)Object.assign(db[cur.e].find(x=>x.id===cur.id),data);
 else{const n={id:Date.now(),...data};if(cur.e==='orders')n.code=new Date().getFullYear()+'-'+String(n.id).slice(-4);db[cur.e].push(n)}
 save();dlg.close();renderAll();toast(cur.id?'Data berhasil diperbarui':'Data berhasil ditambahkan');
}

/* ===== Delete (konfirmasi) ===== */
function openDel(e,id){
 const x=db[e].find(i=>i.id===id);cur={e,id};
 dlg.innerHTML=`<form id="cf"><h2>Hapus ${schema[e].title}?</h2><p>${esc(schema[e].nm(x))} akan dihapus permanen.</p>
  <div class="mf"><button type="button" class="btn" data-a="close">Batal</button><button class="btn no">Ya, Hapus</button></div></form>`;
 dlg.showModal();
}
dlg.addEventListener('submit',ev=>{
 ev.preventDefault();
 if(ev.target.id==='cf'){db[cur.e]=db[cur.e].filter(i=>i.id!==cur.id);save();dlg.close();renderAll();toast('Data berhasil dihapus')}
 else save1(ev.target);
});

/* ===== Event handler ===== */
document.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-a]');if(!b)return;
 const a=b.dataset.a,id=+b.dataset.id,e=b.dataset.e;
 if(a==='add')openForm(e);
 else if(a==='edit')openForm(e,id);
 else if(a==='del')openDel(e,id);
 else if(a==='close')dlg.close();
 else if(label[a]){const o=db.orders.find(x=>x.id===id);o.st=a;save();renderAll();toast(`Pesanan #${o.code} → ${label[a]}`)}
});
$('q').oninput=renderOrders;$('f').onchange=renderOrders;
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2200)}

/* ===== Grafik, tanggal, sidebar ===== */
const rev=[['Apr',42],['Mei',55],['Jun',48],['Jul',70],['Agu',64],['Sep',82],['Okt',91]];
$('bars').innerHTML=rev.map(r=>`<div><span>${r[1]}</span><i style="height:${r[1]}%"></i>${r[0]}</div>`).join('');
$('date').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const side=$('side'),scrim=$('scrim');
const toggle=o=>{side.classList.toggle('open',o);scrim.classList.toggle('open',o)};
$('burger').onclick=()=>toggle(true);scrim.onclick=()=>toggle(false);
document.querySelectorAll('.side a').forEach(a=>a.addEventListener('click',()=>{
 toggle(false);document.querySelectorAll('.side a').forEach(x=>x.classList.remove('on'));if(!a.classList.contains('out'))a.classList.add('on');
}));
renderAll();
