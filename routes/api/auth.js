const express = require('express');
const router = express.Router();
//middleware
const auth = require('../../middleware/auth');
const User = require('../../models/User');

//Public GET route
//this is middleware.
//               ||
//               \/
router.get('/', auth, (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
