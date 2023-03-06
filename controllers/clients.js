import mongoose from 'mongoose';
import Client from '../models/client.js'
import Project from '../models/project.js'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const pathDefault = 'C:'

export const getAllClientsNamesOnly = async (req,res) => {

    
    try {

        const clients = await Client.find({}, {name: 1, title: 1})
        res.status(200).json(clients)
    } catch (err) {
        console.log(err)
    }
}

export const getAllClients = async (req,res) => {
    // const { id} = req.params.id
    const { strona } = req.query;
    // console.log(strona)
    const LIMIT = 8;
    const startIndex = (Number(strona) - 1) * LIMIT; //get the starting index of every page
    
    try {
        const total = await Client.countDocuments({})
        const clients = await Client.find().sort({createdAt: -1}).limit(LIMIT).skip(startIndex);
        res.status(200).json({clients, numberOfPages: Math.ceil(total / LIMIT)})
    } catch (err) {
        // console.log(err)
    }
}

export const createNewClient = async (req, res) => {
    const {email, name, picture, telefon, note} = req.body;
    //IF ANY ERROR OCCURS, DO NOT SAVE THE DOCUMENT - It will be the last requirement before accepting it
    const errorCheck = null;
    
    try {
        //generate uuid and newClient
        let newUUID = uuidv4();
        
        let newClient;

        //find if no copy of uuid and replace if so
        let potentialCopy = await Client.findOne({uuid: newUUID})
        while (potentialCopy !== null) {
            newUUID = uuidv4();
            potentialCopy = await Client.findOne({uuid: newUUID})
        }

        //////////////////////////////////////////////
        // CHECK IF MAIN FOLDER szafranprojekt exists - MAKE FOLDER
        //////////////////////////////////////////////

        if (fs.existsSync(`${pathDefault}\\szafranprojekt`)) {

                    //IT EXISTS, CONTINUE
                    console.log(`${pathDefault}\\szafranprojekt exists`)
                } else {
                    //IF NOT, CREATE IT
                    console.log(`${pathDefault}\\szafranprojekt does not exist, had to create it`)
                    fs.mkdirSync(`${pathDefault}\\szafranprojekt`), {recursive: true}, async (err) => {
                        if (err) {
                            console.log(err)
                            errorCheck = err;
                        }
                    }
                    
                }

        //////////////////////////////////////////////
        // CHECK IF CLIENTS FOLDER szafranprojekt exists - MAKE FOLDER
        //////////////////////////////////////////////

        if (fs.existsSync(`${pathDefault}\\szafranprojekt\\clients`)) {

            //IT EXISTS, CONTINUE
            console.log(`${pathDefault}\\szafranprojekt\\clients exists`)
        } else {
            //IF NOT, CREATE IT
            console.log(`${pathDefault}\\szafranprojekt\\clients does not exist, had to create it`)
            fs.mkdirSync(`${pathDefault}\\szafranprojekt\\clients`), {recursive: true}, async (err) => {
                if (err) {
                    console.log(err)
                    errorCheck = err;
                }
            }
            
        }

        //without picture
        if (picture === '') {
            newClient = new Client({email: email.toLowerCase(), note, title: name, telefon, folderPath: `${pathDefault}\\szafranprojekt\\clients\\${newUUID}`, uuid: newUUID, })
            await newClient.save()



            //WE STILL CREATE THE FOLDER IF IN FUTURE PIC GONNA BE UPLOADED
            fs.mkdirSync((`${pathDefault}\\szafranprojekt\\clients\\${newUUID}`),
            { recursive: true }, async (err) => {
            if (err) {

                //IF SOMETHING WENT WRONG DELETE USER
                errorCheck = err;
                await Client.deleteOne({uuid: newUUID})
                return console.error(err);
            }
            });

        } else {
        //has picture

        //WE STILL CREATE THE FOLDER - MAY BE USEFUL LATER
        fs.mkdirSync((`${pathDefault}\\szafranprojekt\\clients\\${newUUID}`),
        { recursive: true }, async (err) => {
        if (err) {

            //IF SOMETHING WENT WRONG DELETE USER
            errorCheck = err;
            await Client.deleteOne({uuid: newUUID})
            return console.error(err);
        }
        });
        ////////////////////////////////////
        //MAKE SMALL PICTURE
        ////////////////////////////////////
        const pictureBase64ForSharp = Buffer.from(picture.base64.replace(/^.+\,/, ""), 'base64')
        let smallPicture;
        await sharp(pictureBase64ForSharp)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center',
              })
            // .toFile(`${pathDefault}\\${newUUID}\\${newUUID}.png`, (err) => {console.log(err)})
            .toBuffer()
            .then(response => {
                
                smallPicture = response
            })

            newClient = await new Client({smallPicture: `data:image/png;base64,${smallPicture.toString('base64')}` ,email, note, title: name, telefon, folderPath: `${pathDefault}\\szafranprojekt\\clients\\${newUUID}`,  uuid: newUUID})


            

            //////////////////////////////
            //HERE ALL ERRORS GO
            //////////////////////////////
            if (errorCheck === null) {
                console.log('no errors, can save all')
                ///////////////////////////
                //SAVE NEW PROJECT
                ///////////////////////////
                await newClient.save();
                res.status(200).json({message: 'Klient przyjety!'})
            } else {
                console.log('errors, sending them to user')
                fs.rmSync(`${pathDefault}\\szafranprojekt\\clients\\${newUUID}`, { recursive: true, force: true });
                res.status(300).json({message: errorCheck})
            }
            
            //WRITE THE UPLOADED PICTURE IN IT
            // const pictureBase64 = picture.base64.replace(/^.+\,/, "");
            

            //naming it here so it doesnt have to be called twice in 2 functions below
            

            ////// NO NEED FOR BIG PICTURE ANYWAY
            // fs.writeFile(
            //     (`${pathDefault}\\${newUUID}\\${picture.name}`),
            //     pictureBase64,
            //     'base64',
            //     async function(err) {
            //         if (err) {
            //             console.log(err)
            //             //IF SOMETHING WENT WRONG DELETE USER
            //             await Client.deleteOne({uuid: newUUID})
            //         }
                    
            //     }
            // )

        //     const pictureBase64ForSharp = Buffer.from(pictureBase64, 'base64')

        // sharp(pictureBase64ForSharp)
        //     .resize(200, 200, {
        //         fit: 'cover',
        //         position: 'center',
        //       })
        //     .toFile(`${pathDefault}\\${newUUID}\\${newUUID}.png`, (err) => {console.log(err)});
            
        //RESIZE IT ============================================ MIGHT NEED AN UPDATE FOR USING THE USER REQ.BODY INSTEAD OF ALREADY WRITTEN FILE
        //FIXED

        }


        
    } catch (err) {
        console.log(err)
    }


}

export const deleteClient = async (req,res) => {

    

    try {
        //FIND THE PROPER CLIENT
        const clientToDelete = await Client.findById(req.params.id);
        console.log(clientToDelete)
    
        ///////////////////////////////
        //DELETE ALL PROJECTS AND FOLDERS OF THAT CLIENT
        ///////////////////////////////
        clientToDelete.projects.forEach(async (item) => {
            console.log(item)
            const projectToDelete = await Project.findById({_id: item});
            console.log(projectToDelete)

            //JEŻELI PROJEKT POSIADA PATH/FOLDER/FILES USUŃ
            if (projectToDelete.folderPath !== '') {
                fs.rmSync(projectToDelete.folderPath, {force: true, recursive: true})
            }

    
            await projectToDelete.remove();
        })

        await clientToDelete.remove()
        res.status(200).json({message: 'Client deleted with all their projects.'})
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
    

}

export const updateClient = async (req,res) => {
    console.log(req.params.id)
    console.log(req.body)

    try {
        const clientToUpdate = await Client.findByIdAndUpdate(req.params.id)
        console.log(clientToUpdate)
        //IF NO NEW PIC
        if (req.body.smallPicture === '') {
            await clientToUpdate.update({title: req.body.title, email: req.body.email, telefon: req.body.telefon, note: req.body.note})    
        } else {
            //IF NEW PIC
            await clientToUpdate.update({title: req.body.title, email: req.body.email, telefon: req.body.telefon, note: req.body.note, smallPicture: req.body.smallPicture})    
        }

        res.status(200)
    } catch (err) {
        console.log(err)
        res.status(500)
    }

    
}