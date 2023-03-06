
import * as nodeDiskInfo from 'node-disk-info'

//DETERMINE THE WEIGHT OF THE BYTES
function formatBytes(a,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

export const checkDrives = (req, res) => {
    try {
        const disks = nodeDiskInfo.getDiskInfoSync();

        const dataToSend = disks.map((item) => { return {capacity: item.capacity.replace('%',''), used: formatBytes(item.used), available: formatBytes(item.available), diskName: item.mounted.replace(':',"")}})
        res.status(200).json(dataToSend)
    } catch (e) {
        console.error(e);
    }
}

export const checkDriveId = (req, res) => {
    const {id} = req.params

    try {
        const disks = nodeDiskInfo.getDiskInfoSync();
        const diskId = disks.find((item) => {
            
            return item.mounted === `${id}:`
        })
        // console.log(diskId)
       

        res.status(200).json({capacity: diskId.capacity, used: formatBytes(diskId.used), available: formatBytes(diskId.available)})
    } catch (e) {
        console.error(e);
    }
}