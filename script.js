const TEST_DURATION = 30;

const PARAGRAPHS = [
  "The train arrived much later than expected, long after the scheduled time had passed, yet something unusual happened in the waiting room. No one complained or showed anger. Instead, the quiet space slowly filled with understanding as strangers exchanged small smiles and shared brief conversations. The delay softened everyone, replacing impatience with calm acceptance.",
  "He carried the notebook everywhere he went, treating it like a precious possession, yet he never opened it in front of anyone. When people asked what was written inside, he only smiled and said it was full of unfinished thoughts. The notebook held ideas that were not ready to be shared, dreams still forming, and words waiting for the right moment.",
  "Every night, the streetlight flickered weakly before glowing steadily, struggling quietly before fulfilling its purpose. People walking past never noticed the effort it took to shine, seeing only the final result. The brief moments of darkness were invisible to them. Even light must fight through darkness before it becomes useful.",
  "Progress rarely arrives with excitement or dramatic change. It hides within routine, repetition, and consistent effort that feels ordinary and slow. Day after day, the work continues without visible results, making it easy to doubt the process. Then one day, without warning, the task that once felt impossible feels normal.",
  "Change does not always announce itself loudly or suddenly. Often, it enters life slowly, blending into daily habits until it becomes part of who you are. You may not notice it at first, but over time it reshapes your thinking, behavior, and perspective. When you finally look back, the old version of yourself feels distant."
];

// DOM Elements
const textArea = document.getElementById("textArea");
const typingContainer = document.getElementById("typingContainer");
const input = document.getElementById("input");
const timerEl = document.getElementById("timer");
const speedEl = document.getElementById("speed_");
const accuracyEl = document.getElementById("accuracy_");
const progressBar = document.getElementById("progressBar");
const resetBtn = document.getElementById("resetBtn");
const restartBtn = document.getElementById("restartBtn");
const cursor = document.getElementById("customCursor");
const resultsWrapper = document.getElementById("resultsWrapper");
const finalWpmEl = document.getElementById("finalWpm");
const finalAccEl = document.getElementById("finalAcc");
const highScoresListEl = document.getElementById("highScoresList");
const recentScoresListEl = document.getElementById("recentScoresList");
const navTest = document.getElementById("nav-test");
const navLeaderboard = document.getElementById("nav-leaderboard");
const testView = document.getElementById("testView");
const leaderboardView = document.getElementById("leaderboardView");
const fullLeaderboardListEl = document.getElementById("fullLeaderboardList");

// State
let timeLeft = TEST_DURATION;
let timer = null;
let started = false;
let startTime = null;
let charIndex = 0;

// Initialization
function init() {
  const randomIndex = Math.floor(Math.random() * PARAGRAPHS.length);
  renderParagraph(PARAGRAPHS[randomIndex]);
  resetStats();
  updateLeaderboardUI();
}

function renderParagraph(text) {
  textArea.querySelectorAll("span").forEach(span => span.remove());
  const fragment = document.createDocumentFragment();
  text.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    fragment.appendChild(span);
  });
  textArea.insertBefore(fragment, cursor);
  updateCursor();
}

function resetStats() {
  clearInterval(timer);
  started = false;
  timeLeft = TEST_DURATION;
  startTime = null;
  charIndex = 0;
  
  timerEl.textContent = TEST_DURATION;
  speedEl.textContent = "0";
  accuracyEl.textContent = "0";
  progressBar.style.width = "0%";
  
  input.value = "";
  input.disabled = false;
  input.focus();
  
  // Reset UI
  resultsWrapper.classList.add("hidden");
  typingContainer.classList.remove("finished");
  cursor.classList.remove("hidden");
  
  // Clear classes
  const spans = textArea.querySelectorAll("span");
  spans.forEach(s => s.classList.remove("correct", "incorrect", "active"));
  if(spans[0]) spans[0].classList.add("active");
  
  // Reset container scroll
  textArea.style.transform = "translateY(0)";
  
  updateCursor();
}

// Cursor Logic
function updateCursor() {
  const spans = textArea.querySelectorAll("span");
  const activeSpan = spans[charIndex];
  
  if (activeSpan) {
    const rect = activeSpan.getBoundingClientRect();
    
    cursor.style.left = `${activeSpan.offsetLeft}px`;
    cursor.style.top = `${activeSpan.offsetTop}px`;
    cursor.style.height = `${activeSpan.offsetHeight}px`;
    
    // Smoothly scroll container if needed
    if (activeSpan.offsetTop > 100) {
        textArea.style.transform = `translateY(-${activeSpan.offsetTop - 50}px)`;
    } else {
        textArea.style.transform = `translateY(0)`;
    }
  }
}

// Timer & Metrics
function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    // Progress Bar
    const progress = ((TEST_DURATION - timeLeft) / TEST_DURATION) * 100;
    progressBar.style.width = `${progress}%`;

    if (timeLeft <= 0) {
      endSession();
    }
  }, 1000);
}

function calculateWPM(correctCount) {
  if (!startTime) return;
  const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
  if (timeElapsed <= 0) return;
  
  const wpm = Math.round((correctCount / 5) / timeElapsed);
  speedEl.textContent = wpm;
}

function endSession() {
  clearInterval(timer);
  input.disabled = true;
  const finalWPM = parseInt(speedEl.textContent);
  const finalAcc = parseInt(accuracyEl.textContent);
  
  // UI Updates
  finalWpmEl.textContent = finalWPM;
  finalAccEl.textContent = finalAcc;
  resultsWrapper.classList.remove("hidden");
  typingContainer.classList.add("finished");
  cursor.classList.add("hidden");
  
  saveScore(finalWPM, finalAcc);
}

// Input Handling
input.addEventListener("input", (e) => {
  if (!started) {
    started = true;
    startTimer();
  }

  const spans = textArea.querySelectorAll("span");
  const typedValue = input.value;
  charIndex = typedValue.length;

  let correctCount = 0;

  spans.forEach((span, index) => {
    span.classList.remove("active", "correct", "incorrect");
    
    if (index < charIndex) {
      if (typedValue[index] === span.textContent) {
        span.classList.add("correct");
        correctCount++;
      } else {
        span.classList.add("incorrect");
      }
    } else if (index === charIndex) {
      span.classList.add("active");
    }
  });

  // Update Stats
  calculateWPM(correctCount);
  const accuracy = charIndex === 0 ? 0 : Math.round((correctCount / charIndex) * 100);
  accuracyEl.textContent = accuracy;
  
  updateCursor();

  // Auto-end if paragraph finished
  if (charIndex === spans.length) {
    endSession();
  }
});

// Leaderboard Persistence
function saveScore(wpm, accuracy) {
  const scores = JSON.parse(localStorage.getItem("typeninja_premium_scores")) || [];
  const newScore = {
    id: Date.now(),
    wpm,
    accuracy,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  };
  
  scores.push(newScore);
  localStorage.setItem("typeninja_premium_scores", JSON.stringify(scores));
  updateLeaderboardUI();
}

function updateLeaderboardUI() {
  const scores = JSON.parse(localStorage.getItem("typeninja_premium_scores")) || [];
  
  // High Scores (Top 5)
  const highScores = [...scores].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 5);
  // Recent Activity (Last 5)
  const recentScores = [...scores].sort((a, b) => b.id - a.id).slice(0, 5);
  // Full Leaderboard (Top 25)
  const allTimeHighScores = [...scores].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 25);

  renderScoreList(highScoresListEl, highScores);
  renderScoreList(recentScoresListEl, recentScores);
  if (fullLeaderboardListEl) renderScoreList(fullLeaderboardListEl, allTimeHighScores);
}

function renderScoreList(element, scores) {
  element.innerHTML = "";
  if (scores.length === 0) {
    element.innerHTML = '<li class="empty">No sessions yet</li>';
    return;
  }

  scores.forEach((score, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="rank-initial">${score.wpm > 0 ? score.wpm.toString()[0] : '0'}</div>
      <div class="score-info">
        <div>
          <span class="score-wpm">${score.wpm} WPM</span>
          <span class="score-acc">${score.accuracy}% ACC</span>
        </div>
        <div class="score-date">${score.date}</div>
      </div>
    `;
    element.appendChild(li);
  });
}

// Shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    resetBtn.focus();
  }
  if (e.key === "Enter" && document.activeElement === resetBtn) {
    resetStats();
    init();
  }
});

resetBtn.addEventListener("click", () => {
  resetStats();
  init();
});

restartBtn.addEventListener("click", () => {
  resetStats();
  init();
});

// Navigation Handling
if (navTest && navLeaderboard) {
  navTest.addEventListener("click", (e) => {
    e.preventDefault();
    navTest.classList.add("active");
    navLeaderboard.classList.remove("active");
    testView.classList.remove("hidden");
    leaderboardView.classList.add("hidden");
    if (!input.disabled) input.focus();
  });

  navLeaderboard.addEventListener("click", (e) => {
    e.preventDefault();
    navLeaderboard.classList.add("active");
    navTest.classList.remove("active");
    leaderboardView.classList.remove("hidden");
    testView.classList.add("hidden");
    updateLeaderboardUI();
  });
}

// Start
init();
