// ===== 記憶系統 =====
let memory = JSON.parse(localStorage.getItem("memory")||"{}");

function getKey(word){
  return word.en;
}

function updateMemory(word, correct){
  let key = getKey(word);
  let data = memory[key] || {level:0, next:0};

  if(correct){
    data.level++;
  }else{
    data.level = 0;
  }

  let delay = [0, 60000, 300000, 600000, 1800000];
  let wait = delay[Math.min(data.level, delay.length-1)];

  data.next = Date.now() + wait;

  memory[key] = data;
  save();
}

function isDue(word){
  let data = memory[getKey(word)];
  if(!data) return true;
  return Date.now() >= data.next;
}

// ===== 學習系統 =====
let level = Number(localStorage.getItem("level")||1);
let score = Number(localStorage.getItem("score")||0);
let exp = Number(localStorage.getItem("exp")||0);
let wrong = JSON.parse(localStorage.getItem("wrong")||"[]");

let collection = JSON.parse(localStorage.getItem("collection")||"[]");

let current;

// ===== 圖鑑資料（擴充完整版）=====
const POKEDEX = [

 //

// ===== 單字系統 =====
function getPool(){
  let lv = "level"+level;
  return WORDS[lv] || WORDS.level1;
}

function newWord(){
  let pool = getPool();

  let due = pool.filter(w => isDue(w));
  let source = due.length ? due : pool;

  current = source[Math.floor(Math.random()*source.length)];

  if(!current){
    current = pool[0];
  }

  document.getElementById("word").innerText = current.en;

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
  let u=new SpeechSynthesisUtterance(current.en);
  u.lang="en-US";
  speechSynthesis.speak(u);
}

// ===== 答題 =====
function check(ans){
  if(ans===current.zh){
    updateMemory(current, true);
    correct();
  }else{
    updateMemory(current, false);

    if(!wrong.find(w=>w.en===current.en)){
      wrong.push(current);
    }

    save();
    alert("錯了");
    newWord();
  }
}

function correct(){
  updateDaily();

  score++;
  exp++;

  if(exp>=20){
    level++;
    exp=0;
    alert("升級到 Level "+level);
  }

  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;

  animate();
  save();
  newWord();
}

// ===== 每日任務 =====
let daily = JSON.parse(localStorage.getItem("daily")||"{}");

function getToday(){
  return new Date().toDateString();
}

function initDaily(){
  let today = getToday();

  if(daily.date !== today){
    daily = {
      date: today,
      goal: 10,
      progress: 0,
      reward: false
    };
  }

  renderDaily();
}

function updateDaily(){
  daily.progress++;

  if(daily.progress >= daily.goal && !daily.reward){
    alert("🎁 每日任務完成！+10分");
    score += 10;
    daily.reward = true;
  }

  save();
  renderDaily();
}

function renderDaily(){
  let el = document.getElementById("daily");
  if(el){
    el.innerText = `每日任務：${daily.progress}/${daily.goal}`;
  }
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
  if(!box) return;

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

  let progressEl=document.getElementById("progress");
  let pokedexEl=document.getElementById("pokedex");

  if(progressEl){
    progressEl.innerText = `收集率：${owned}/${total}`;
  }

  if(pokedexEl){
    pokedexEl.innerHTML =
      POKEDEX.map(p=>{
        let owned=collection.find(x=>x.id===p.id);

        if(owned){
          return `<div><img src="${p.img}" width="80"><br>${p.name}</div>`;
        }else{
          return `<div>❓<br>???</div>`;
        }
      }).join("");
  }
}

// ===== 儲存 =====
function save(){
  localStorage.setItem("level",level);
  localStorage.setItem("score",score);
  localStorage.setItem("exp",exp);
  localStorage.setItem("wrong",JSON.stringify(wrong));
  localStorage.setItem("collection",JSON.stringify(collection));
  localStorage.setItem("memory",JSON.stringify(memory));
  localStorage.setItem("daily",JSON.stringify(daily));
}

// ===== 語音辨識 =====
function startVoice(){
  let rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)();
  rec.lang="en-US";
  rec.start();

  rec.onresult=(e)=>{
    let said=e.results[0][0].transcript.toLowerCase();

    if(said.includes(current.en.split(" ")[0])){
      correct();
    }else{
      alert("再試一次");
    }
  };
}

// ===== 初始化 =====
initDaily();
renderPokedex();
document.getElementById("score").innerText = score;
document.getElementById("level").innerText = level;
newWord();
