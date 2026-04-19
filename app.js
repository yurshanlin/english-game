// ===== 學習系統 =====
let level = 1;
let score = Number(localStorage.getItem("score")||0);
let exp = Number(localStorage.getItem("exp")||0);
let wrong = JSON.parse(localStorage.getItem("wrong")||"[]");

// 👉 統一圖鑑收藏
let collection = JSON.parse(localStorage.getItem("collection")||"[]");

let current;

// ===== 圖鑑資料 =====
const POKEDEX = [
 {id:1,name:"皮卡丘",type:"electric",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
 {id:2,name:"小火龍",type:"fire",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"},
 {id:3,name:"傑尼龜",type:"water",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"},
 {id:4,name:"妙蛙種子",type:"grass",rarity:"common",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"},
 {id:5,name:"伊布",type:"normal",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"},
 {id:6,name:"耿鬼",type:"ghost",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"},
 {id:7,name:"快龍",type:"dragon",rarity:"rare",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"},
 {id:8,name:"超夢",type:"legend",rarity:"legend",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"}
];

// ===== 單字系統 =====
function getPool(){
  let lv = "level"+level;
  return WORDS[lv] || WORDS.level1;
}

function newWord(){
  let pool = Math.random()<0.4 && wrong.length ? wrong : getPool();
  current = pool[Math.floor(Math.random()*pool.length)];

  document.getElementById("word").innerText=current.en;

  let choices=[current.zh];
  let base=getPool();

  while(choices.length<4){
    let r=base[Math.floor(Math.random()*base.length)].zh;
    if(!choices.includes(r)) choices.push(r);
  }

  choices.sort(()=>Math.random()-0.5);

  document.getElementById("choices").innerHTML=
    choices.map(c=>`<button onclick="check('${c}')">${c}</button>`).join("");
}

// ===== 發音 =====
function speak(){
  let u=new SpeechSynthesisUtterance(current.en);
  u.lang="en-US";
  speechSynthesis.speak(u);
}

// ===== 答題 =====
function check(ans){
  if(ans===current.zh){
    correct();
  }else{
    wrong.push(current);
    save();
    alert("錯了");
    newWord();
  }
}

function correct(){
  score++;
  exp++;

  if(exp>=20){
    level++;
    exp=0;
    alert("升級到 Level "+level);
  }

  if(score>=10){
    drawPokemon();
  }

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

// ===== 抽卡（含動畫）=====
function getRandomPokemon(){
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

  let box=document.getElementById("gacha");
  let i=0;

  let interval=setInterval(()=>{
    let temp=POKEDEX[Math.floor(Math.random()*POKEDEX.length)];
    box.innerHTML=`<img src="${temp.img}" width="100">`;
    i++;

    if(i>10){
      clearInterval(interval);

      let result=getRandomPokemon();
      box.innerHTML=`<img src="${result.img}" width="120"><br>${result.name}`;

      addToCollection(result);
    }
  },100);
}

// ===== 圖鑑 =====
function addToCollection(p){
  if(!collection.find(x=>x.id===p.id)){
    collection.push(p);
    alert("📘 收錄："+p.name);
  }else{
    alert("已經有："+p.name);
  }

  save();
  renderPokedex();
}

function renderPokedex(){
  let total=POKEDEX.length;
  let owned=collection.length;

  document.getElementById("progress").innerText=
    `收集率：${owned}/${total}`;

  document.getElementById("pokedex").innerHTML=
    POKEDEX.map(p=>{
      let owned=collection.find(x=>x.id===p.id);

      if(owned){
        return `<div><img src="${p.img}" width="80"><br>${p.name}</div>`;
      }else{
        return `<div>❓<br>???</div>`;
      }
    }).join("");
}

// ===== 儲存 =====
function save(){
  localStorage.setItem("score",score);
  localStorage.setItem("exp",exp);
  localStorage.setItem("wrong",JSON.stringify(wrong));
  localStorage.setItem("collection",JSON.stringify(collection));
}

// ===== 語音辨識 =====
function startVoice(){
  let rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)();
  rec.lang="en-US";
  rec.start();

  rec.onresult=(e)=>{
    let said=e.results[0][0].transcript.toLowerCase();
    if(said.includes(current.en)){
      correct();
    }else{
      alert("再試一次");
    }
  };
}

// ===== 初始化 =====
renderPokedex();
newWord();
