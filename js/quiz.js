/**
 * VirtualVerse – Cosmic Archive
 * js/quiz.js
 * Interactive Educational Quiz System
 * Features: 20+ Questions, Category filtering, 30s Timer per question, Streak multiplier,
 * Instant feedback with explanations, Final evaluation scorecard, and Achievement unlocking.
 */

class MuseumQuizApp {
  constructor() {
    this.questions = [];
    this.activeQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.userAnswers = [];

    // Timer
    this.timePerQuestion = 30;
    this.timeLeft = 30;
    this.timerInterval = null;

    this.selectedCategory = 'all';

    this.init();
  }

  init() {
    this.questions = window.StorageManager.getQuizQuestions();
    this.bindCategoryFilters();
    this.bindActionButtons();
    this.renderQuizHistory();
  }

  bindCategoryFilters() {
    const filterButtons = document.querySelectorAll('.quiz-cat-filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCategory = btn.getAttribute('data-cat');
      });
    });
  }

  bindActionButtons() {
    document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
      this.startQuiz();
    });

    document.getElementById('quiz-restart-btn')?.addEventListener('click', () => {
      this.startQuiz();
    });

    document.getElementById('quiz-exit-btn')?.addEventListener('click', () => {
      this.showSetupScreen();
    });
  }

  startQuiz() {
    let pool = [...this.questions];
    if (this.selectedCategory !== 'all') {
      pool = pool.filter(q => q.category === this.selectedCategory);
    }

    if (pool.length === 0) {
      window.VirtualVerseApp?.showToast('No questions found for this category.', 'error');
      return;
    }

    // Shuffle pool and select 10 questions per quiz session
    this.activeQuestions = this.shuffleArray(pool).slice(0, 10);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.userAnswers = [];

    // Switch Screens
    document.getElementById('quiz-setup-view')?.classList.add('hidden');
    document.getElementById('quiz-results-view')?.classList.add('hidden');
    document.getElementById('quiz-active-view')?.classList.remove('hidden');

    window.VirtualVerseApp?.sound.playClick();
    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    clearInterval(this.timerInterval);
    const q = this.activeQuestions[this.currentIndex];

    // Update Counter & Category
    const counterEl = document.getElementById('quiz-q-counter');
    const catEl = document.getElementById('quiz-q-category');
    const textEl = document.getElementById('quiz-q-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const streakEl = document.getElementById('quiz-streak-count');

    if (counterEl) counterEl.textContent = `Question ${this.currentIndex + 1} of ${this.activeQuestions.length}`;
    if (catEl) catEl.textContent = q.category;
    if (textEl) textEl.textContent = q.question;
    if (streakEl) streakEl.textContent = this.streak;
    if (feedbackBox) feedbackBox.classList.add('hidden');

    // Populate 4 Options
    if (optionsContainer) {
      optionsContainer.innerHTML = q.options.map((opt, idx) => `
        <button class="quiz-option-btn" data-index="${idx}">
          <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `).join('');

      optionsContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const chosenIdx = parseInt(btn.getAttribute('data-index'));
          this.handleAnswerSelection(chosenIdx);
        });
      });
    }

    // Start 30s Countdown
    this.timeLeft = this.timePerQuestion;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeOut();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerText = document.getElementById('quiz-timer-text');
    const timerBar = document.getElementById('quiz-timer-bar-fill');
    if (timerText) timerText.textContent = `${this.timeLeft}s`;
    if (timerBar) {
      const pct = (this.timeLeft / this.timePerQuestion) * 100;
      timerBar.style.width = `${pct}%`;
      if (this.timeLeft <= 5) {
        timerBar.style.backgroundColor = '#ef4444';
      } else {
        timerBar.style.backgroundColor = '#00e5ff';
      }
    }
  }

  handleAnswerSelection(selectedIndex) {
    clearInterval(this.timerInterval);
    const q = this.activeQuestions[this.currentIndex];
    const isCorrect = selectedIndex === q.answer;

    // Disable all options
    const options = document.querySelectorAll('.quiz-option-btn');
    options.forEach(opt => {
      opt.disabled = true;
      const idx = parseInt(opt.getAttribute('data-index'));
      if (idx === q.answer) opt.classList.add('correct');
      if (idx === selectedIndex && !isCorrect) opt.classList.add('wrong');
    });

    if (isCorrect) {
      this.score++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      window.VirtualVerseApp?.sound.playSuccess();
    } else {
      this.streak = 0;
      window.VirtualVerseApp?.sound.playError();
    }

    this.userAnswers.push({
      question: q.question,
      chosen: selectedIndex,
      correct: q.answer,
      isCorrect: isCorrect,
      explanation: q.explanation
    });

    // Display Explanation Box
    const feedbackBox = document.getElementById('quiz-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'fb-correct' : 'fb-wrong'}`;
      feedbackBox.classList.remove('hidden');
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <i class="fa-solid fa-${isCorrect ? 'circle-check' : 'circle-xmark'}"></i>
          <h4>${isCorrect ? 'Splendid Analysis!' : 'Historical Inaccuracy Detected'}</h4>
        </div>
        <p class="feedback-explanation">${q.explanation}</p>
        <button class="cyber-btn btn-primary btn-sm" id="quiz-next-q-btn">
          ${this.currentIndex < this.activeQuestions.length - 1 ? 'Next Question &rarr;' : 'Calculate Final Score &rarr;'}
        </button>
      `;

      document.getElementById('quiz-next-q-btn')?.addEventListener('click', () => {
        this.nextQuestion();
      });
    }
  }

  handleTimeOut() {
    window.VirtualVerseApp?.sound.playError();
    this.handleAnswerSelection(-1); // -1 represents timeout
  }

  nextQuestion() {
    if (this.currentIndex < this.activeQuestions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.concludeQuiz();
    }
  }

  concludeQuiz() {
    clearInterval(this.timerInterval);
    const total = this.activeQuestions.length;
    const percentage = Math.round((this.score / total) * 100);

    // Save result to localStorage
    const quizResult = {
      score: this.score,
      total: total,
      percentage: percentage,
      maxStreak: this.maxStreak,
      category: this.selectedCategory
    };
    window.StorageManager.recordQuizAttempt(quizResult);

    // Update Results Screen UI
    document.getElementById('quiz-active-view')?.classList.add('hidden');
    document.getElementById('quiz-results-view')?.classList.remove('hidden');

    const scoreNum = document.getElementById('results-score-num');
    const scorePct = document.getElementById('results-score-pct');
    const badgeBadge = document.getElementById('results-rank-badge');
    const msgEl = document.getElementById('results-feedback-msg');

    if (scoreNum) scoreNum.textContent = `${this.score} / ${total}`;
    if (scorePct) scorePct.textContent = `${percentage}% Accuracy`;

    let rank = 'Cosmic Initiate';
    let msg = 'Every journey through the archives deepens your understanding.';
    if (percentage === 100) {
      rank = 'Omniscient Mind (Grand Master)';
      msg = 'Flawless mastery of universal history, science, and civilizations!';
      window.VirtualVerseApp?.sound.playSuccess();
    } else if (percentage >= 80) {
      rank = 'Senior Cosmic Scholar';
      msg = 'Exceptional historical acumen across our museum sectors!';
      window.VirtualVerseApp?.sound.playSuccess();
    } else if (percentage >= 50) {
      rank = 'Historical Researcher';
      msg = 'Solid exploration base! Revisit the 3D rooms to uncover missing relics.';
    }

    if (badgeBadge) badgeBadge.textContent = rank;
    if (msgEl) msgEl.textContent = msg;

    this.renderReviewSummary();
    this.renderQuizHistory();
  }

  renderReviewSummary() {
    const list = document.getElementById('results-review-list');
    if (!list) return;

    list.innerHTML = this.userAnswers.map((ua, idx) => `
      <div class="review-item ${ua.isCorrect ? 'rev-correct' : 'rev-wrong'}">
        <div class="rev-header">
          <span class="rev-num">#${idx + 1}</span>
          <span class="rev-status">${ua.isCorrect ? '<i class="fa-solid fa-check"></i> Correct' : '<i class="fa-solid fa-xmark"></i> Incorrect'}</span>
        </div>
        <div class="rev-question">${ua.question}</div>
        <div class="rev-explanation"><small>Insight:</small> ${ua.explanation}</div>
      </div>
    `).join('');
  }

  renderQuizHistory() {
    const container = document.getElementById('quiz-history-container');
    if (!container) return;

    const data = window.StorageManager.getExplorationData();
    const scores = data.quizScores || [];

    if (scores.length === 0) {
      container.innerHTML = `
        <div class="empty-history-prompt">
          <i class="fa-solid fa-scroll"></i>
          <p>No past quiz attempts logged yet. Test your knowledge above!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = scores.slice(0, 5).map(s => `
      <div class="history-score-card">
        <div class="h-score-col">
          <span class="h-score-val">${s.score}/${s.total}</span>
          <span class="h-score-pct">${s.percentage}%</span>
        </div>
        <div class="h-meta-col">
          <div class="h-cat">${s.category === 'all' ? 'All Collections' : s.category}</div>
          <div class="h-date">${new Date(s.date).toLocaleDateString()}</div>
        </div>
      </div>
    `).join('');
  }

  showSetupScreen() {
    clearInterval(this.timerInterval);
    document.getElementById('quiz-active-view')?.classList.add('hidden');
    document.getElementById('quiz-results-view')?.classList.add('hidden');
    document.getElementById('quiz-setup-view')?.classList.remove('hidden');
  }

  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quiz-setup-view')) {
    window.QuizApp = new MuseumQuizApp();
  }
});