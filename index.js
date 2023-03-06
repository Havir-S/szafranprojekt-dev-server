import express from 'express'
// import connection from 'db.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs';
dotenv.config();

// sync way
// try {
//     const disks = nodeDiskInfo.getDiskInfoSync();
//     printResults('SYNC WAY', disks);
// } catch (e) {
//     console.error(e);
// }

// function printResults(title, disks) {

//     console.log(`============ ${title} ==============\n`);

//     for (const disk of disks) {
//         console.log('Filesystem:', disk.filesystem);
//         console.log('Blocks:', disk.blocks);
//         console.log('Used:', disk.used);
//         console.log('Available:', disk.available);
//         console.log('Capacity:', disk.capacity);
//         console.log('Mounted:', disk.mounted, '\n');
//     }

// }


//DISK SPACE CHECK
import checkDiskSpace from 'check-disk-space'

//using windows command line
import * as child from 'child_process'

//CHECK WEIGHT NOT IN BYTES BUT IN KB/MB/GB
// function formatBytes(a,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}


const app = express();



app.use(bodyParser.json({limit: '300mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '300mb', extended: true}))
app.use(cors());

app.get('/testo', async  (req,res) => {
    console.log(req.body)
    console.log('hello')
})

//ROUTES
import test from './routes/test.js'
app.use('/test', test)

import checkDrivesRoutes from './routes/checkDrives.js'
app.use('/drives', checkDrivesRoutes)

import clientRoutes from './routes/clients.js'
app.use('/clients', clientRoutes)

import projectRoutes from './routes/projects.js'
app.use('/projects', projectRoutes)

import downloadRoutes from './routes/downloads.js'
app.use('/download', downloadRoutes)

//CHECK DISK SPACE
// checkDiskSpace('C:').then((diskSpace) => {
//     console.log(diskSpace)
//     // {
//     //     diskPath: 'C:',
//     //     free: 12345678,
//     //     size: 98756432
//     // }
//     // Note: `free` and `size` are in bytes
// })

app.post('/clients/new', (req,res) => {
    
    // console.log(req.body.picture);

    

    

    // CHECKING DISK NAMES
    // let disks;
    // child.exec('wmic logicaldisk get name', (error, stdout) => {
    //     // console.log(
    //     //     stdout.split('\r\r\n')
    //     //         .filter(value => /[A-Za-z]:/.test(value))
    //     //         .map(value => value.trim())
    //     // );

    //     disks = stdout.split('\r\r\n')
    //             .filter(value => /[A-Za-z]:/.test(value))
    //             .map(value => value.trim())
    // });
    // console.log(disks)
    
    //MUST AUTOMATE WRITING BASED ON MONTH - AND CREATE A NEW FOLDER TO KEEP PROJECTS EVERYTIME A NEW MONTH COMES, OTHERWISE IT CANT SAVE IN A FOLDER IT DOESNT EXIST!
    // fs.writeFile(
    //     (`C:\\projekty\\` + req.body.picture.name), 
    //     req.body.picture.base64.replace(/^.+\,/, ""), 'base64', function(err) {
    //         console.log(err)
    //     }
    // )
    // console.log((`C:\\` + req.body.picture.name))
    // x.slice(0,x.indexOf(',') +1)
    
})


mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(process.env.PORT, () => console.log(`Server running on port: ${process.env.PORT}`)))
    .catch((error) => console.log(error) )
