(() => {
  const dlg=document.getElementById('dlg');
  const root=document.getElementById('tours');
  if(!dlg || !root) return;
  let packages=[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rupiah=v=>'Rp '+Number(v).toLocaleString('id-ID');
  const notify=m=>{const t=document.getElementById('toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}else alert(m)};
  async function api(data=null) {
    const opt=data?{method:'POST',body:data,credentials:'same-origin'}:{credentials:'same-origin'};
    const res=await fetch('package_api.php',opt);
    const json=await res.json();
    if(!res.ok || !json.ok) throw new Error(json.message||'Permintaan gagal.');
    return json;
  }
  function render(){
    root.innerHTML=packages.length?packages.map(p=>`<div class="car">
      <header><b>${esc(p.package_name)}</b><span class="badge ${p.package_status==='active'?'done':'pending'}">${p.package_status==='active'?'Aktif':'Nonaktif'}</span></header>
      <p>${esc(p.description||'Belum ada deskripsi')} · ${Number(p.duration_days)} hari · Min. ${Number(p.min_participants)} peserta</p>
      <p class="pr">${rupiah(p.price_per_person)} / orang</p>
      <footer><button class="btn ic" data-a="edit" data-e="tours" data-id="${p.package_id}">edit</button>
      <button class="btn ic no" data-a="del" data-e="tours" data-id="${p.package_id}">delete</button></footer>
    </div>`).join(''):'<p class="empty">Belum ada paket wisata. Klik Tambah Paket untuk membuat data pertama.</p>';
  }
  async function load(){try{packages=(await api()).data||[];render()}catch(e){root.innerHTML='<p class="empty">Gagal memuat paket wisata: '+esc(e.message)+'</p>'}}
  function openForm(id=null){
    const p=id?packages.find(x=>Number(x.package_id)===Number(id)):null;
    dlg.innerHTML=`<form id="mvPackageForm"><h2>${p?'Edit':'Tambah'} Paket Wisata</h2>
      <label class="fld">Nama Paket<input class="in" name="package_name" required maxlength="150" value="${esc(p?.package_name||'')}"><em></em></label>
      <label class="fld">Deskripsi<textarea class="in" name="description" rows="3">${esc(p?.description||'')}</textarea><em></em></label>
      <label class="fld">Durasi (hari)<input class="in" type="number" min="1" max="255" name="duration_days" required value="${p?.duration_days||1}"><em></em></label>
      <label class="fld">Harga per orang (Rp)<input class="in" type="number" min="1" step="1000" name="price_per_person" required value="${p?.price_per_person||''}"><em></em></label>
      <label class="fld">Minimal peserta<input class="in" type="number" min="1" name="min_participants" required value="${p?.min_participants||1}"><em></em></label>
      <label class="fld">Maksimal peserta (opsional)<input class="in" type="number" min="1" name="max_participants" value="${p?.max_participants??''}"><em></em></label>
      <label class="fld">Status<select class="in" name="package_status"><option value="active" ${p?.package_status!=='inactive'?'selected':''}>Aktif</option><option value="inactive" ${p?.package_status==='inactive'?'selected':''}>Nonaktif</option></select><em></em></label>
      <div class="mf"><button type="button" class="btn" data-mv-close>Batal</button><button class="btn ok" type="submit">Simpan</button></div>
      <input type="hidden" name="package_id" value="${p?.package_id||''}">
    </form>`;
    dlg.showModal();
  }
  // Intersepsi khusus paket wisata; CRUD paket diproses ke MySQL, bukan localStorage.
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-a]');
    if(!b || b.dataset.e!=='tours') return;
    e.preventDefault();e.stopImmediatePropagation();
    const a=b.dataset.a,id=b.dataset.id;
    if(a==='add'){openForm();return}
    if(a==='edit'){openForm(id);return}
    if(a==='del'){
      const p=packages.find(x=>Number(x.package_id)===Number(id));
      if(!p || !confirm(`Hapus paket "${p.package_name}"?`)) return;
      const fd=new FormData();fd.set('action','delete');fd.set('package_id',id);
      try{const r=await api(fd);notify(r.message);await load()}catch(err){notify(err.message)}
    }
  },true);
  dlg.addEventListener('click',e=>{if(e.target.closest('[data-mv-close]'))dlg.close()},true);
  dlg.addEventListener('submit',async e=>{
    if(e.target.id!=='mvPackageForm') return;
    e.preventDefault();e.stopImmediatePropagation();
    const fd=new FormData(e.target);fd.set('action',fd.get('package_id')?'update':'create');
    try{const r=await api(fd);dlg.close();notify(r.message);await load()}catch(err){notify(err.message)}
  },true);
  load();
})();
