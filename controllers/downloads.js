import zip from 'express-zip'
// console.log(zip)
export const downloadOne = async (req,res) => {
    console.log('ding')
    console.log(req.query.path)
    // console.log('C:\szafranprojekt\2023\2\633ec8473032c86e379401e8\car-icon-top-5.jpg')
    res.download(req.query.path)
    res.status(200)
    // res.zip([
    //     {path: 'C:\\szafranprojekt\\2023\\2\\633ec8473032c86e379401e8\\car-icon-top-5.jpg', name: 'car-icon-top-5.jpg'}
    // ])
}