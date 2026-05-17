// Alright, lets finally create a library that makes node.js less painless. 
// This library is called Painless 2.0 (because of Painless 1.0, witch is the frontend version)
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const painless = {
  // --- 1. CONFIG & STORAGE ---
  dbType: 'variable',
  routes: {},

  // --- 2. THE SECRET AGENT (Security) ---
  hash: function(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  },
  compare: function(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === checkHash;
  },

  // --- 3. THE TRAFFIC COP (Routing) ---
  link: function(path, actionFunction) {
    this.routes[path] = actionFunction;
  },

  // --- 4. THE MEMORY (Database) ---
  useDatabase: function(type) {
    this.dbType = type;
  },
  // Update save to handle a LIST of people
  save: function(newData) {
    let list = [];
    if (fs.existsSync('db.json')) {
      list = JSON.parse(fs.readFileSync('db.json'));
    }
    list.push(newData);
    fs.writeFileSync('db.json', JSON.stringify(list, null, 2));
  },
  // New helper to find a user in the file
  findUser: function(username) {
    if (!fs.existsSync('db.json')) return null;
    const list = JSON.parse(fs.readFileSync('db.json'));
    return list.find(u => u.username === username);
  },

  // --- 5. THE ENGINE (The Server) ---
  start: function(port) {
    const server = http.createServer((req, res) => {
      // --- C.O.R.S (The 'Ghost' Fix) ---
      // These headers allow your frontend to talk to this backend safely with JSON metadata
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // --- THE PREFLIGHT GUARD ---
      // If the browser is just checking headers (OPTIONS check), answer 200 OK immediately and stop
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // --- THE TRANSLATOR (Reading data) ---
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        let data = {};
        try {
          data = body ? JSON.parse(body) : {};
        } catch(e) {}

        // Helper to send data back easily
        res.send = (json) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(json));
        };

        // --- THE TRIGGER ---
        const action = this.routes[req.url];
        if (action) {
          action(data, res);
        } else {
          res.writeHead(404);
          res.end("404: Room not found.");
        }
      });
    });

    server.listen(port, () => {
      console.log(`🚀 Painless Engine live at http://localhost:${port}`);
    });
  }
};

// This makes it work when you eventually share the file
module.exports = painless;
