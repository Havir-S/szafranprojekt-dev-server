import express from 'express';

// const si = require('systeminformation');
import si from 'systeminformation';

const router = express.Router();


router.get('/', (req,res) => {
    
    si.diskLayout().then(data => console.log(data));

}
)



export default router;
