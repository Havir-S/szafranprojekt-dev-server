import mongoose from 'mongoose'

const projectSchema = mongoose.Schema({
    name: {type: String, required: true,  min: 0, max: 600},
    client: {type: mongoose.Schema.Types.ObjectId,
            ref: 'Client'},
    dateStart: {type: Date},
    dateTermin: {type: Date},
    dateZakonczenie: {type: Date},
    doZaplaty: {type: Number, max: 999999},
    numberProjektu: {type: Number, max: 999999},
    zaczete: {type: Boolean},
    skonczone: {type: Boolean},
    dostarczone: {type: Boolean},
    wplacone: {type: Boolean},
    zamkniete: {type: Boolean},
    tags: {type: [String]},
    mapCoords: {type: Object},
    files: {type: [{}]},
    folderPath: {type: String, default: ''},
    filesAreUploaded: {type: Boolean, default: false}


}, {timestamps: true, strict: false})

const Project = mongoose.model('Project', projectSchema)

export default Project;