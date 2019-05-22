const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
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


//Public POST route
router.post(
    '/',
    [
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Password is required'
      ).exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      //1. Check to see if there are any errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        //2. See if user doesn't exist
        let user = await User.findOne({ email });
  
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        //3. Check to see if the email matches
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}] });
        }


        //4. Return jsonwebtoken
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
);
  
  

module.exports = router;
