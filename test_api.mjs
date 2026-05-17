const formData = new FormData();
const blob = new Blob(['empty'], { type: 'text/plain' });
formData.append('image', blob, 'test.txt');

fetch('http://localhost:3002/api/scan', {
  method: 'POST',
  body: formData
}).then(res => res.text()).then(console.log).catch(console.error);
