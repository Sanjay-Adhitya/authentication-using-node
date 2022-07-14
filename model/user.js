const mongoose = require('mongoose')

const UserShema = new mongoose.Schema({
    username : {
        type: String, required: true, unique: true
    },
    password : {
        type: String, required: true
    },
    age : {
        type: Number, required: true
    },
    nationality : {
        type: String, required: false
    },
    gender : {
        type: String,required: false
    }
},{ locale: 'en_US', strength: 2 })

const model = mongoose.model('UserShema',UserShema)
module.exports = model