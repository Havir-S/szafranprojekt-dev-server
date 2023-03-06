import mongoose from 'mongoose'

const clientSchema = mongoose.Schema({
    title: {type: String, required: true, min: 0, max: 200},
    email: {type: String, min: 0, max: 200},
    telefon: {type: String, min: 0, max: 15},
    uuid: {type: String, required: true},
    note: {type: String},
    folderPath: {type: String},
    smallPicture: {type: String},
    projects: {
        type: [String],
        default: []
    },


}, {timestamps: true})

const Client = mongoose.model('Client', clientSchema)

export default Client;