const API_KEY = 'IHSk9PSzlcpF64fg1XaNabp9O06vHFmGlFxtsxaz';
const limit = 10; //como máximo devuelve 20
fetch(`https://quizapi.io/api/v1/questions?limit=${limit}`, {
    headers: {
        'X-Api-Key': API_KEY,
    },
})
    .then(res => res.json())
    .then(data => console.log(data)); // mirar en consola el JSON que nos trae!!! gada llamada trae un array aleatorio!

document.querySelectorAll('nav ul li a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});
let game = {
    name: 'David',
    startDate: new Date(),
    endDate: null,
    questions: [
        {
            question: 'Which PHP function is used to execute a system command for file operations?',
            answers: ['exec()', 'system()', 'shell_exec()', 'All of the above'],
            correctAnswer: 3,
        },
        {
            question: 'What is the purpose of Django middleware?',
            answers: [
                'To define database models',
                'To handle HTTP requests and responses',
                'To manage frontend templates',
                'To secure API endpoints',
            ],
            correctAnswer: 1,
        },
        {
            question: 'Which is the log in which data changes received from a replication master server are written?',
            answers: ['Error Log', 'Relay Log', 'General Query Log', 'Binary Log'],
            correctAnswer: 1,
        },
        {
            question: 'What does `ls -l` display?',
            answers: [
                'Only filenames',
                'Detailed file information including permissions, size, and modification date',
                'Files sorted by modification date',
                'Only directories',
            ],
            correctAnswer: 1,
        },
    ],
    currentQuestion: 0,
    currentAnswered: false,
    answers: [],
    score: 0,
};

const answerButtons = document.getElementById('answerContainer').children;
const nextQuestionBtn = document.getElementById('nextQuestion');
const question = document.getElementById('question');

function initQuiz() {
    // descomentar cuando se guarde en localStorage
    //game = JSON.parse(localStorage.getItem("currentGame"));
    /* if (game == null) {
        location.href = './index.html';
        return;
    } */

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

    question.innerText = currentQuestion.question;
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

    localStorage.removeItem('currentGame');

    location.href = './results.html';
}
