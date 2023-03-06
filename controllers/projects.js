import mongoose from 'mongoose';

import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import Project from '../models/project.js'
import Client from '../models/client.js'
import mv from 'mv'

const pathDefault = 'C:\\szafranprojekt'

export const getProjectWithId = async (req,res) => {
    console.log(req.params.id)
    res.status(200)
    try {
        const project = await Project.findById(req.params.id).lean().populate('client', 'title')
        // console.log(project)
        res.status(200).json(project)
    } catch (err) {
        console.log(err)
        res.status(500).json({err, message: 'Błąd'})
    }
}

export const getAllProjectsTEST = async (req,res) => {

    
    try {
        const projects = await Project.find()
        res.status(200).json({projects})
        console.log(projects)
    } catch (err) {
        console.log(err)
    }
}

export const getProjectsMaps = async (req,res) => {
    try {
        const allMaps = await Project.find({}, {mapCoords: 1, color: 1, name: 1, dateStart: 1})
        // console.log(allMaps)
        res.status(200).json(allMaps)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}



export const getAllProjects = async (req,res) => {
    // const { id} = req.params.id
    const { strona } = req.query;
    // console.log(strona)
    const LIMIT = 8;
    const startIndex = (Number(strona) - 1) * LIMIT; //get the starting index of every page
    
    try {
        const total = await Project.countDocuments({})
        const projects = await Project.find().sort({createdAt: -1}).limit(LIMIT).skip(startIndex).lean().populate('client', 'title');
        res.status(200).json({projects, numberOfPages: Math.ceil(total / LIMIT)})
        // console.log(projects)
    } catch (err) {
        console.log(err)
    }
}

export const createNewProject = async (req, res) => {
    
    // FILES ARE GOING TO BE CREATED, but we won't attach them to the Project document, we will only save file PATHS so they can be sent later on
   
    //IF ANY ERROR OCCURS, DO NOT SAVE THE DOCUMENT - It will be the last requirement before accepting it
    const errorCheck = null;

    //DATE FOR ORGANISING FOLDERS - IT WILL BE FILLED WITH EITHER dateStart from user, or naturally by the new Date()
    let navigateDate, userIdIfNeededToDelete;
    try {


        
        //MAKE THE DOCUMENT -- NOT STRICT SO WE CAN USE _id as a saving point for the folder

        //GET ID FROM THE CLIENT FIELD (it's broken from MUI and that's the only way we can work around it)
        //CLient id however can't really be changed by the user as they have to CLICK on the chosen client, so even if they delete and try to chose other, the id stays,
        const regexpForClientId = new RegExp(/ID:([a-z0-9]+)/);
        if (regexpForClientId.test(req.body.client)) {
            const potentialClient = await Client.findById(req.body.client.match(regexpForClientId)[1])
            
            //THERE IS A CLIENT LIKE THAT
            if (potentialClient !== null) {

                
 
              //START PREDEFINING THE PROJECT DOCUMENT
                let newProject = new Project({...req.body, files: [], client: req.body.client.match(regexpForClientId)[1]});
                userIdIfNeededToDelete = newProject.id;
                ////////////////////////////////
                //Create a organised/sorted path for the project - if there's a START DATE, use it, if not, use today
                ////////////////////////////////
                
                if (req.body?.dateStart) {
                    // console.log(new Date(req.body.dateStart))
                    navigateDate = new Date(req.body.dateStart)
                } else {
                    navigateDate = new Date()
                }

                

                //////////////////////////////////////////////
                //PREPARE PATHS FOR FILES
                //////////////////////////////////////////////
                //THERE ARE FILES ==============================================================================================================================================
                const newProjectFiles = [];
                if (req.body.files.length > 0) {

                    if (fs.existsSync('C:\\szafranprojekt')) {
                        // console.log('exists')
                    }
                    //////////////////////////////////////////////
                    // CHECK IF MAIN FOLDER szafranprojekt exists - MAKE FOLDER
                    //////////////////////////////////////////////
                    if (fs.existsSync(`${req.body.disk}:\\szafranprojekt`)) {
    
                        //IT EXISTS, CONTINUE
                        // console.log(`${req.body.disk}:\\szafranprojekt exists`)
                    } else {
                        //IF NOT, CREATE IT
                        // console.log(`${req.body.disk}:\\szafranprojekt does not exist, had to create it`)
                        fs.mkdirSync(`${req.body.disk}:\\szafranprojekt`), {recursive: true}, async (err) => {
                            if (err) {
                                console.log(err)
                                errorCheck = err;
                            }
                        }
                    }
    
                    //////////////////////////////////////////////
                    // CHECK IF YEAR FOLDER EXISTS - MAKE FOLDER
                    //////////////////////////////////////////////
                    if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}`)) {
    
                        //IT EXISTS, CONTINUE
                        // console.log(`${navigateDate.getFullYear()} exists`)
                    } else {
                        //IF NOT, CREATE IT
                        // console.log(`${navigateDate.getFullYear()} does not exist, had to create it`)
                        fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}`), {recursive: true}, async (err) => {
                            if (err) {
                                console.log(err)
                                errorCheck = err;
                            }
                        }
                        // console.log(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()} does not exist, had to create it`)
                    }
    
                    //////////////////////////////////////////////
                    // CHECK IF MONTH FOLDER EXISTS - MAKE FOLDER
                    //////////////////////////////////////////////
    
                    if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}`)) {
    
                        //IT EXISTS, CONTINUE
                        // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} exists`)
                    } else {
                        //IF NOT, CREATE IT
                        // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} does not exist, had to create it`)
                        fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}`), {recursive: true}, async (err) => {
                            if (err) {
                                console.log(err)
                                errorCheck = err;
                            }
                        }
                    }
    
                    //////////////////////////////////////////////
                    //CREATE PROJECT FOLDER
                    //////////////////////////////////////////////
    
                    if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`)) {
    
                        //IT EXISTS, CONTINUE
                        // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} exists SOMEHOW?`)
                    } else {
                        //IF NOT, CREATE IT
                        // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} does not exist, had to create it`)
                        fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`), {recursive: true}, async (err) => {
                            if (err) {
                                console.log(err)
                                errorCheck = err;
                            }
                        }
                     
                        
                    }
                    ///////////////////////////////////////////////
                    //SET EASY PATH FOR FINDING FOLDER LATER ON
                    ///////////////////////////////////////////////
                    newProject.folderPath = `${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`;

                    for(let file of req.body.files) {
                        const fileBase64 = file.base64.replace(/^.+\,/, "");
                        newProjectFiles.push(
                            {
                                name: file.name,
                                size: file.size,
                                path: `${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}\\${file.name}`
                            }
                        )
                        // console.log(newProjectFiles)
    
                        //////////////////////////////////////////////
                        //WRITE THE FILES
                        //////////////////////////////////////////////
                        fs.writeFileSync(
                            (`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}\\${file.name}`),
                            fileBase64,
                            'base64',
                            async function(err) {
                                if (err) {
                                    // console.log(err)
                                    console.log('There was an error')
                                    errorCheck = err;
                                    //IF SOMETHING WENT WRONG DELETE PROJECT
                                    fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`, { recursive: true, force: true });
                                } 
                                }
                             )
                         }
                         //SO NO MORE UPLOADS CAN BE MADE
                         newProject.filesAreUploaded = true;

                         ///////////////////////////
                        //SWAP OUT THE REAL FILES OBJECT WITH JUST PATHS
                        ///////////////////////////
                         newProject.files = newProjectFiles;

                         // FILES HAVE NOT BEEN UPLOADED, USER CAN UPLOADED THEM ANYTIME LATER BUT ONLY ONCE =======================================================================
                         } else {
                            console.log('NO FILES TO UPLOAD')
                         }


                        //////////////////////////////
                        //HERE ALL ERRORS GO
                        //////////////////////////////
                        if (errorCheck === null) {
                            // console.log('no errors, can save all')
                            ///////////////////////////
                            //SAVE NEW PROJECT
                            ///////////////////////////
                            await newProject.save();

                            //////////////////////////////
                            //PUT THE PROJECT ID INTO CLIENT's PROJECTS ARRAY
                            //////////////////////////////
                            const client = await Client.findById(newProject.client);
                            // console.log('found client, adding to array')

                            client.projects.push(newProject._id)
                            // console.log(client)

                            await Client.findByIdAndUpdate(newProject.client, client);

                            res.status(200).json({message: 'Projekt przyjety!'})
                        } else {
                            // console.log('errors, sending them to user and removing the project folder!')
                            fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`, { recursive: true, force: true });
                            res.status(300).json({message: errorCheck})
                        }
                    }
                }

               
       
    } catch(err) {
        console.log(err)
        res.status(300).json({message: errorCheck})
        fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${userIdIfNeededToDelete}`, { recursive: true, force: true });
    }
  


}

//ALMOST THE OLD ONE
// export const createNewProject = async (req, res) => {
    
//     // FILES ARE GOING TO BE CREATED, but we won't attach them to the Project document, we will only save file PATHS so they can be sent later on
   
//     //IF ANY ERROR OCCURS, DO NOT SAVE THE DOCUMENT - It will be the last requirement before accepting it
//     const errorCheck = null;

//     //DATE FOR ORGANISING FOLDERS - IT WILL BE FILLED WITH EITHER dateStart from user, or naturally by the new Date()
//     let navigateDate, userIdIfNeededToDelete;
//     try {


        
//         //MAKE THE DOCUMENT -- NOT STRICT SO WE CAN USE _id as a saving point for the folder

//         //GET ID FROM THE CLIENT FIELD (it's broken from MUI and that's the only way we can work around it)
//         //CLient id however can't really be changed by the user as they have to CLICK on the chosen client, so even if they delete and try to chose other, the id stays,
//         const regexpForClientId = new RegExp(/ID:([a-z0-9]+)/);
//         if (regexpForClientId.test(req.body.client)) {
//             const potentialClient = await Client.findById(req.body.client.match(regexpForClientId)[1])
            
//             //THERE IS A CLIENT LIKE THAT
//             if (potentialClient !== null) {

                
 
//               //START PREDEFINING THE PROJECT DOCUMENT
//                 let newProject = new Project({...req.body, files: [], client: req.body.client.match(regexpForClientId)[1]});
//                 userIdIfNeededToDelete = newProject.id;
//                 ////////////////////////////////
//                 //Create a organised/sorted path for the project - if there's a START DATE, use it, if not, use today
//                 ////////////////////////////////
                
//                 if (req.body?.dateStart) {
//                     // console.log(new Date(req.body.dateStart))
//                     navigateDate = new Date(req.body.dateStart)
//                 } else {
//                     navigateDate = new Date()
//                 }

//                 if (fs.existsSync('C:\\szafranprojekt')) {
//                     // console.log('exists')
//                 }
//                 //////////////////////////////////////////////
//                 // CHECK IF MAIN FOLDER szafranprojekt exists - MAKE FOLDER
//                 //////////////////////////////////////////////
//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${req.body.disk}:\\szafranprojekt exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${req.body.disk}:\\szafranprojekt does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                 }

//                 //////////////////////////////////////////////
//                 // CHECK IF YEAR FOLDER EXISTS - MAKE FOLDER
//                 //////////////////////////////////////////////
//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()} exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                     // console.log(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()} does not exist, had to create it`)
//                 }

//                 //////////////////////////////////////////////
//                 // CHECK IF MONTH FOLDER EXISTS - MAKE FOLDER
//                 //////////////////////////////////////////////

//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                 }

//                 //////////////////////////////////////////////
//                 //CREATE PROJECT FOLDER
//                 //////////////////////////////////////////////

//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} exists SOMEHOW?`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
                 
                    
//                 }
//                 ///////////////////////////////////////////////
//                 //SET EASY PATH FOR FINDING FOLDER LATER ON
//                 ///////////////////////////////////////////////
//                 newProject.folderPath = `${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`;

//                 //////////////////////////////////////////////
//                 //PREPARE PATHS FOR FILES
//                 //////////////////////////////////////////////
//                 //THERE ARE FILES ==============================================================================================================================================
//                 const newProjectFiles = [];
//                 if (req.body.files.length > 0) {
//                     for(let file of req.body.files) {
//                         const fileBase64 = file.base64.replace(/^.+\,/, "");
//                         newProjectFiles.push(
//                             {
//                                 name: file.name,
//                                 size: file.size,
//                                 path: `${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}\\${file.name}`
//                             }
//                         )
//                         // console.log(newProjectFiles)
    
//                         //////////////////////////////////////////////
//                         //WRITE THE FILES
//                         //////////////////////////////////////////////
//                         fs.writeFileSync(
//                             (`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}\\${file.name}`),
//                             fileBase64,
//                             'base64',
//                             async function(err) {
//                                 if (err) {
//                                     // console.log(err)
//                                     console.log('There was an error')
//                                     errorCheck = err;
//                                     //IF SOMETHING WENT WRONG DELETE PROJECT
//                                     fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`, { recursive: true, force: true });
//                                 } 
//                                 }
//                              )
//                          }
//                          //SO NO MORE UPLOADS CAN BE MADE
//                          newProject.filesAreUploaded = true;

//                          ///////////////////////////
//                         //SWAP OUT THE REAL FILES OBJECT WITH JUST PATHS
//                         ///////////////////////////
//                          newProject.files = newProjectFiles;

//                          // FILES HAVE NOT BEEN UPLOADED, USER CAN UPLOADED THEM ANYTIME LATER BUT ONLY ONCE =======================================================================
//                          } else {

//                          }


//                         //////////////////////////////
//                         //HERE ALL ERRORS GO
//                         //////////////////////////////
//                         if (errorCheck === null) {
//                             // console.log('no errors, can save all')
//                             ///////////////////////////
//                             //SAVE NEW PROJECT
//                             ///////////////////////////
//                             await newProject.save();

//                             //////////////////////////////
//                             //PUT THE PROJECT ID INTO CLIENT's PROJECTS ARRAY
//                             //////////////////////////////
//                             const client = await Client.findById(newProject.client);
//                             // console.log('found client, adding to array')

//                             client.projects.push(newProject._id)
//                             // console.log(client)

//                             await Client.findByIdAndUpdate(newProject.client, client);

//                             res.status(200).json({message: 'Projekt przyjety!'})
//                         } else {
//                             // console.log('errors, sending them to user and removing the project folder!')
//                             fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id}`, { recursive: true, force: true });
//                             res.status(300).json({message: errorCheck})
//                         }
//                     }
//                 }

               
       
//     } catch(err) {
//         console.log(err)
//         res.status(300).json({message: errorCheck})
//         fs.rmSync(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${userIdIfNeededToDelete}`, { recursive: true, force: true });
//     }
  


// }

export const deleteProjectWithId = async (req,res) => {

    try {
        //FIND USER WITH ID
        const projectToDelete = await Project.findById(req.params.id)
        
        //GET PROJECT FILES FOLDER PATH AND DELETE IT IF HE HEAS FILES
        if (projectToDelete.folderPath) {
            fs.rmSync(projectToDelete.folderPath, { recursive: true, force: true });
        }
        
    
        //find client and delete the specific project from the client projects array
        const client = await Client.findById(projectToDelete.client, {projects: 1});
        
        console.log(client)
        const projects = client.projects.filter((id) => id !== String(req.params.id));
        // await client.update(projects);

        //////////////////////////////////////////////////////////////////////////////////////////////// MUST FIND BETTER WAY TO UPDATE, MONGOOSE DUMDUM BRAIN GO BRRR
        await client.update({projects});
        // console.log(client)
    
        //REMOVE THE DOCUMENT ITSELF
        await projectToDelete.remove();
        res.status(200).json({message: 'Deleted User'})
    } catch (err) {
        console.log(err)
    }
    
}

export const updateProject = async (req,res) => {
    console.log('ding')
    
    try {

        const projectToUpdate = await Project.findByIdAndUpdate(req.params.id)
        // console.log(clientToUpdate)
        let updatePatch = {
            name: req.body.name,
            doZaplaty: req.body.doZaplaty,
            numberProjektu: req.body.numberProjektu,
            zaczete: req.body.zaczete,
            skonczone: req.body.skonczone,
            dostarczone: req.body.dostarczone,
            wplacone: req.body.wplacone,
            zamkniete: req.body.zamkniete,
            dateStart: req.body.dateStart,
            dateTermin: req.body.dateTermin,
            dateZakonczenie: req.body.dateZakonczenie,
            disk: req.body.disk
        }

        let newFiles = [];
        const changeDiskRegexp = new RegExp(/^[a-zA-Z]:/)

        //CHECK IF THERE ARE ANY TAGS DIFFERENCE
        if (req.body.tags !== projectToUpdate.tags) {
            updatePatch.tags = req.body.tags
        }

        //CHECK IF THERE ARE ANY CLIENT DIFFERENCE
        //THERE IS CLIENT DIFFERENCE
        if (req.body.client !== '') {
            

            //CHECK IF NEW CLIENT ID IS OK
            const regexpForClientId = new RegExp(/ID:([a-z0-9]+)/);
        if (regexpForClientId.test(req.body.client)) {
            const potentialClient = await Client.findById(req.body.client.match(regexpForClientId)[1])
            
            //THERE IS A CLIENT LIKE THAT
            if (potentialClient !== null) {

                //ASSIGN THE NEW CLIENT TO THE UPDATE
                updatePatch.client = req.body.client.match(regexpForClientId)[1]
                
                //ASSIGN THE PROJECT TO THE CLIENT
                let newArray = potentialClient.projects;
                newArray.push(req.params.id)
                await potentialClient.update({projects: newArray});

                //DELETE THE PROJECT FROM THE PREVIOUS CLIENT
                const oldClient = await Client.findById(projectToUpdate.client)
                let projects = oldClient.projects.filter((id) => id !== String(req.params.id));
                await oldClient.update({projects})
            }
         }
        }
        ////////////////////////////////////////////////////////////////
        //////////////////////// FILES WERE UPLOADED BEFORE, NO MORE UPLOADING
        ////////////////////////////////////////////////////////////////
        if (projectToUpdate.filesAreUploaded === true) {
            console.log('files were already uploaded, only data can be changed now')
        } else if (projectToUpdate.filesAreUploaded === false && req.body.files.length > 0 && req.body.disk !== '') {
        ////////////////////////////////////////////////////////////////
        //////////////////////// WE HAVE FILES AND WE WILL UPLOAD THEM
        ////////////////////////////////////////////////////////////////
        console.log('files were NOT uploaded, CAN STILL UPLOAD')

        console.log(projectToUpdate.folderPath)
            console.log( 'disk is: ', req.body.disk)
            
            updatePatch.folderPath = `${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}\\${new Date(updatePatch.dateStart).getMonth()}\\${projectToUpdate.id}`
            console.log(projectToUpdate.folderPath)
       

            ///////////////////////////////////////////////////////////////////////\
            ///////////////////////////////////////////////////////////////////////
            ////////// CREATE NEW FOLDERS
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////

                //////////////////////////////////////////////
                // CHECK IF MAIN FOLDER szafranprojekt exists - MAKE FOLDER
                //////////////////////////////////////////////
                if (fs.existsSync(`${req.body.disk}:\\szafranprojekt`)) {

                    //IT EXISTS, CONTINUE
                    // console.log(`${req.body.disk}:\\szafranprojekt exists`)
                } else {
                    //IF NOT, CREATE IT
                    // console.log(`${req.body.disk}:\\szafranprojekt does not exist, had to create it`)
                    fs.mkdirSync(`${req.body.disk}:\\szafranprojekt`), {recursive: true}, async (err) => {
                        if (err) {
                            console.log(err)
                            errorCheck = err;
                        }
                    }
                }

                //////////////////////////////////////////////
                // CHECK IF YEAR FOLDER EXISTS - MAKE FOLDER
                //////////////////////////////////////////////
                if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}`)) {

                    //IT EXISTS, CONTINUE
                    // console.log(`${navigateDate.getFullYear()} exists`)
                } else {
                    //IF NOT, CREATE IT
                    // console.log(`${navigateDate.getFullYear()} does not exist, had to create it`)
                    fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}`), {recursive: true}, async (err) => {
                        if (err) {
                            console.log(err)
                            errorCheck = err;
                        }
                    }
                    // console.log(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()} does not exist, had to create it`)
                }

                //////////////////////////////////////////////
                // CHECK IF MONTH FOLDER EXISTS - MAKE FOLDER
                //////////////////////////////////////////////

                if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}\\${new Date(updatePatch.dateStart).getMonth()}`)) {

                    //IT EXISTS, CONTINUE
                    // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} exists`)
                } else {
                    //IF NOT, CREATE IT
                    // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} does not exist, had to create it`)
                    fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}\\${new Date(updatePatch.dateStart).getMonth()}`), {recursive: true}, async (err) => {
                        if (err) {
                            console.log(err)
                            errorCheck = err;
                        }
                    }
                }

                //////////////////////////////////////////////
                //CREATE PROJECT FOLDER
                //////////////////////////////////////////////

                if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}\\${new Date(updatePatch.dateStart).getMonth()}\\${projectToUpdate.id}`)) {

                    //IT EXISTS, CONTINUE
                    // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} exists SOMEHOW?`)
                } else {
                    //IF NOT, CREATE IT
                    // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} does not exist, had to create it`)
                    fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(updatePatch.dateStart).getFullYear()}\\${new Date(updatePatch.dateStart).getMonth()}\\${projectToUpdate.id}`), {recursive: true}, async (err) => {
                        if (err) {
                            console.log(err)
                            errorCheck = err;
                        }
                    }
                }

                ///////////////////////////////////////////////////////////////////////\
            ///////////////////////////////////////////////////////////////////////
            ////////// WRITE NEW FILES IF THERE ARE ANY
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            ///////////////// FOR NEW FILES

            //THERE ARE NEW FILES, WE NEED TO WRITE THEM DOWN
            if (req.body.files.length > 0) {
                req.body.files.forEach(file => {
                    // console.log('New file:', file)
                    const fileBase64 = file.base64.replace(/^.+\,/, "");
                    const newFile = {
                        name: file.name,
                        size: file.size,
                        path: `${updatePatch.folderPath}\\${file.name}`
                    }
                    newFiles.push(newFile)
    
                    fs.writeFileSync(
                        newFile.path,
                        fileBase64,
                        'base64',
                        async function(err) {
                            if (err) {
                                // console.log(err)
                                console.log('There was an error')
                                errorCheck = err;
                                //IF SOMETHING WENT WRONG DELETE PROJECT
                                fs.rmSync(`${updatePatch.folderPath.replace(changeDiskRegexp, `${req.body.disk}:`)}`, { recursive: true, force: true });
                                
                            }
                            
                        }
                    )
                })
            }
            

            updatePatch.files = newFiles;
            updatePatch.filesAreUploaded = true;

        }

        
        await projectToUpdate.update(updatePatch)


        res.status(200)
    } catch (err) {
        console.log(err)
        res.status(500)
    }

}

//OLD BROKEN ONE
// export const updateProject = async (req,res) => {
    
//     try {

//         const projectToUpdate = await Project.findByIdAndUpdate(req.params.id)
//         // console.log(clientToUpdate)
//         let updatePatch = {
//             name: req.body.name,
//             doZaplaty: req.body.doZaplaty,
//             numberProjektu: req.body.numberProjektu,
//             zaczete: req.body.zaczete,
//             skonczone: req.body.skonczone,
//             dostarczone: req.body.dostarczone,
//             wplacone: req.body.wplacone,
//             zamkniete: req.body.zamkniete,
//             dateStart: req.body.dateStart,
//             dateTermin: req.body.dateTermin,
//             dateZakonczenie: req.body.dateZakonczenie,
//             disk: req.body.disk
//         }
//         let newFolderPath;
//         let newFiles = [];
//         const changeDiskRegexp = new RegExp(/^[a-zA-Z]:/)

//         //CHECK IF THERE ARE ANY TAGS DIFFERENCE
//         if (req.body.tags !== projectToUpdate.tags) {
//             updatePatch.tags = req.body.tags
//         }

//         //CHECK IF THERE ARE ANY CLIENT DIFFERENCE
//         //THERE IS CLIENT DIFFERENCE
//         if (req.body.client !== '') {
            

//             //CHECK IF NEW CLIENT ID IS OK AND CHECK IF 
//             const regexpForClientId = new RegExp(/ID:([a-z0-9]+)/);
//         if (regexpForClientId.test(req.body.client)) {
//             const potentialClient = await Client.findById(req.body.client.match(regexpForClientId)[1])
            
//             //THERE IS A CLIENT LIKE THAT
//             if (potentialClient !== null) {

//                 //ASSIGN THE NEW CLIENT TO THE UPDATE
//                 updatePatch.client = req.body.client.match(regexpForClientId)[1]
                
//                 //ASSIGN THE PROJECT TO THE CLIENT
//                 let newArray = potentialClient.projects;
//                 newArray.push(req.params.id)
//                 await potentialClient.update({projects: newArray});

//                 //DELETE THE PROJECT FROM THE PREVIOUS CLIENT
//                 const oldClient = await Client.findById(projectToUpdate.client)
//                 let projects = oldClient.projects.filter((id) => id !== String(req.params.id));
//                 await oldClient.update({projects})
//             }
//          }
//         }

//         //NEW PATHS and FILES that have to be added to the updatePatch ==============================================================
        
//         //CHECK IF THERE ARE ANY DISKS DIFFERENCE
//         // console.log(projectToUpdate)
//         if (req.body.oldDisk !== req.body.disk) {
//             console.log('DISK WAS DIFFERENT')
//             console.log(projectToUpdate.folderPath)
//             console.log( 'new disk is: ', req.body.disk)

//             //REGEXP - CREATE NEW PATH TO THE main project FOLDER
            

//             newFolderPath = projectToUpdate.folderPath.replace(changeDiskRegexp, `${req.body.disk}:`)
//             console.log(projectToUpdate)
//             // console.log(new Date(projectToUpdate.dateStart), new Date(projectToUpdate.dateStart).getDate(), new Date(projectToUpdate.dateStart).getMonth(), new Date(projectToUpdate.dateStart).getFullYear())

//             //DISK WAS DIFFERENT
//             //first create new folder in different disk and move files

//             ///////////////////////////////////////////////////////////////////////\
//             ///////////////////////////////////////////////////////////////////////
//             ////////// CREATE NEW FOLDERS
//             ///////////////////////////////////////////////////////////////////////
//             ///////////////////////////////////////////////////////////////////////

//                 //////////////////////////////////////////////
//                 // CHECK IF MAIN FOLDER szafranprojekt exists - MAKE FOLDER
//                 //////////////////////////////////////////////
//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${req.body.disk}:\\szafranprojekt exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${req.body.disk}:\\szafranprojekt does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                 }

//                 //////////////////////////////////////////////
//                 // CHECK IF YEAR FOLDER EXISTS - MAKE FOLDER
//                 //////////////////////////////////////////////
//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()} exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                     // console.log(`${req.body.disk}:\\szafranprojekt\\${navigateDate.getFullYear()} does not exist, had to create it`)
//                 }

//                 //////////////////////////////////////////////
//                 // CHECK IF MONTH FOLDER EXISTS - MAKE FOLDER
//                 //////////////////////////////////////////////

//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}\\${new Date(projectToUpdate.dateStart).getMonth()}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} exists`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}\\${new Date(projectToUpdate.dateStart).getMonth()}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                 }

//                 //////////////////////////////////////////////
//                 //CREATE PROJECT FOLDER
//                 //////////////////////////////////////////////

//                 if (fs.existsSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}\\${new Date(projectToUpdate.dateStart).getMonth()}\\${projectToUpdate.id}`)) {

//                     //IT EXISTS, CONTINUE
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} exists SOMEHOW?`)
//                 } else {
//                     //IF NOT, CREATE IT
//                     // console.log(`${navigateDate.getFullYear()}\\${navigateDate.getMonth()}\\${newProject.id} does not exist, had to create it`)
//                     fs.mkdirSync(`${req.body.disk}:\\szafranprojekt\\${new Date(projectToUpdate.dateStart).getFullYear()}\\${new Date(projectToUpdate.dateStart).getMonth()}\\${projectToUpdate.id}`), {recursive: true}, async (err) => {
//                         if (err) {
//                             console.log(err)
//                             errorCheck = err;
//                         }
//                     }
//                 }
                    
//             } else {
//                 console.log('DISK REMAINS THE SAME!')
//             }

//             ///////////////////////////////////////////////////////////////////////\
//             ///////////////////////////////////////////////////////////////////////
//             ////////// COPY EXISTING FILES
//             ///////////////////////////////////////////////////////////////////////
//             ///////////////////////////////////////////////////////////////////////

//             ///////////////// FOR ALREADY EXISTING FILES
//             //IF DISK WAS DIFFERENT MOVE THEM, IF NOT, THEY CAN STAY
//             if (req.body.oldDisk !== req.body.disk) {
//                 console.log('OLD FILES GET A NEW PATH BECAUSE NEW DISK!')
//                 req.body.oldFiles.forEach((item) => {
//                     // console.log(item)
//                     console.log('Old file:', item.name)
//                     const newFile = {
//                         name: item.name,
//                         size: item.size,
//                         path: item.path.replace(changeDiskRegexp, `${req.body.disk}:`)
//                     }
//                     newFiles.push(newFile)
                    
//                     //Using the old path + new path to move files
//                     mv(item.path, newFile.path, (err) => {
//                         console.log(err)
//                     } )
//                 })
//             }
//             console.log(req.body.disk, req.body.oldDisk)
           

            
//             ///////////////////////////////////////////////////////////////////////\
//             ///////////////////////////////////////////////////////////////////////
//             ////////// WRITE NEW FILES IF THERE ARE ANY
//             ///////////////////////////////////////////////////////////////////////
//             ///////////////////////////////////////////////////////////////////////
//             ///////////////// FOR NEW FILES

//             //THERE ARE NEW FILES, WE NEED TO WRITE THEM DOWN
//             if (req.body.files.length > 0) {
//                 console.log(projectToUpdate.folderPath.replace(changeDiskRegexp, `${req.body.disk}:`))
//                 req.body.files.forEach(file => {
//                     // console.log('New file:', file)
//                     const fileBase64 = file.base64.replace(/^.+\,/, "");
//                     console.log(newFolderPath)
//                     console.log('aaaa', )
//                     console.log()
//                     const newFile = {
//                         name: file.name,
//                         size: file.size,
//                         path: `${projectToUpdate.folderPath.replace(changeDiskRegexp, `${req.body.disk}:`)}\\${file.name}`
//                     }
//                     newFiles.push(newFile)
    
//                     fs.writeFileSync(
//                         newFile.path,
//                         fileBase64,
//                         'base64',
//                         async function(err) {
//                             if (err) {
//                                 // console.log(err)
//                                 console.log('There was an error')
//                                 errorCheck = err;
//                                 //IF SOMETHING WENT WRONG DELETE PROJECT
//                                 fs.rmSync(`${projectToUpdate.folderPath.replace(changeDiskRegexp, `${req.body.disk}:`)}`, { recursive: true, force: true });
                                
//                             }
                            
//                         }
//                     )
//                 })
//             }
            

//             updatePatch.files = newFiles;
//             console.log(newFiles)

//             ///////////////////////////////////////////////////////////////////////\
//             ///////////////////////////////////////////////////////////////////////
//             ////////// DELETE EXISTING FOLDER
//             ///////////////////////////////////////////////////////////////////////
//             ///////////////////////////////////////////////////////////////////////
//             //after copying files you can safely delete the old ones
//             // fs.rmSync(projectToUpdate.folderPath, { recursive: true, force: true });
//             // console.log(updatePatch)
        

//         //CHECK IF THERE ARE ANY FILES DIFFERENCE
        
//         await projectToUpdate.update(updatePatch)


//         res.status(200)
//     } catch (err) {
//         console.log(err)
//         res.status(500)
//     }

// }