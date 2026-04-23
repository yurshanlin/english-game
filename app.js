// ===== 記憶系統 =====
let memory = JSON.parse(localStorage.getItem("memory")||"{}");

function getKey(word){ return word.en; }

function updateMemory(word, correct){
  let key = getKey(word);
  let data = memory[key] || {level:0, next:0};

  data.level = correct ? data.level+1 : 0;

  let delay = [0, 60000, 300000, 600000, 1800000];
  let wait = delay[Math.min(data.level, delay.length-1)];

  data.next = Date.now() + wait;
  memory[key] = data;

  save();
}

function isDue(word){
  let data = memory[getKey(word)];
  return !data || Date.now() >= data.next;
}

// ===== 基本資料 =====
let level = Number(localStorage.getItem("level")||1);
let score = Number(localStorage.getItem("score")||0);
let exp = Number(localStorage.getItem("exp")||0);
let collection = JSON.parse(localStorage.getItem("collection")||"[]");

let current;
let usedSpeak = false;

// ===== 音效 =====
const soundDraw = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const soundSSR = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const soundHit = new Audio("https://actions.google.com/sounds/v1/impacts/punch_medium.ogg");

// ===== Boss系統 =====
let boss = null;

function spawnBoss(){
  boss = {hp:50, max:50};
  alert("🔥 Boss 出現！（HP 50）");
  document.getElementById("bossBox").style.display="block";
  renderBoss();
}

function renderBoss(){
  if(!boss) return;

  document.getElementById("bossName").innerText = "🔥 單字魔王";
  document.getElementById("bossHp").style.width =
    (boss.hp/boss.max*100)+"%";
}

// ===== 寶可夢池 =====
const POKEDEX = [
{id:1,name:"皮卡丘",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
{id:2,name:"小火龍",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"},
{id:3,name:"傑尼龜",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"},
{id:4,name:"妙蛙種子",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"},

{id:5,name:"巨金怪",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png"},
{id:6,name:"胖丁",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"},
{id:7,name:"百變怪",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"},
{id:8,name:"波波",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"},
{id:9,name:"大比鳥",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"},
{id:10,name:"喵喵",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png"},

{id:11,name:"帕路奇亞",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/484.png"},
{id:12,name:"帝牙盧卡",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/483.png"},
{id:13,name:"騎拉帝納",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/487.png"}
];

// ===== 單字池 =====
function getPool(){
  return WORDS["level"+(((level-1)%9)+1)];
}

// ===== 出題 =====
function newWord(){
  usedSpeak=false;

  let pool=getPool();
  let due=pool.filter(w=>isDue(w));
  let source=due.length?due:pool;

  current=source[Math.floor(Math.random()*source.length)];

  document.getElementById("word").innerText=current.en;

  let choices=[current.zh];
  while(choices.length<4){
    let r=pool[Math.floor(Math.random()*pool.length)].zh;
    if(!choices.includes(r)) choices.push(r);
  }

  choices.sort(()=>Math.random()-0.5);

  document.getElementById("choices").innerHTML=
    choices.map(c=>`<button onclick="check('${c}')">${c}</button>`).join("");
}

// ===== 發音 =====
function speak(){
  usedSpeak=true;
  let u=new SpeechSynthesisUtterance(current.en);
  u.lang="en-US";
  speechSynthesis.speak(u);
}

// ===== 答題 =====
function check(ans){
  if(ans===current.zh){
    updateMemory(current,true);

    let dmg = usedSpeak ? 1 : 3;

    if(boss){
      boss.hp -= dmg;
      soundHit.play();

      if(boss.hp<=0){
        alert("🎉 擊敗 Boss！");
        boss=null;
        document.getElementById("bossBox").style.display="none";
        drawPokemon(true);
      }
      renderBoss();
    }

    correct();
  }else{
    updateMemory(current,false);
    alert("錯了");
    newWord();
  }
}

function correct(){
  score += usedSpeak ? 1 : 3;
  exp++;

  if(level%5===0 && !boss){
    spawnBoss();
  }

  if(exp>=20){
    level++;
    exp=0;
    alert("升級 Lv."+level);
  }

  document.getElementById("score").innerText=score;
  document.getElementById("level").innerText=level;

  save();
  newWord();
}

// ===== 抽卡（重點🔥）=====
function drawPokemon(bossReward=false){
  if(!bossReward && score<10){
    alert("分數不足");
    return;
  }

  if(!bossReward) score-=10;

  soundDraw.play();

  let box=document.getElementById("gacha");

  // ⭐ 新卡優先
  let notOwned = POKEDEX.filter(p=>!collection.find(x=>x.id===p.id));
  let pool = notOwned.length ? notOwned : POKEDEX;

  let rand=Math.random();
  let rarity;

  if(rand<0.6) rarity="common";
  else if(rand<0.9) rarity="rare";
  else rarity="legend";

  let candidates = pool.filter(p=>p.rarity===rarity);
  if(candidates.length===0) candidates=pool;

  let result=candidates[Math.floor(Math.random()*candidates.length)];

  // ⭐ SSR動畫
  if(result.rarity==="legend"){
    soundSSR.play();
    box.innerHTML=`✨✨✨<br><img src="${result.img}" width="140"><br>${result.name}`;
  }else{
    box.innerHTML=`<img src="${result.img}" width="100"><br>${result.name}`;
  }

  addToCollection(result);
}

// ===== 圖鑑 =====
function addToCollection(p){
  if(!collection.find(x=>x.id===p.id)){
    collection.push(p);
    alert("📘 收錄："+p.name);
  }
  save();
  renderPokedex();
}

function renderPokedex(){
  let el=document.getElementById("pokedex");
  let total=POKEDEX.length;

  document.getElementById("progress").innerText =
    `收集率：${collection.length}/${total}`;

  el.innerHTML =
    POKEDEX.map(p=>{
      let owned=collection.find(x=>x.id===p.id);
      return owned
        ? `<div><img src="${p.img}" width="70"><br>${p.name}</div>`
        : `<div>❓</div>`;
    }).join("");
}

// ===== 儲存 =====
function save(){
  localStorage.setItem("level",level);
  localStorage.setItem("score",score);
  localStorage.setItem("exp",exp);
  localStorage.setItem("collection",JSON.stringify(collection));
  localStorage.setItem("memory",JSON.stringify(memory));
}

// ===== 初始化 =====
renderPokedex();
document.getElementById("score").innerText=score;
document.getElementById("level").innerText=level;
newWord();
