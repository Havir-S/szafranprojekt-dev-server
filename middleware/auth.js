const auth = async (req, res, next) => {
    try {
        

        next();
    } catch (err) {
        console.log(err)
    }
}

export default auth;