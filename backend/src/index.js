import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { supabase } from './supabaseClient.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Example: fetch products from Supabase
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running at http://localhost:${port}`)
})
