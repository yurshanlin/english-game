let level = 1;
let score = Number(localStorage.getItem("score")||0);
let exp = Number(localStorage.getItem("exp")||0);
let wrong = JSON.parse(localStorage.getItem("wrong")||"[]");
let collection = JSON.parse(localStorage.getItem("poke")||"[]");

let current;

const pokemon = [
 {name:"皮卡丘",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"},
 {name:"噴火龍",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"},
 {name:"伊布",img:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"}
];

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

function speak(){
  let u=new SpeechSynthesisUtterance(current.en);
  u.lang="en-US";
  speechSynthesis.speak(u);
}

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

function animate(){
  let w=document.getElementById("word");
  w.classList.add("correctAnim");
  setTimeout(()=>w.classList.remove("correctAnim"),500);
}

function drawPokemon(){
  score-=10;
  let p=pokemon[Math.floor(Math.random()*pokemon.length)];
  collection.push(p);
  alert("🎉 抓到 "+p.name);
  renderPokemon();
}

function renderPokemon(){
  document.getElementById("poke").innerHTML=
    collection.map(p=>`<img class="pokemon" src="${p.img}">`).join("");
}

function save(){
  localStorage.setItem("score",score);
  localStorage.setItem("exp",exp);
  localStorage.setItem("wrong",JSON.stringify(wrong));
  localStorage.setItem("poke",JSON.stringify(collection));
}

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

renderPokemon();
newWord();