const express = require('express');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');

const PORT = 4003;

const app = express();
app.use(bodyParser.json());


app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if(type === 'CommentCreated'){
        const status = data.content.includes('orange'.toLowerCase()) ? 'rejected': 'approved';

        await axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentModerated',
            data: {
                ...data, status: status,
            }
        }).catch(err => console.log(err.message));
    }
});

app.listen(PORT, ()=> {
    console.log('Moderation endpoint listening on port', PORT)
})