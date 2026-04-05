require('dotenv').config(); // Must be first

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const supabaseClient = require('./supabaseClient'); // Import first

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- SQLite Database -----------------
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDB();
  }
});

function initializeDB() {
  db.serialize(() => {
    // Create Bins table
    db.run(`CREATE TABLE IF NOT EXISTS bins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT,
        type TEXT,
        fill_level INTEGER,
        status TEXT
    )`);

    // Create Reports table
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT,
        description TEXT,
        image_url TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert dummy bins if empty
    db.get('SELECT COUNT(*) as count FROM bins', [], (err, row) => {
      if (!err && row.count === 0) {
        const insertBin = db.prepare('INSERT INTO bins (location, type, fill_level, status) VALUES (?, ?, ?, ?)');
        insertBin.run('Main Library Entrance', 'Recyclable', 85, 'Full');
        insertBin.run('Cafeteria North', 'Wet', 45, 'Medium');
        insertBin.run('Science Block A', 'Dry', 20, 'Low');
        insertBin.run('Dormitory Plaza', 'Recyclable', 95, 'Full');
        insertBin.run('Sports Complex', 'Dry', 60, 'Medium');
        insertBin.finalize();
      }
    });
  });
}

// ----------------- API Routes -----------------
app.get('/check', (req, res) => {
  res.send("Route working!");
});

// Get all bins
app.get('/api/bins', (req, res) => {
  db.all('SELECT * FROM bins', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Submit a report
app.post('/api/reports', (req, res) => {
  const { location, description, image_url } = req.body;
  db.run(
    'INSERT INTO reports (location, description, image_url) VALUES (?, ?, ?)',
    [location, description, image_url || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Report submitted successfully' });
    }
  );
});

// Get all reports
app.get('/api/reports', (req, res) => {
  db.all('SELECT * FROM reports ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Delete a report
app.delete('/api/reports/:id', (req, res) => {
  db.run('DELETE FROM reports WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Report deleted successfully', changes: this.changes });
  });
});

// Total waste stats (dummy)
app.get('/api/stats', (req, res) => {
  res.json({
    total_collected: { daily: 450, weekly: 3150 },
    segregation: { wet: 35, dry: 40, recyclable: 25 },
    historical: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      wet: [45,52,48,61,55,67,42],
      dry: [38,44,42,53,49,58,35],
      recyclable: [25,28,24,32,29,36,22]
    },
    sustainability_score: 82,
    trend: '+5%'
  });
});

// Settings API (mock)
let userSettings = { notifications:true, eco_goal:90, language:'English', theme:'Eco-Default' };
app.get('/api/settings', (req,res)=>res.json(userSettings));
app.post('/api/settings', (req,res)=>{
  userSettings = {...userSettings, ...req.body};
  res.json({ message:'Settings updated successfully', data:userSettings });
});

// Notifications
app.get('/api/notifications', (req,res)=>{
  res.json({ data:[
    {id:1,type:'alert',message:'Main Library Recyclable bin is full. Needs cleaning.'},
    {id:2,type:'awareness',message:'Did you know? Recycling 1 ton of paper saves 17 trees.'},
    {id:3,type:'alert',message:'Dormitory Plaza Recyclable bin is full.'},
    {id:4,type:'success',message:'Campus sustainability score improved by 5% this week!'}
  ]});
});

// ----------------- Supabase Route -----------------
app.get('/supabase-data', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('waste_reports') // <-- Replace with your Supabase table name
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Start Server -----------------
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on http://0.0.0.0:${PORT}`));