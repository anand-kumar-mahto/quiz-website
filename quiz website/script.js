document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('signup-form').addEventListener('submit', handleSignUp);
document.getElementById('show-signup').addEventListener('click', showSignUpForm);
document.getElementById('show-login').addEventListener('click', showLoginForm);
document.getElementById('start-quiz').addEventListener('click', startQuiz);
document.getElementById('forgot-password').addEventListener('click', showForgotPasswordForm);
document.getElementById('back-to-login').addEventListener('click', showLoginForm);
document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
document.getElementById('play-again').addEventListener('click', playAgain);
document.getElementById('change-topic').addEventListener('click', changeTopic);
document.getElementById('start-quiz-with-rules').addEventListener('click', startQuizWithRules);

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedTopic = '';
let timerInterval;
let elapsedTime = 0;


window.onload = function () {
    setTimeout(() => {
        document.getElementById('welcome-container').style.display = 'none';
        document.getElementById('login-container').classList.remove('hidden');
    }, 2000);
};

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const storedPassword = localStorage.getItem(username);

    if (storedPassword && storedPassword === password) {
        localStorage.setItem('isLoggedIn', true);
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function handleSignUp(event) {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (localStorage.getItem(username)) {
        alert('Username already exists. Please choose a different username.');
    } else {
        localStorage.setItem(username, password);
        localStorage.setItem(`${username}_email`, email);
        document.getElementById('signup-success').style.display = 'block';
    }
}

function showSignUpForm() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('signup-container').classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('signup-container').classList.add('hidden');
    document.getElementById('forgot-password-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
}

function showForgotPasswordForm() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('forgot-password-container').classList.remove('hidden');
}

async function handleForgotPassword(event) {
    event.preventDefault();

    const username = document.getElementById('forgot-username').value;
    const email = document.getElementById('forgot-email').value;
    const storedEmail = localStorage.getItem(`${username}_email`);

    if (storedEmail && storedEmail === email) {

        await simulateEmailSend(email);
        document.getElementById('reset-success').style.display = 'block';
    } else {
        document.getElementById('reset-error').style.display = 'block';
    }

    setTimeout(() => {
        showLoginForm();
    }, 2000);
}

async function simulateEmailSend(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Reset link sent to ${email}`);
            resolve();
        }, 1000);
    });
}

async function startQuiz() {

    document.getElementById('quiz-container').querySelector('h1').classList.add('hidden');
    document.getElementById('topic-selector').classList.add('hidden');
    document.getElementById('start-quiz').classList.add('hidden');


    document.getElementById('marking-scheme-container').classList.remove('hidden');
}

function startQuizWithRules() {

    document.getElementById('marking-scheme-container').classList.add('hidden');


    selectedTopic = document.getElementById('topic-selector').value;
    loadQuestions().then(() => {
        shuffleQuestions();
        displayNextQuestion();


        document.getElementById('quiz').classList.remove('hidden');


        elapsedTime = 0;
        document.getElementById('elapsed-time').innerText = `Time: 0 seconds`;
        timerInterval = setInterval(updateTimer, 1000);
    });
}

async function loadQuestions() {
    const response = await fetch('questions.json');
    const data = await response.json();
    const topicQuestions = data[selectedTopic];


    questions = getRandomSubset(topicQuestions, 10);
}

function getRandomSubset(array, size) {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

function displayNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        clearInterval(timerInterval);
        showResults();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question-number').innerText = `Question ${currentQuestionIndex + 1}`;
    document.getElementById('question-text').innerText = question.question;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.addEventListener('click', () => checkAnswer(button, option.correct));
        optionsContainer.appendChild(button);
    });
}

function updateTimer() {
    elapsedTime++;
    document.getElementById('elapsed-time').innerText = `Time: ${elapsedTime} seconds`;
}

function checkAnswer(button, isCorrect) {
    if (isCorrect) {
        button.classList.add('correct');
        score += 5;
    } else {
        button.classList.add('incorrect');
        score -= 1.5;
        revealCorrectAnswer();
    }

    document.getElementById('score').innerText = `Score: ${score}`;
    setTimeout(() => {
        currentQuestionIndex++;
        displayNextQuestion();
    }, 1000);
}

function revealCorrectAnswer() {
    const options = document.getElementById('options-container').children;
    for (let i = 0; i < options.length; i++) {
        if (questions[currentQuestionIndex].options[i].correct) {
            options[i].classList.add('correct');
        }
    }
}

function showResults() {
    document.getElementById('final-score').innerText = `Your Score: ${score}`;
    document.getElementById('final-time').innerText = `Time Taken: ${elapsedTime} seconds`;
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
}

function playAgain() {
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('marking-scheme-container').classList.remove('hidden');
    resetQuiz();
}

function changeTopic() {
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('marking-scheme-container').classList.remove('hidden');
    document.getElementById('quiz-container').querySelector('h1').classList.remove('hidden');
    document.getElementById('topic-selector').classList.remove('hidden');
    document.getElementById('start-quiz').classList.remove('hidden');
    resetQuiz();
}

function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('elapsed-time').innerText = `Time: 0 seconds`;
}

