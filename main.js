const API_KEY = 'xynoFt4bxw7Jh2iMJ95RUpvCmwdskbC79nabEGzP'; // xynoFt4bxw7Jh2iMJ95RUpvCmwdskbC79nabEGzP
const answerButtons = document.getElementById('answerContainer')?.children;
const nextQuestionBtn = document.getElementById('nextQuestion');
const question = document.getElementById('question');
const inputNameForm = document.getElementById('inputNameForm');
const startQuizResult = document.getElementById('startQuizResult');
const goHome = document.getElementById('goHome');
const limit = 10; //como máximo devuelve 20

let game;

switch (window.location.pathname.split('/').pop()) {
    case 'question.html':
        checkNavVisibility();
        initQuiz();
        break;
    case '':
    case 'index.html':
        checkNavVisibility();
        inputNameForm.addEventListener('submit', nameValidate);
        loadStats();
        break;
    case 'results.html':
        showResults();
        startQuizResult.addEventListener('click', () => {
            const resultGames = getResults();
            const lastGame = resultGames[resultGames.length - 1];
            startGame(lastGame.name);
        });
        goHome.addEventListener('click', () => (location.href = './index.html'));
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
        );
}

function nameValidate(event) {
    event.preventDefault();
    const userName = this.userName;
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
function getResults() {
    const games = localStorage.getItem('finishedGames');
    if(games == null)
        return [];
    return JSON.parse(`[${games}]`);
}

function showResults() {
    const resultGames = getResults();
    const lastGame = resultGames[resultGames.length - 1];

    // Texto
    const textContainer = document.querySelector('section.results .feedback');
    if (lastGame.score == 10) {
        textContainer.innerHTML = `
            <h3>Congratulations ${lastGame.name}!</h3>
            <p>You got all 10 questions right!</p>
        `;
    } else if (lastGame.score >= 5) {
        textContainer.innerHTML = `
            <h3>Congratulations ${lastGame.name}!</h3>
            <p>You passed the quiz with a score of ${lastGame.score}/${10}</p>
        `;
    } else {
        textContainer.innerHTML = `
            <h3>You failed the quiz, ${lastGame.name}!</h3>
            <p>You only got ${lastGame.score}/${10} questions right!</p>
            <p>Keep trying!</p>
        `;
    }
    // Tabla
    const tableBody = document.querySelector('tbody');

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

        tr.append(tdQuestion, tdCorrect, tdUser);
        tableBody.appendChild(tr);
    });
}

function loadStats() {
    const games = getResults();
    const chart = Highcharts.chart('stats', {
        chart: {
            zoomType: 'x',
            resetZoomButton: {
                position: 'left',
            },
            animation: false,
            styledMode: false,
        },
        title: {
            text: 'Your stats',
            style: {
                color: '#000000',
                'font-family': 'Times New Roman',
            },
        },
        subtitle: {
            text: '',
        },
        plotOptions: {},
        xAxis: {
            type: 'datetime',
            ordinal: true,
        },
        yAxis: [
            {
                title: 'Score',
                allowDecimals: false,
                min: 0,
            },
        ],
        tooltip: {
            xDateFormat: '%Y-%m-%d %H:%M:%S',
            shared: true,
        },
        series: [
            {
                data: games.map(game => [new Date(game.endDate).getTime(), game.score]),
                type: 'line',
                shadow: false,
                yAxis: 0,
                name: 'Score',
                visible: true,
                color: '#2080ff',
            },
        ],
    });
}
