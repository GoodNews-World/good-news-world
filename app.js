const stories = [
  {id:1,category:"Environment",country:"Costa Rica",flag:"🇨🇷",emoji:"🌳",tone:"#e6f2e5",date:"Illustrative example",source:"Good News World sample",title:"A community effort helps restore a thriving forest",summary:"A sample story card showing how a verified conservation success could appear in the feed. Live articles will be connected in the next build.",tags:"forest restoration biodiversity conservation"},
  {id:2,category:"Science",country:"Japan",flag:"🇯🇵",emoji:"🔬",tone:"#e8eef9",date:"Illustrative example",source:"Good News World sample",title:"Researchers make progress on cleaner energy materials",summary:"This placeholder demonstrates the science category. Once connected to news feeds, the app will show the publisher's real headline and a concise summary.",tags:"science research energy technology"},
  {id:3,category:"Health",country:"United Kingdom",flag:"🇬🇧",emoji:"🩺",tone:"#fcebe8",date:"Illustrative example",source:"Good News World sample",title:"A health initiative expands access to early screening",summary:"A sample of the kind of measurable health improvement the app aims to surface, with context and a link to the original reporting.",tags:"health medicine screening care"},
  {id:4,category:"Humanity",country:"India",flag:"🇮🇳",emoji:"🤝",tone:"#f9efdc",date:"Illustrative example",source:"Good News World sample",title:"Local volunteers create new support for families",summary:"A placeholder for stories about practical kindness, community support, and people helping one another.",tags:"humanity volunteers community kindness"},
  {id:5,category:"Animals",country:"South Africa",flag:"🇿🇦",emoji:"🐘",tone:"#eaf0df",date:"Illustrative example",source:"Good News World sample",title:"Conservation teams work to protect vulnerable wildlife",summary:"A sample wildlife story card. Real stories will be screened for evidence, dates, and source quality before appearing here.",tags:"animals wildlife conservation"},
  {id:6,category:"Progress",country:"Brazil",flag:"🇧🇷",emoji:"🏫",tone:"#e8f2ef",date:"Illustrative example",source:"Good News World sample",title:"A new learning program opens doors for young people",summary:"A placeholder for constructive progress in education, opportunity, and community development.",tags:"progress education opportunity youth"}
];
let activeCategory="All", savedOnly=false;
let saved = JSON.parse(localStorage.getItem("gnw_saved") || "[]");
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
  const query=$("searchInput").value.trim().toLowerCase(), country=$("countryFilter").value;
  const filtered=stories.filter(s=>{
    const text=[s.title,s.summary,s.category,s.country,s.tags].join(" ").toLowerCase();
    return (activeCategory==="All"||s.category===activeCategory)&&(country==="All"||s.country===country)&&(!query||text.includes(query))&&(!savedOnly||saved.includes(s.id));
  });
  $("storyGrid").innerHTML=filtered.map(s=>`<article class="story-card">
    <div class="card-visual" style="--visual:${s.tone}"><span class="card-category">${esc(s.category.toUpperCase())}</span><span>${s.emoji}</span></div>
    <div class="card-body"><div class="card-meta"><span>${s.flag} ${esc(s.country)}</span><span>${esc(s.date)}</span></div>
    <h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p>
    <div class="card-bottom"><span class="source">${esc(s.source)}</span><div class="card-actions"><button class="icon-button ${saved.includes(s.id)?"saved":""}" data-save="${s.id}" aria-label="Save story">${saved.includes(s.id)?"★":"☆"}</button><a class="read-link" href="#" data-preview="${s.id}">DETAILS ↗</a></div></div></div></article>`).join("");
  $("emptyState").hidden=filtered.length!==0;
  $("storyGrid").hidden=filtered.length===0;
  $("savedCount").textContent=saved.length;
  $("feedTitle").textContent=savedOnly?"Your saved stories":"Today's bright spots";
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100)}
$("categoryFilters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===b));render()});
$("searchInput").addEventListener("input",render);
$("countryFilter").addEventListener("change",render);
$("storyGrid").addEventListener("click",e=>{
  const save=e.target.closest("[data-save]");if(save){const id=Number(save.dataset.save);saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem("gnw_saved",JSON.stringify(saved));render();toast(saved.includes(id)?"Story saved":"Removed from saved");}
  const detail=e.target.closest("[data-preview]");if(detail){e.preventDefault();const s=stories.find(x=>x.id===Number(detail.dataset.preview));toast("Preview story only — live sources are coming next.");}
});
$("savedShortcut").addEventListener("click",()=>{savedOnly=!savedOnly;$("savedShortcut").innerHTML=savedOnly?"← All stories":`☆ Saved <span id="savedCount">${saved.length}</span>`;render()});
$("clearFilters").addEventListener("click",()=>{activeCategory="All";savedOnly=false;$("searchInput").value="";$("countryFilter").value="All";document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));$("savedShortcut").innerHTML=`☆ Saved <span id="savedCount">${saved.length}</span>`;render()});
const countries=[...new Set(stories.map(s=>s.country))].sort();countries.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;$("countryFilter").append(o)});
$("year").textContent=new Date().getFullYear();render();
