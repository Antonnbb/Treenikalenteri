const express = require('express')
const cors = require('cors')
const app = express()
const { supabase } = require("./database.js");
require('dotenv').config();

app.use(express.json())
app.use(cors())





const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})