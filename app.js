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
let wrong = JSON.parse(localStorage.getItem("wrong")||"[]");
let collection = JSON.parse(localStorage.getItem("collection")||"[]");

let current;
let usedSpeak = false;

// ===== Boss系統 =====
let boss = null;

function spawnBoss(){
  boss = {
    hp: 20 + level*5,
    max: 20 + level*5
  };
  alert("🔥 Boss 出現！");
  renderBoss();
}

function renderBoss(){
  let el = document.getElementById("boss");
  if(!el) return;

  if(!boss){
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    🐉 Boss HP：${boss.hp}/${boss.max}
    <div style="height:10px;background:#ccc">
      <div style="height:10px;width:${(boss.hp/boss.max)*100}%;background:red"></div>
    </div>
  `;
}

// ===== 圖鑑 =====
const POKEDEX = [
 {id:1,name:"皮卡丘",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
 {id:2,name:"小火龍",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"},
 {id:3,name:"噴火龍",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"},
 {id:4,name:"超級噴火龍X",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png"}
];

// ===== 進化表 =====
const EVOLUTION = {
  "小火龍":"噴火龍",
  "噴火龍":"超級噴火龍X"
};

// ===== 單字池 =====
function getPool(){
  let cycle = Math.floor((level-1)/9);
  let real = ((level-1)%9)+1;

  if(cycle<3) return WORDS["level"+real];

  let all=[];
  for(let i=1;i<=9;i++) all=all.concat(WORDS["level"+i]);

  return [...wrong,...all];
}

// ===== 出題 =====
function newWord(){
  usedSpeak=false;

  let pool=getPool();
  let due=pool.filter(w=>isDue(w));
  let source=due.length?due:pool;

  current=source[Math.floor(Math.random()*source.length)]||pool[0];

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

    // ⭐ Boss傷害
    if(boss){
      let dmg = usedSpeak ? 1 : 3;
      boss.hp -= dmg;

      if(boss.hp<=0){
        alert("🎉 打敗 Boss！");
        boss=null;
        drawPokemon();
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

  // ⭐ 觸發Boss
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

  animate();
  save();
  newWord();
}

// ===== 動畫 =====
function animate(){
  let w=document.getElementById("word");
  w.classList.add("correctAnim");
  setTimeout(()=>w.classList.remove("correctAnim"),500);
}

// ===== 抽卡 =====
function getRandomPokemon(){
  let rand=Math.random();
  if(rand<0.6) return POKEDEX[0];
  if(rand<0.9) return POKEDEX[1];
  return POKEDEX[2];
}

function drawPokemon(){
  let p=getRandomPokemon();
  addToCollection(p);
}

// ===== 進化 =====
function tryEvolve(){
  collection.forEach(p=>{
    let next=EVOLUTION[p.name];
    if(next && !collection.find(x=>x.name===next)){
      let evo=POKEDEX.find(x=>x.name===next);
      if(evo){
        collection.push(evo);
        alert("✨ 進化："+p.name+" → "+evo.name);
      }
    }
  });
}

// ===== 圖鑑 =====
function addToCollection(p){
  if(!collection.find(x=>x.id===p.id)){
    collection.push(p);
    alert("📘 收錄："+p.name);
  }

  tryEvolve();

  save();
  renderPokedex();
}

function renderPokedex(){
  let el=document.getElementById("pokedex");
  if(!el) return;

  el.innerHTML=
    collection.map(p=>`<img src="${p.img}" width="80"><br>${p.name}`).join("");
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
