import express from 'express'
import pool from './db.js'

const app = express()
const PORT = 8000

app.use(express.json()) // Allows parsing of JSON data

// Test route
app.get('/', (req, res) => {
  res.send('Hello, Backend is Running!')
})

// Fetch photos from MySQL
app.get('/photo', async (req, res) => {
  try {
    const { id, full_text, tags } = req.query // Get query parameters
    let query = 'SELECT * FROM photo WHERE 1=1' // Base query
    let queryParams = []

    if (id) {
      query += ' AND id = ?'
      queryParams.push(id)
    }

    if (full_text) {
      query += ' AND full_text LIKE ?'
      queryParams.push(`%${full_text}%`) // Partial match
    }

    if (tags) {
      query += ' AND tags LIKE ?'
      queryParams.push(`%${tags}%`) // Partial match
    }

    const [rows] = await pool.query(query, queryParams)

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' })
    }

    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// Post users from MySQL
app.post('/photo', async (req, res) => {
  try {
    const { event_id, tags, full_text, preview_path, thumbnail_path } = req.body

    const [result] = await pool.query(
      'INSERT INTO photo (event_id, tags, full_text, preview_path, thumbnail_path) VALUES (?, ?, ?, ?, ?)',
      [event_id, tags, full_text, preview_path, thumbnail_path]
    )

    res.json({
      id: result.insertId,
      event_id,
      tags,
      full_text,
      preview_path,
      thumbnail_path,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
