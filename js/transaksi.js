"use strict";

let page=1;
const limit=20;
let loadingNow=false;
let kategoriLoaded=false;

const rupiahFormatter=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0,maximumFractionDigits:0});

function rupiah(v){return rupiahFormatter.format(Number(v)||0);}
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}

function tanggal(v){
  if(!v) return "-";
  const s=String(v).trim();
  let m=s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if(m) return String(m[3]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[1];
  m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return String(m[1]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[3];
  m=s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if(m) return String(m[1]).padStart(2,"0")+"/"+String(m[2]).padStart(2,"0")+"/"+m[3];
  return s.substring(0,10);
}

function val(id){const e=document.getElementById(id); return e?e.value.trim():"";}
function setText(id,v){const e=document.getElementById(id); if(e)e.textContent=v;}

function buildUrl(){
  const u=new URL(SHEET_URL);
  u.searchParams.set("action","transaksi");
  u.searchParams.set("page",page);
  u.searchParams.set("limit",limit);

  const jenis=val("filterJenis");
  const kategori=val("filterKategori");
  const mulai=val("filterMulai");
  const akhir=val("filterAkhir");

  if(jenis) u.searchParams.set("jenis",jenis);
  if(kategori) u.searchParams.set("kategori",kategori);
  if(mulai) u.searchParams.set("mulai",mulai);
  if(akhir) u.searchParams.set("akhir",akhir);

  u.searchParams.set("_",Date.now());
  return u.toString();
}

async function loadKategori(){
  if(kategoriLoaded) return;
  try{
    const r=await fetch(SHEET_URL+"?action=dashboard&_="+Date.now(),{cache:"no-store"});
    const j=await r.json();
    if(!j.success) return;
    const select=document.getElementById("filterKategori");
    if(!select) return;
    const cats=Array.isArray(j.kategoriList)?j.kategoriList:[];
    cats.forEach(function(c){
      const o=document.createElement("option");
      o.value=c;
      o.textContent=c;
      select.appendChild(o);
    });
    kategoriLoaded=true;
  }catch(e){console.error("Kategori:",e);}
}

async function loadTransactions(){
  if(loadingNow) return;
  loadingNow=true;
  showLoading(true);

  try{
    const r=await fetch(buildUrl(),{cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    const j=await r.json();
    if(!j.success) throw new Error(j.message||"Data transaksi tidak valid");

    render(j.data||[]);
    setText("totalTransaksi",j.total||0);
    setText("detailMasuk",rupiah(j.totalMasuk));
    setText("detailKeluar",rupiah(j.totalKeluar));
    setText("pageInfo","Halaman "+j.page+" / "+j.totalPages);
    setText("infoPage","Menampilkan "+(j.total?((j.page-1)*j.limit+1):0)+" - "+Math.min(j.page*j.limit,j.total)+" dari "+j.total);

    const prev=document.getElementById("btnPrev");
    const next=document.getElementById("btnNext");
    if(prev) prev.disabled=j.page<=1;
    if(next) next.disabled=j.page>=j.totalPages;

    page=j.page;
  }catch(e){
    console.error(e);
    const tbody=document.getElementById("tbodyTransaksi");
    if(tbody) tbody.innerHTML='<tr><td colspan="7" class="empty text-danger">Gagal memuat data: '+esc(e.message)+'</td></tr>';
  }finally{
    loadingNow=false;
    showLoading(false);
  }
}

function render(data){
  const tbody=document.getElementById("tbodyTransaksi");
  if(!tbody)return;

  if(!data.length){
    tbody.innerHTML='<tr><td colspan="7" class="empty">Tidak ada transaksi sesuai filter.</td></tr>';
    return;
  }

  tbody.innerHTML=data.map(function(x,i){
    const j=String(x.jenis||"").toUpperCase();
    const cls=j==="MASUK"?"text-success":j==="KELUAR"?"text-danger":"";
    return '<tr>'+
      '<td>'+((page-1)*limit+i+1)+'</td>'+
      '<td>'+esc(tanggal(x.tanggal))+'</td>'+
      '<td class="fw-bold '+cls+'">'+esc(j)+'</td>'+
      '<td>'+esc(x.kategori)+'</td>'+
      '<td>'+esc(x.keterangan)+'</td>'+
      '<td>'+esc(x.petugas)+'</td>'+
      '<td class="text-end fw-bold">'+rupiah(x.nominal)+'</td>'+
      '</tr>';
  }).join("");
}

function resetFilter(){
  ["filterJenis","filterKategori","filterMulai","filterAkhir"].forEach(function(id){
    const e=document.getElementById(id);
    if(e)e.value="";
  });
  page=1;
  loadTransactions();
}

function showLoading(show){
  const e=document.getElementById("loadingOverlay");
  if(e)e.classList.toggle("show",!!show);
}

document.addEventListener("DOMContentLoaded",function(){
  loadKategori();
  loadTransactions();

  document.getElementById("btnFilter").addEventListener("click",function(){
    const mulai=val("filterMulai");
    const akhir=val("filterAkhir");
    if(mulai && akhir && mulai>akhir){
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }
    page=1;
    loadTransactions();
  });

  document.getElementById("btnReset").addEventListener("click",resetFilter);

  document.getElementById("btnPrev").addEventListener("click",function(){
    if(page>1){page--;loadTransactions();}
  });

  document.getElementById("btnNext").addEventListener("click",function(){
    page++;loadTransactions();
  });
});
