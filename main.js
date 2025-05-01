const API_KEY = 'IHSk9PSzlcpF64fg1XaNabp9O06vHFmGlFxtsxaz';
const limit = 10; //como máximo devuelve 20
fetch(`https://quizapi.io/api/v1/questions?limit=${limit}`, {
    headers: {
        'X-Api-Key': API_KEY,
    },
})
    .then(res => res.json())
    .then(data => console.log(data)); // mirar en consola el JSON que nos trae!!! gada llamada trae un array aleatorio!
