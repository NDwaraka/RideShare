const express = require('express');
const dotenv = require('dotenv');
// const dotenv = require('dotenv').config({ path: './env' });
const {connectDB} = require('./config/db.js');

const app = express();
dotenv.config();
connectDB();

app.use(express.json());


// Forward to route modules
app.use('/user', require('./APIs/user.js'));
app.use('/driver', require('./APIs/driver.js'));

const { router: userVerificationRouter } = require('./APIs/userVerification.js');
app.use('/driver', userVerificationRouter); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
