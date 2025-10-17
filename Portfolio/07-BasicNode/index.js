
//hello world!
console.log("Hello World");


//star wars
const sw = require('star-wars-quotes');
console.log(sw());


//superheroes vs supervillains
const superheroes = require('superheroes');
const supervillains = require('supervillains');

const hero = superheroes.random();
const villain = supervillains.random();
console.log(`${hero} VS ${villain}!`);



//file
const fs = require('fs');

const data = fs.readFileSync('./data/input.txt', 'utf8');

console.log("secret message :");
console.log(data);


