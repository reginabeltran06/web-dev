/*
    Prime Factorization - Have the user enter a number and find
    all Prime Factors (if there are any) and display them.
*/

var getPrimeFactors = function (n) {
  "use strict";

  n = parseInt(n);

  function isPrime(n) {
    var i;
    for (i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  }

  var i,
    sequence = [];

  //TODO: Check which numbers are factors of n and also check if
  // that number also happens to be a prime

  while (n % 2 === 0) {
    sequence.push(2);
    n = n / 2;
  }


  for (i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      sequence.push(i);
      n = n/ i;
    }
  }

  if (n > 2) {
    sequence.push(n);
  }


  document.getElementById("pf").innerText = sequence.join(", ")

  return sequence;
};

// the prime factors for this number are: [ 2, 3, 5, 7, 11, 13 ]
//  console.log(getPrimeFactors(30030));
