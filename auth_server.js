const express = require('express')
const path = require('path')
const bp = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const User = require('./model/user')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const request = require('request-promise')
require('dotenv').config()

app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bp.json())
app.use(cors())
const port = process.env.PORT || 9999
// no ones skould know this secret super important
const JWT_SECRET = process.env.JWT_SECRET

mongoose.connect(process.env.DB_CRED, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.listen(port, async () => {
    console.log('current PORT:'+port)
})

app.get('/',async (req,res) =>{
    res.send({"hello":"iam working"})
})

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    // password encription hashing the passwords.
    // bcrypt, md5, sha1, sha255, sha512 .... so many algorithms.
    // no collision
    // algorithm should not be very fast to prevent boot force
    var result = null
    var { username, password } = req.body
    try {
        if (typeof username !== 'string' || !username) {
            result = { error: 'user invalid' }
        }
        else if (typeof password !== 'string' || !password) {
            result = { error: 'password invalid' }
        }
        else {
            if (password.length < 6) {
                result = { error: 'password name must be more then or equal to 6 letters.' }
            } else {
                password = await bcrypt.hash(password, 5)
                result = await User.create({
                    username, password
                })
                console.log("Register worked fine")
                result = { status: "ok" }
            }

        }
    }
    catch (error) {
        if (error.code === 11000) {
            console.log('duplicate error')
        }
        console.log(error)
    }
    res.send(result)
})

app.post('/api/login', async (req, res) => {
    // login is based on JWT 
    // client share (JWT)
    // server share (cookie) every time cookies will be shared.
    var { username, password } = req.body
    const user = await User.findOne({ username }).lean()
    if (!user) {
        res.json({ satus: 'error', data: 'username/password is wrong' })
    }
    else if (await bcrypt.compare(password, user.password)) {
        // only use nonsecuret thing to create a jwt
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            JWT_SECRET
        )
        const fromservice = null
        console.log("Login worked fine")
        res.json({ satus: 'ok', data: token ,service: fromservice})
    }
    else {
        res.json({ status: 'error', data: 'User name or password is wrong' })
    }
})

app.delete('/', async (req, res) => {
    User.deleteMany({})
    res.json({ status: 'ok', data: 'deleted everything' })
})

app.post('/api/passchange', async (req, res) => {
    try {
        const { token, new_password: plaintext } = req.body
        // gives username and _id from token
        var result = null
        if (typeof plaintext !== 'string' || !plaintext || plaintext.length == 0) {
            console.log('password is not string or empty')
            result = { error: 'new password invalid' }
        }
        if (plaintext.length < 6) {
            console.log('password too small')
            result = { error: 'password name must be more then or equal to 6 letters.' }
        }
        else {
            try {
                console.log('password getting verified')
                const user = await jwt.verify(token, JWT_SECRET)
                const _id = await user.id
                const hashedpassword = await bcrypt.hash(plaintext, 5)
                await User.updateOne(
                    { _id },
                    {
                        $set: { password: hashedpassword }
                    }
                )
                console.log('password updated')
                result = { status: 'ok', data: 'the new password' }
            } catch (error) {
                console.log('some error -1')
                result = { status: 'error', data: error }
            }
        }    
        res.json({"result":result})
    } catch (error) {
        console.log('some error -2')
        res.status(400).json({ status: 'error', data: error })
    }    
})









        // const options = {
        //     uri: `http://localhost:7071/api/api/`,
        //     json: true,
        //     resolveWithFullResponse: true,
        //     method: 'GET'
        // }
        // const fromservice = await request(options).then((response) => {

        //     return response.body
    
        // }).catch((err) => {
        //     console.log(err);
        //     console.log('errorstatuscode:' + err.statusCode)
        // })
