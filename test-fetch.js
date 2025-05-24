fetch('https://api.expo.dev')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
