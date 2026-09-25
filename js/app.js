"use strict";

let sedangMemuat = false;
let sudahLoadPertama = false;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style:"currency", currency:"IDR", minimumFractionDigits:0, maximumFractionDigits:0
});

function formatRupiah(v){ return rupiahFormatter.format(Number(v)||0); }

function escapeHtml(v){
  return String(v == null ? "" : v)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function formatTanggal(v){
  if(!v) return "-";
  const s=String(v).trim();
  let m=s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if(m) return String(m[3]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[1];
  m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return String(m[1]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[3];
  m=s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if(m) return String(m[1]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[3];
  const d=new Date(s);
  return isNaN(d) ? s.substring(0,10) : new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
}

function setText(id,v){ const el=document.getElementById(id); if(el) el.textContent=v; }

function loading(show){
  const el=document.getElementById("loadingOverlay");
  if(el) el.classList.toggle("show",!!show);
}

function apiUrl(action){
  return SHEET_URL + "?action=" + encodeURIComponent(action) + "&_=" + Date.now();
}

async function loadData(){
  if(sedangMemuat) return;
  sedangMemuat=true;
  if(!sudahLoadPertama) loading(true);

  try{
    const response=await fetch(apiUrl("dashboard"),{cache:"no-store"});
    if(!response.ok) throw new Error("HTTP "+response.status);
    const result=await response.json();
    if(!result || result.success!==true) throw new Error(result.message||"Response dashboard tidak valid");

    setText("saldo",formatRupiah(result.saldo));
    setText("totalMasuk",formatRupiah(result.totalMasuk));
    setText("totalKeluar",formatRupiah(result.totalKeluar));

    renderKategori("tbodyRekapMasuk",result.kategoriMasuk||[],"text-success");
    renderKategori("tbodyRekapKeluar",result.kategoriKeluar||[],"text-danger");

    setText("totalKategoriMasuk",formatRupiah(result.totalMasuk));
    setText("totalKategoriKeluar",formatRupiah(result.totalKeluar));

    renderTerakhir(result.transaksiTerakhir||[]);

    const now=new Date();
    const stamp=new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(now);
    setText("lastUpdate","Terakhir diperbarui: "+stamp);
    setText("lastUpdate2",stamp);

    sudahLoadPertama=true;
  }catch(err){
    console.error(err);
    const ids=["tbodyRekapMasuk","tbodyRekapKeluar","tbodyTerakhir"];
    ids.forEach(function(id){
      const el=document.getElementById(id);
      if(el) el.innerHTML='<tr><td colspan="6" class="empty text-danger">Gagal memuat data: '+escapeHtml(err.message)+'</td></tr>';
    });
  }finally{
    sedangMemuat=false;
    loading(false);
  }
}

function renderKategori(id,data,cls){
  const tbody=document.getElementById(id);
  if(!tbody) return;
  if(!data.length){
    tbody.innerHTML='<tr><td colspan="4" class="empty">Belum ada data</td></tr>';
    return;
  }
  tbody.innerHTML=data.map(function(x,i){
    return '<tr><td>'+(i+1)+'</td><td>'+escapeHtml(x.kategori)+'</td><td class="text-center">'+(Number(x.transaksi)||0)+'</td><td class="text-end fw-bold '+cls+'">'+formatRupiah(x.jumlah)+'</td></tr>';
  }).join("");
}

function renderTerakhir(data){
  const tbody=document.getElementById("tbodyTerakhir");
  if(!tbody) return;
  if(!data.length){
    tbody.innerHTML='<tr><td colspan="6" class="empty">Belum ada transaksi</td></tr>';
    return;
  }
  tbody.innerHTML=data.map(function(x,i){
    const j=String(x.jenis||"").toUpperCase();
    const cls=j==="MASUK"?"text-success":j==="KELUAR"?"text-danger":"";
    return '<tr><td>'+(i+1)+'</td><td>'+escapeHtml(formatTanggal(x.tanggal))+'</td><td class="fw-bold '+cls+'">'+escapeHtml(j)+'</td><td>'+escapeHtml(x.kategori)+'</td><td>'+escapeHtml(x.keterangan)+'</td><td class="text-end fw-bold">'+formatRupiah(x.nominal)+'</td></tr>';
  }).join("");
}

document.addEventListener("DOMContentLoaded",function(){
  loadData();
  setInterval(loadData,60000);
});
