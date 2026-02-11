const TEST_DURATION = 30;

const PARAGRAPHS = [
   "The train arrived much later than expected, long after the scheduled time had passed, yet something unusual happened in the waiting room. No one complained or showed anger. Instead, the quiet space slowly filled with understanding as strangers exchanged small smiles and shared brief conversations. The delay softened everyone, replacing impatience with calm acceptance. In that still moment, people felt more connected than they would have during a rushed journey. Sometimes delays do not steal time from us; instead, they gently bring people together in ways that speed never allows.",

  "He carried the notebook everywhere he went, treating it like a precious possession, yet he never opened it in front of anyone. When people asked what was written inside, he only smiled and said it was full of unfinished thoughts. The notebook held ideas that were not ready to be shared, dreams still forming, and words waiting for the right moment. Some thoughts need time to grow silently before they are written, and rushing them would only take away their meaning.",

  "Every night, the streetlight flickered weakly before glowing steadily, struggling quietly before fulfilling its purpose. People walking past never noticed the effort it took to shine, seeing only the final result. The brief moments of darkness were invisible to them. Even light must fight through darkness before it becomes useful, just like people who grow stronger through unseen struggles before they can guide others.",

  "Progress rarely arrives with excitement or dramatic change. It hides within routine, repetition, and consistent effort that feels ordinary and slow. Day after day, the work continues without visible results, making it easy to doubt the process. Then one day, without warning, the task that once felt impossible feels normal. That is when you realize progress was happening all along, quietly shaping you in the background.",

  "Change does not always announce itself loudly or suddenly. Often, it enters life slowly, blending into daily habits until it becomes part of who you are. You may not notice it at first, but over time it reshapes your thinking, behavior, and perspective. When you finally look back, the old version of yourself feels distant, reminding you that growth is usually silent but deeply powerful.",

  "Not knowing where you are going does not mean you are lost. Uncertainty is often a natural part of movement and growth. When you keep moving forward, even without clear direction, each step reveals something new. Action brings clarity that overthinking never can. Direction slowly forms through motion, proving that progress begins when you stop standing still."

];


const textArea = document.getElementById("textArea");
const input = document.getElementById("input");

const timerEl = document.getElementById("timer");
const speedEl = document.getElementById("speed_");
const accuracyEl = document.getElementById("accuracy_");

const resetBtn = document.querySelector(".btn");

let currentText = "";
let timeLeft = TEST_DURATION;
let timer = null;
let started = false;
let startTime = null;


function renderParagraph(text){
    textArea.innerHTML="";
    text.split("").forEach((el,index) => {
        const span = document.createElement("span");
        span.textContent = el;
        if(index === 0) span.classList.add("active");
        textArea.appendChild(span);
    });
};

 function startTimer() {
      timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft === 0) {
          clearInterval(timer);
          input.disabled = true;
          calculateWPM();
        }
      }, 1000);
    }

    input.addEventListener("input", () => {
      if (!started) {
        started = true;
        startTime = Date.now();
        startTimer();
      }

      const spans = textArea.querySelectorAll("span");
      const typed = input.value.split("");
      let correctCount = 0;

      spans.forEach((span, index) => {
        span.classList.remove("correct", "incorrect", "active");

        if (typed[index] == null) {
          if (index === typed.length) span.classList.add("active");
        } else if (typed[index] === span.textContent) {
          span.classList.add("correct");
          correctCount++;
        } else {
          span.classList.add("incorrect");
        }
        calculateWPM();
      });

      const accuracy =
        typed.length === 0
          ? 0
          : Math.round((correctCount / typed.length) * 100);

      accuracyEl.textContent = accuracy;
    });

    function calculateWPM() {
        const endTime = Date.now();
        const timeSpentInSeconds = (endTime - startTime) / 1000;

        const words = input.value.trim().split(/\s+/).filter(Boolean).length;

        const wpm =
            timeSpentInSeconds > 0
            ? Math.round((words / timeSpentInSeconds) * 60)
            : 0;

        speedEl.textContent = wpm;
    }

    function resetTest() {
        clearInterval(timer);
        started = false;
        timeLeft = TEST_DURATION;
        startTime = null; 

        timerEl.textContent = TEST_DURATION;
        speedEl.textContent = 0;
        accuracyEl.textContent = 0;

        input.value = "";
        input.disabled = false;

        init();
    }

    function init() {
      const randomIndex = Math.floor(Math.random() * PARAGRAPHS.length);
      currentText = PARAGRAPHS[randomIndex];
      renderParagraph(currentText);
    }

    resetBtn.addEventListener("click", resetTest);
    init();