const fs = require("fs");
const folders = ["config","models","routes","controllers","services","middlewares","sockets","swagger","queues","cron","utils","validators","logs","test"];
const files = ["index.js","logs",".gitignore",".env",".env.local","README.md","LICENSE"];
const serverFiles = ["server.js", "app.js"];

folders.forEach(folder => {
  const dir = `backend/src/${folder}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

files.forEach(file => {
  const touch = `backend/${file}`;
  if (!fs.existsSync(touch)) {
    fs.writeFileSync(touch, '', 'utf8');
    console.log(`Created: ${touch}`);
  }
});

serverFiles.forEach(file => {
  const touch = `backend/src/${file}`;
  if (!fs.existsSync(touch)) {
    fs.writeFileSync(touch, '', 'utf8');
    console.log(`Created: ${touch}`);
  }
});
