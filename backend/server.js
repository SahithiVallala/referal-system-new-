const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const contactsRoute = require('./routes/contacts');
const reqRoute = require('./routes/requirements');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/contacts', contactsRoute);
app.use('/api/requirements', reqRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
