const API_KEY = 'xynoFt4bxw7Jh2iMJ95RUpvCmwdskbC79nabEGzP'; // xynoFt4bxw7Jh2iMJ95RUpvCmwdskbC79nabEGzP
const answerButtons = document.getElementById('answerContainer')?.children;
const nextQuestionBtn = document.getElementById('nextQuestion');
const question = document.getElementById('question');
const startQuizBtn = document.getElementById('startQuiz');
const startQuizResult = document.getElementById('startQuizResult');
const limit = 10; //como máximo devuelve 20

let game;

switch (window.location.pathname.split('/').pop()) {
    case 'question.html':
        checkNavVisibility();
        initQuiz();
        break;
    case 'index.html':
        checkNavVisibility();
        startQuizBtn.addEventListener('click', nameValidate);
        break;
    case 'results.html':
        showResults();
        startQuizResult.addEventListener('click', () => {
            const resultGames = JSON.parse(`[${localStorage.getItem('finishedGames')}]`);
            const lastGame = resultGames[resultGames.length - 1];
            startGame(lastGame.name);
        });
}

async function getQuestions() {
    return await fetch(`https://quizapi.io/api/v1/questions?limit=${limit}`, {
        headers: {
            'X-Api-Key': API_KEY,
        },
    })
        .then(res => res.json())
        .then(data =>
            data.map(question => {
                return {
                    question: question.question,
                    answers: [question.answers.answer_a, question.answers.answer_b, question.answers.answer_c, question.answers.answer_d],
                    correctAnswer: Object.entries(question.correct_answers)
                        .filter(entry => entry[1] === 'true')
                        .map(entry => entry[0].charCodeAt(7) - 97)[0],
                };
            })
        ); // mirar en consola el JSON que nos trae!!! gada llamada trae un array aleatorio!
}
// document.querySelectorAll('nav ul li a').forEach(link => {
//     if (link.href === window.location.href) {
//         link.classList.add('active');
//     }
// });

function nameValidate() {
    const userName = document.getElementById('userName');
    const errorSvg = document.getElementById('errorSvg');
    userName.style.border = 'none';
    errorSvg.style.display = 'none';

    if (userName.value.trim() === '') {
        userName.style.border = '1px solid #FD0808FF';
        errorSvg.style.display = 'block';
    } else {
        startGame(userName.value);
    }
}
async function startGame(userName) {
    const newGame = {
        name: userName,
        startDate: new Date(),
        endDate: null,
        questions: [],
        currentQuestion: 0,
        currentAnswered: false,
        answers: [],
        score: 0,
    };
    newGame.questions = await getQuestions();
    localStorage.setItem('currentGame', JSON.stringify(newGame));
    location.href = './question.html';
}

function initQuiz() {
    game = JSON.parse(localStorage.getItem('currentGame'));
    if (game == null) {
        location.href = './index.html';
        return;
    }

    addEvents();
    showNextQuestion();
}

function addEvents() {
    Array.from(answerButtons).forEach((button, i) =>
        button.addEventListener('click', () => {
            verifyAnswer(i);
        })
    );

    nextQuestionBtn.addEventListener('click', showNextQuestion);
}

function showNextQuestion() {
    const currentQuestion = game.questions[game.currentQuestion] ?? null;
    if (currentQuestion == null) {
        finishGame();
        return;
    }

    question.innerText = `${game.currentQuestion + 1}. ${currentQuestion.question}`;
    Array.from(answerButtons).forEach((button, i) => {
        button.innerText = currentQuestion.answers[i];
        button.classList.remove('correct', 'incorrect');
    });

    game.currentAnswered = false;
    nextQuestionBtn.setAttribute('disabled', '');
    nextQuestionBtn.innerText = game.currentQuestion == game.questions.length - 1 ? 'Finish' : 'Next';
}

function verifyAnswer(answerIndex) {
    if (game.currentAnswered) return;
    game.currentAnswered = true;
    const currentQuestion = game.questions[game.currentQuestion];
    const correct = answerIndex == currentQuestion.correctAnswer;

    if (!correct) answerButtons.item(answerIndex).classList.add('incorrect');
    answerButtons.item(currentQuestion.correctAnswer).classList.add('correct');
    nextQuestionBtn.removeAttribute('disabled');

    game.answers.push(answerIndex);
    game.score += correct;
    game.currentQuestion++;
    localStorage.currentGame = JSON.stringify(game);
}

function finishGame() {
    game.endDate = new Date();
    if (localStorage.finishedGames == undefined) {
        localStorage.finishedGames = JSON.stringify(game);
    } else {
        localStorage.finishedGames += ',' + JSON.stringify(game);
    }
    const navBar = document.querySelector('nav');
    navBar.style.display = 'none';
    localStorage.removeItem('currentGame');

    location.href = './results.html';
}
function checkNavVisibility() {
    const navBar = document.querySelector('nav');
    const hasGame = localStorage.getItem('currentGame') !== null;

    if (navBar) {
        navBar.style.display = hasGame ? 'block' : 'none';
    }
}
function showResults() {
    const tableBody = document.querySelector('tbody');
    const resultGames = JSON.parse(`[${localStorage.getItem('finishedGames')}]`);

    const lastGame = resultGames[resultGames.length - 1];

    lastGame.questions.forEach((questionObj, index) => {
        const userAnswerIndex = lastGame.answers[index];
        const correctAnswerIndex = questionObj.correctAnswer;

        const tr = document.createElement('tr');

        const tdQuestion = document.createElement('td');
        tdQuestion.textContent = questionObj.question;

        const tdCorrect = document.createElement('td');
        tdCorrect.textContent = questionObj.answers[correctAnswerIndex];

        const tdUser = document.createElement('td');
        tdUser.textContent = questionObj.answers[userAnswerIndex];
        tdUser.style.backgroundColor = userAnswerIndex === correctAnswerIndex ? '#c8f7c5' : '#f7c5c5'; // verde o rojo

        tr.appendChild(tdQuestion);
        tr.appendChild(tdCorrect);
        tr.appendChild(tdUser);
        tableBody.appendChild(tr);
    });
}
