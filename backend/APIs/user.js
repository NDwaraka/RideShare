// APIs/user.api.js
const express = require('express');
const { getDB } = require('../config/db.js');
// const createuser = require('./util.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const user = express.Router();


module.exports = user;
