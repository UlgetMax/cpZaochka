function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    // Менее оптимальная проверка по сравнению с нативной версией
    for (let i = 5; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  }
  
  function findPrime(num) {
    let largestPrime = 0;
    for (let j = 2; j <= num; j++) {
      if (isPrime(j)) {
        largestPrime = j;
      }
    }
    return largestPrime;
  }
  
  module.exports = findPrime;