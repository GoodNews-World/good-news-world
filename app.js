// Good News World — source-health and quality-filter update.
// RSS is accessed through rss2json's public demo endpoint for prototyping only.
const FEEDS = [
  {name:"NASA", url:"https://www.nasa.gov/feed/", category:"Science", region:"United States"},
  {name:"UN News", url:"https://news.un.org/feed/subscribe/en/news/all/rss.xml", category:"Progress", region:"International"},
  {name:"ScienceDaily · Top Science", url:"https://www.sciencedaily.com/rss/top/science.xml", category:"Science", region:"International"},
  {name:"ScienceDaily · Health", url:"https://www.sciencedaily.com/rss/top/health.xml", category:"Health", region:"International"},
  {name:"ScienceDaily · Environment", url:"https://www.sciencedaily.com/rss/top/environment.xml", category:"Environment", region:"International"},
  {name:"Mongabay", url:"https://news.mongabay.com/feed/", category:"Environment", region:"International"}
];

const POSITIVE = [
  ["restoration",3],["recovery",3],["recovered",3],["reintroduce",3],["reintroduced",3],
  ["breakthrough",2],["discovery",2],["discovered",2],["protect",2],["protected",2],
  ["conservation",2],["renewable",2],["clean energy",2],["vaccine",2],["treatment",2],
  ["cure",2],["improve",2],["improved",2],["improvement",2],["progress",1],
  ["volunteer",2],["community-led",2],["rescue",2],["saved",2],["education",1],
  ["access to",1],["award",1],["record number",1],["decline in",2],["reduced",1],
  ["increase in",1],["new species",2],["successful",2],["successfully",2],["help",1],
  ["funding",0],["initiative",0],["launch",0],["opens",0],["opened",0]
];
const NEGATIVE = [
  ["killed",4],["death toll",4],["massacre",5],["bombing",4],["war",3],
  ["attack",3],["shooting",4],["murder",4],["violence",3],["disaster",3],
  ["crisis",2],["outbreak",3],["epidemic",3],["devastating",3],["devastated",3],
  ["collapse",2],["fatal",3],["threat",2],["conflict",2],["flood",2],
  ["earthquake",2],["hurricane",2],["wildfire",2],["drought",2],["scandal",2],
  ["fraud",2],["arrested",1],["layoff",2],["bankruptcy",2]
];
const CATEGORIES = {
  Science:["science","research","space","NASA","technology","scientist","discovery","energy","robot","physics"],
  Environment:["environment","wildlife","forest","conservation","climate","ocean","species","habitat","nature","biodiversity"],
  Health:["health","medical","medicine","hospital","vaccine","cancer","disease","WHO","treatment","clinical"],
  Humanity:["volunteer","community","charity","humanitarian","help","families","donation","kindness","food bank"],
  Animals:["animal","wildlife","species","elephant","turtle","bird","habitat","marine","whale"],
  Progress:["education","poverty","development","United Nations","school","access","literacy","clean water","employment"]
};
const $ = id => document.getElementById(id);
let stories = [];
let activeCategory = "All";
let saved = JSON.parse(localStorage.getItem("gnw_saved") || "[]");
let savedOnly = false;
let feedStatus = [];

function clean(value) {
  const node = document.createElement("div");
  node.innerHTML = value || "";
  return (node.textContent || "").replace(/\s+/g, " ").trim();
}
function safe(value) {
  return String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function scoreStory(text) {
  const t = text.toLowerCase();
  let good = 0, bad = 0;
  for (const [term, points] of POSITIVE) if (t.includes(term)) good += points;
  for (const [term, points] of NEGATIVE) if (t.includes(term)) bad += points;
  return {good, bad, score:good-bad};
}
function chooseCategory(text, fallback) {
  for (const [category, terms] of Object.entries(CATEGORIES)) {
    if (terms.some(term => text.toLowerCase().includes(term.toLowerCase()))) return category;
  }
  return fallback;
}
function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function dateLabel(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}) : "Date unavailable";
}
async function fetchFeed(feed) {
  const endpoint = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("HTTP " + response.status);
  const payload = await response.json();
  if (payload.status !== "ok") throw new Error(payload.message || "Feed parser error");
  const items = (payload.items || []).map(item => {
    const title = clean(item.title);
    const description = clean(item.description || item.content);
    const text = title + " " + description;
    const rating = scoreStory(text);
    const published = parseDate(item.pubDate);
    return {
      id:item.link || title, title, description:description.slice(0,320),
      link:item.link || "", source:feed.name, date:item.pubDate || "",
      timestamp:published ? published.getTime() : 0,
      region:feed.region, category:chooseCategory(text,feed.category),
      positive:rating.good, negative:rating.bad, score:rating.score
    };
  });
  return {feed:feed.name,items};
}
async function loadFeeds() {
  $("updateStatus").textContent = "Checking " + FEEDS.length + " feeds…";
  $("resultCount").textContent = "Fetching and checking recent articles…";
  const checks = await Promise.all(FEEDS.map(async feed => {
    try { const result = await fetchFeed(feed); return {ok:true,...result}; }
    catch (error) { return {ok:false,feed:feed.name,error:error.message,items:[]}; }
  }));
  feedStatus = checks;
  const all = checks.flatMap(result => result.items);
  const now = Date.now();
  // Exclude undated and older-than-30-day items; avoid presenting stale stories as current.
  const recent = all.filter(item => item.timestamp && now-item.timestamp <= 30*24*60*60*1000);
  // Require positive evidence and a positive margin over negative signals.
  const qualified = recent.filter(item => item.positive >= 2 && item.score >= 2);
  stories = [...new Map(qualified.filter(item => item.link).map(item => [item.link,item])).values()]
    .sort((a,b)=>b.timestamp-a.timestamp).slice(0,75);
  const goodFeeds = checks.filter(result=>result.ok).length;
  $("updateStatus").textContent = goodFeeds ? `${goodFeeds}/${FEEDS.length} sources responding` : "News sources unavailable";
  $("resultCount").textContent = `${stories.length} recent stories passed topic screening · ${goodFeeds}/${FEEDS.length} feeds responding`;
  const countrySelect = $("countryFilter"), previous = countrySelect.value;
  countrySelect.innerHTML = '<option value="All">All regions</option>';
  [...new Set(stories.map(s=>s.region))].sort().forEach(region=>{
    const option=document.createElement("option");option.value=region;option.textContent=region;countrySelect.append(option);
  });
  countrySelect.value=[...countrySelect.options].some(o=>o.value===previous)?previous:"All";
  render();
  if (!stories.length) {
    $("emptyState").hidden=false; $("storyGrid").hidden=true;
    $("emptyState").querySelector("h3").textContent="No stories passed the quality filter";
    $("emptyState").querySelector("p").textContent="Feeds may be temporarily unavailable, or recent articles did not meet the positive-topic threshold. Try Refresh.";
  }
}
function renderCards(list, target, ranked=false) {
  const icons={Science:"🔬",Environment:"🌱",Health:"💚",Humanity:"❤️",Animals:"🐾",Progress:"🌍"};
  target.innerHTML=list.map((s,index)=>`
    <article class="story-card ${ranked?"ranked-card":""}">
      <div class="card-visual" style="--visual:#e8f2ed"><span class="card-category">${safe(s.category.toUpperCase())}</span><span>${icons[s.category]||"🌎"}</span>${ranked?`<span class="rank-number">#${index+1}</span>`:""}</div>
      <div class="card-body">
        <div class="card-meta"><span>${safe(s.region)}</span><span>${dateLabel(s.date)}</span></div>
        <h3>${safe(s.title)}</h3><p>${safe(s.description||"Open the original publisher article for details.")}</p>
        <div class="card-bottom"><span class="source">${safe(s.source)}</span><div class="card-actions">
          <button class="icon-button ${saved.includes(s.id)?"saved":""}" data-save="${encodeURIComponent(s.id)}" aria-label="Save story">${saved.includes(s.id)?"★":"☆"}</button>
          <a class="read-link" href="${safe(s.link)}" target="_blank" rel="noopener noreferrer">READ SOURCE ↗</a>
        </div></div>
      </div>
    </article>`).join("");
}
function renderBriefing(ranked) {
  const date = new Date();
  $("briefingDate").textContent = date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  const highlights = ranked.slice(0,5);
  const list = $("briefingList");
  if (!highlights.length) {
    list.innerHTML = '<p class="briefing-loading">No qualifying stories are available yet. Try refreshing the news feed.</p>';
    return;
  }
  list.innerHTML = highlights.map((story,index) => {
    const detail = story.description || "Open the original publisher article for the full story.";
    return `<article class="briefing-item">
      <span class="briefing-number">${index+1}</span>
      <div class="briefing-copy">
        <span class="briefing-category">${safe(story.category)} · ${safe(story.source)} · ${dateLabel(story.date)}</span>
        <h3>${safe(story.title)}</h3>
        <p>${safe(detail.slice(0,220))}${detail.length>220?"…":""}</p>
        <a href="${safe(story.link)}" target="_blank" rel="noopener noreferrer">Read the original story ↗</a>
      </div>
    </article>`;
  }).join("");
}
function render() {
  const ranked=[...stories].sort((a,b)=>b.score-a.score||b.positive-a.positive||b.timestamp-a.timestamp).slice(0,10);
  renderCards(ranked,$("top10Grid"),true);
  renderBriefing(ranked);
  $("top10Note").textContent=ranked.length?`${ranked.length} stories ranked from the latest feed. Scores favor stronger positive signals, with newer stories breaking ties.`:"Top 10 will appear when qualifying stories are available.";
  const query=$("searchInput").value.toLowerCase().trim(), region=$("countryFilter").value;
  const list=stories.filter(s=>
    (activeCategory==="All"||s.category===activeCategory) &&
    (region==="All"||s.region===region) &&
    (!query||[s.title,s.description,s.source,s.region,s.category].join(" ").toLowerCase().includes(query)) &&
    (!savedOnly||saved.includes(s.id))
  );
  renderCards(list,$("storyGrid"));
  $("emptyState").hidden=list.length>0; $("storyGrid").hidden=list.length===0;
  $("savedCount").textContent=saved.length;
  $("feedTitle").textContent=savedOnly?"Your saved stories":"Today's bright spots";
}
function toast(message) {
  const el=$("toast");el.textContent=message;el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}
$("categoryFilters").addEventListener("click",event=>{
  const button=event.target.closest("[data-category]");if(!button)return;
  activeCategory=button.dataset.category;
  document.querySelectorAll(".chip").forEach(chip=>chip.classList.toggle("active",chip===button));
  render();
});
$("searchInput").addEventListener("input",render);
$("countryFilter").addEventListener("change",render);
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-save]");if(!button)return;
  const id=decodeURIComponent(button.dataset.save);
  saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
  localStorage.setItem("gnw_saved",JSON.stringify(saved));render();toast("Saved list updated");
});
$("savedShortcut").addEventListener("click",()=>{
  savedOnly=!savedOnly;
  $("savedShortcut").textContent=savedOnly?"← All stories":"☆ Saved "+saved.length;
  render();
});
$("refreshButton").addEventListener("click",loadFeeds);
$("clearFilters").addEventListener("click",()=>{
  activeCategory="All";savedOnly=false;$("searchInput").value="";$("countryFilter").value="All";
  document.querySelectorAll(".chip").forEach(chip=>chip.classList.toggle("active",chip.dataset.category==="All"));
  $("savedShortcut").textContent="☆ Saved "+saved.length;render();
});
$("year").textContent=new Date().getFullYear();
loadFeeds();
setInterval(loadFeeds,30*60*1000);
