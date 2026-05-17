const formData = new FormData();
const emptyCsvBytes = new Uint8Array([78,97,109,97,44,85,109,117,114,10,66,117,100,105,44,50,48,10]);
const blob = new Blob([emptyCsvBytes], { type: 'text/csv' });
formData.append('image', blob, 'test.csv');

fetch('http://localhost:3002/api/scan', {
  method: 'POST',
  body: formData
}).then(res => res.text()).then(console.log).catch(console.error);
