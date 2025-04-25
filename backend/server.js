const express = require('express');
const dotenv = require('dotenv');
// const dotenv = require('dotenv').config({ path: './env' });
const {connectDB} = require('./config/db.js');

const app = express();
dotenv.config();
connectDB();

app.use(express.json());


// Forward to route modules
app.use('/leader', require('./APIs/leader.js'));
// app.use('/admin', require('./APIs/admin.js'));


// const { router: userVerificationRouter } = require('./APIs/userVerification.js');
// app.use('/user', userVerificationRouter); 
// app.use('/user',require('./APIs/userVerification.js'));  // will give err because....

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
