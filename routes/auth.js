const User = require("../models/User");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { Error } = require("mongoose");
const jwt = require("jsonwebtoken")

//register
router.post("/register", async (req, res) =>{ 
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),      
    })
    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (err) {
        res.status(500).json(err)
    }
    
})

//LOGIN 

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username})
        !user && res.status(401).json("Wrong credentials!")
        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC)

        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)
        OriginalPassword !== req.body.password && res.status(401).json("Wrong credentials!")
        
        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,

        }, process.env.JWT_SEC,
        {expiresIn:"3d"}
        );
        
        
        
        const { password, ...others } = user._doc;
        res.status(200).json({...others, accessToken})

    } catch (error) {
        res.status(500).json(error)
    }
     
})
module.exports = router