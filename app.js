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

// ===== 寶可夢圖鑑 =====
const POKEDEX = [
 {id:1,name:"皮卡丘",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
 {id:2,name:"小火龍",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"},
 {id:3,name:"傑尼龜",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"},
 {id:4,name:"妙蛙種子",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"},

 {id:21,name:"迷你Q",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/778.png"},
 {id:22,name:"走路草",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"},
 {id:23,name:"蛋蛋",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"},
 {id:24,name:"菊草葉",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png"},

 {id:25,name:"畢力吉翁",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/640.png"},
 {id:26,name:"木木梟",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/722.png"},

 {id:27,name:"超級噴火龍X",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png"},
 {id:28,name:"超級噴火龍Y",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10035.png"},

 {id:29,name:"六尾",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"},

 {id:30,name:"火焰鳥",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"},
 {id:31,name:"鳳王",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"},
 {id:32,name:"炎帝",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/244.png"},

 {id:33,name:"蚊香泳士",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png"},
 {id:34,name:"呆呆獸",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png"},
 {id:35,name:"拉普拉斯",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"},
 {id:36,name:"海刺龍",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png"},
 {id:37,name:"海星星",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"},

 {id:40,name:"巨金怪",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png"},
 {id:41,name:"勾帕路翁",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/638.png"},
 {id:42,name:"胖丁",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"},
 {id:43,name:"百變怪",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"},
 {id:44,name:"膽小蟲",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/767.png"},
 {id:45,name:"波波",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"},
 {id:46,name:"大比鳥",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"},
 {id:47,name:"喵喵",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png"},
 {id:48,name:"寶石海星",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"},
 {id:49,name:"角金魚",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png"},
 {id:50,name:"小鋸鱷",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png"},
 {id:51,name:"墨海馬",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png"},
 {id:52,name:"刺龍王",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/230.png"},
 {id:53,name:"椰蛋樹",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png"},
 {id:54,name:"帕路奇亞",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/484.png"},
 {id:55,name:"帝牙盧卡",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/483.png"},
 {id:56,name:"騎拉帝納",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/487.png"}
];

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

// ===== 抽卡系統（SSR動畫🔥）=====
function getRarityColor(rarity){
  if(rarity==="legend") return "gold";
  if(rarity==="rare") return "#4da6ff";
  return "#ffffff";
}

function getRandomPokemon(){
  let notOwned = POKEDEX.filter(p=>!collection.find(c=>c.id===p.id));

  if(notOwned.length>0 && Math.random()<0.7){
    return notOwned[Math.floor(Math.random()*notOwned.length)];
  }

  let rand=Math.random();
  let pool;

  if(rand<0.6) pool=POKEDEX.filter(p=>p.rarity==="common");
  else if(rand<0.9) pool=POKEDEX.filter(p=>p.rarity==="rare");
  else pool=POKEDEX.filter(p=>p.rarity==="legend");

  return pool[Math.floor(Math.random()*pool.length)];
}

function drawPokemon(){
  if(score<10){
    alert("分數不足");
    return;
  }

  score-=10;
  document.getElementById("score").innerText=score;

  let box=document.getElementById("gacha");
  if(!box) return;

  let i=0;

  let interval=setInterval(()=>{
    let temp=POKEDEX[Math.floor(Math.random()*POKEDEX.length)];

    box.innerHTML = `
      <img src="${temp.img}" width="100">
    `;

    i++;

    if(i>12){
      clearInterval(interval);

      let result=getRandomPokemon();
      let color=getRarityColor(result.rarity);

      box.innerHTML = `
        <div style="
          padding:15px;
          border:4px solid ${color};
          border-radius:15px;
          box-shadow:0 0 25px ${color};
        ">
          <img src="${result.img}" width="130"><br>
          <b>${result.name}</b><br>
          ${result.rarity.toUpperCase()}
        </div>
      `;

      if(result.rarity==="legend"){
        alert("✨ SSR!!! ✨");
      }

      addToCollection(result);
    }
  },80);
}

// ===== 圖鑑 =====
function addToCollection(p){
  if(!collection.find(x=>x.id===p.id)){
    collection.push(p);
    alert("📘 收錄："+p.name);
  }else{
    alert("已擁有："+p.name);
  }

  save();
  renderPokedex();
}

function renderPokedex(){
  let total=POKEDEX.length;
  let owned=collection.length;

  let progressEl=document.getElementById("progress");
  let pokedexEl=document.getElementById("pokedex");

  if(progressEl){
    progressEl.innerText=`收集率：${owned}/${total}`;
  }

  if(pokedexEl){
    pokedexEl.innerHTML=
      POKEDEX.map(p=>{
        let owned=collection.find(x=>x.id===p.id);
        return owned
          ? `<div><img src="${p.img}" width="80"><br>${p.name}</div>`
          : `<div>❓<br>???</div>`;
      }).join("");
  }
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
