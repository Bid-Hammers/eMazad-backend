'use strict';
const User = require('../models').userModel;

const basicAuth = async (req, res, next) => {

    try {
        console.log(req.body);
        const userName = await User.findOne({ where: { userName: req.body.userName } });

        if (userName) {
            return res.status(409).send('Username already exists');

        } else {

            const email = await User.findOne({ where: { email: req.body.email } });

            if (email) {

                return res.status(409).send('Email already exists');
            }
        }
        next();
    } catch (error) {
        next(error.message || error);
    }
}

module.exports = basicAuth;