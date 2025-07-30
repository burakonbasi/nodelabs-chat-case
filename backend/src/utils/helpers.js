export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const createUserPairs = (users) => {
  const shuffled = shuffleArray(users);
  const pairs = [];
  
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    pairs.push({
      sender: shuffled[i],
      receiver: shuffled[i + 1]
    });
  }
  
  // If odd number of users, pair the last one with the first
  if (shuffled.length % 2 !== 0) {
    pairs.push({
      sender: shuffled[shuffled.length - 1],
      receiver: shuffled[0]
    });
  }
  
  return pairs;
};