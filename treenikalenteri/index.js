const express = require('express')
const cors = require('cors')
const app = express()
const { supabase } = require("./database.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();

app.use(express.json())
app.use(cors())


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token puuttuu' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token ei kelpaa' })
        }

        req.user = user
        next()
    })
}

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    const password_hash = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
        .from('profiles')
        .insert([{ username, email, password_hash }])
        .select()

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.status(201).json(data)
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    if (users.length === 0) {
        return res.status(401).json({ error: 'Väärä email tai salasana' })
    }

    const user = users[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
        return res.status(401).json({ error: 'Väärä email tai salasana' })
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({
        message: 'Kirjautuminen onnistui',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    })
})

app.get('/workouts', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', req.user.id)

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json(data)
})

app.post('/workouts', authenticateToken, async (req, res) => {
    const {
        date,
        sport,
        duration_minutes,
        distance_km,
        intensity_zone,
        comment
    } = req.body

    const { data, error } = await supabase
        .from('workouts')
        .insert([
            {
                user_id: req.user.id,
                date,
                sport,
                duration_minutes,
                distance_km,
                intensity_zone,
                comment
            }
        ])
        .select()

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.status(201).json(data)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
