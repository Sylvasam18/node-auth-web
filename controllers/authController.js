const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleErrors = (error) => {
console.log(error.message, error.code);
let errors = { email: '', password: ''};

if (error.message === 'Incorrect Email') {
errors.email = "That email is not registered";
}

if (error.message === 'Incorrect Password') {
    errors.password = "That password is incorrect";
    }

if (error.code === 11000) {
    errors.email = 'That user already exists';
    return errors
}

if (error.message.includes('user validation failed')){
    Object.values(error.errors).forEach(({ properties }) =>{
        errors[properties.path] = properties.message;
    })
}

return errors;

};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'Power Distribution', {
        expiresIn: maxAge
    });
}


module.exports.signup_get = (req,res) => {
res.render('signup')
}

module.exports.login_get = (req,res) => {
    res.render('login')
}

module.exports.signup_post = async (req,res) => {
    const { email, password } = req.body
    try {
        const user = await User.create({ email, password })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
        res.status(201).json({user: user._id})
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json(errors)
    }
}

module.exports.login_post = async (req,res) => {
    const { email, password} = req.body;
    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
        res.status(200).json({ user: user._id })
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}

module.exports.logout_get = (req,res) => {
    res.cookie('jwt','', { maxAge: 1})
    res.redirect('/')
}