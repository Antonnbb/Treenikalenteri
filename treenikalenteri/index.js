const express = require('express')
const cors = require('cors')
const app = express()
const { supabase } = require("./database.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();

app.use(express.json())
app.use(cors())


async function verifyCaptcha(captcha) {
    const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`,
        { method: 'POST' }
    )

    const data = await response.json()
    return data.success
}

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
    const { username, email, password, captcha } = req.body

    const captchaOk = await verifyCaptcha(captcha)

    if (!captchaOk) {
        return res.status(400).json({ error: 'Captcha epäonnistui' })
    }

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
    const { email, password, captcha } = req.body

    const captchaOk = await verifyCaptcha(captcha)

    if (!captchaOk) {
        return res.status(400).json({ error: 'Captcha epäonnistui' })
    }

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
        .select(`
            *,
            workout_zones (
                zone,
                minutes
            )
        `)
        .eq('user_id', req.user.id)
        .order('date', { ascending: false })

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json(data)
})

app.get('/profile', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', req.user.id)
        .single()

    if (error) return res.status(500).json({ error: error.message })

    res.json(data)
})

app.put('/profile', authenticateToken, async (req, res) => {
    const { username, coach_email, is_public } = req.body

    const { data, error } = await supabase
        .from('profiles')
        .update({ username, coach_email, is_public })
        .eq('id', req.user.id)
        .select()

    if (error) return res.status(500).json({ error: error.message })

    res.json(data)
})

app.post('/workouts', authenticateToken, async (req, res) => {
    const {
        date,
        sport,
        duration_minutes,
        distance_km,
        comment,
        zones
    } = req.body

    // 1. tallenna treeni
    const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
            user_id: req.user.id,
            date,
            sport,
            duration_minutes,
            distance_km,
            comment
        })
        .select()
        .single()

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    // 2. tallenna tehoalueet
    if (zones && zones.length > 0) {
        const zoneData = zones.map(z => ({
            workout_id: workout.id,
            zone: z.zone,
            minutes: z.minutes
        }))

        const { error: zoneError } = await supabase
            .from('workout_zones')
            .insert(zoneData)

        if (zoneError) {
            return res.status(500).json({ error: zoneError.message })
        }
    }

    res.status(201).json(workout)
})

app.delete('/workouts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params

    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id)

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Treeni poistettu' })
})

app.put('/workouts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params

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
        .update({
            date,
            sport,
            duration_minutes,
            distance_km,
            intensity_zone,
            comment
        })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json(data)
})

app.post('/shares', authenticateToken, async (req, res) => {
    const { email } = req.body

    const { data: viewer, error: viewerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (viewerError || !viewer) {
        return res.status(404).json({ error: 'Käyttäjää ei löytynyt' })
    }

    const { data, error } = await supabase
        .from('sharing_permissions')
        .insert([
            {
                owner_id: req.user.id,
                viewer_id: viewer.id
            }
        ])
        .select()

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.status(201).json(data)
})

app.get('/shares', authenticateToken, async (req, res) => {
    const { data: permissions, error } = await supabase
        .from('sharing_permissions')
        .select('viewer_id')
        .eq('owner_id', req.user.id)

    if (error) return res.status(500).json({ error: error.message })

    const viewerIds = permissions.map(p => p.viewer_id)

    if (viewerIds.length === 0) {
        return res.json([])
    }

    const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('email')
        .in('id', viewerIds)

    if (usersError) return res.status(500).json({ error: usersError.message })

    res.json(users)
})

app.get('/shared-workouts', authenticateToken, async (req, res) => {
    const { data: permissions, error } = await supabase
        .from('sharing_permissions')
        .select('owner_id')
        .eq('viewer_id', req.user.id)

    if (error) return res.status(500).json({ error: error.message })

    const ownerIds = permissions.map(p => p.owner_id)

    if (ownerIds.length === 0) return res.json([])

    const { data, error: workoutError } = await supabase
        .from('workouts')
        .select(`
            *,
            profiles:user_id (
                username,
                email
            )
        `)
        .in('user_id', ownerIds)
        .order('date', { ascending: false })

    if (workoutError) {
        return res.status(500).json({ error: workoutError.message })
    }

    res.json(data)
})

app.delete('/shares/:email', authenticateToken, async (req, res) => {
    const viewerEmail = req.params.email

    const { data: viewer, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', viewerEmail)
        .single()

    if (userError || !viewer) {
        return res.status(404).json({ error: "Käyttäjää ei löytynyt" })
    }

    const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('owner_id', req.user.id)
        .eq('viewer_id', viewer.id)

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json({ message: "Jako poistettu" })
})

app.get("/sports", authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from("sports")
        .select("*")
        .eq("user_id", req.user.id)
        .order("name")

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    res.json(data)
})

app.post("/sports", authenticateToken, async (req, res) => {
    const { name } = req.body

    const { data, error } = await supabase
        .from("sports")
        .insert({
            user_id: req.user.id,
            name
        })
        .select()

    if (error) {
        return res.json({ message: "Laji on jo olemassa" })
    }

    res.json(data)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
