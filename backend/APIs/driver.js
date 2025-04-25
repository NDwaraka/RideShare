// APIs/user.api.js
const express = require('express');
const { getDB } = require('../config/db.js');
// const createleader = require('./util.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const driver = express.Router();


module.exports = driver;
