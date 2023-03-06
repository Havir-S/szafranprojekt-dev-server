import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    title: {type: String, required: true,  min: 0, max: 100},
    message: {type: String, required: true, min: 5, max: 600},
    email: {type: Email, required: true,  min: 5, max: 600},
    workType: {type:String, max: 100},
    telephone: {type:String, required: true, max: 15},

}, {timestamps: true})

const Message = mongoose.model('Message', messageSchema)

export default Message;