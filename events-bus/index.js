const express = require('express');
const {default:axios} = require('axios');
const bodyParser = require('body-parser');
const PORT = 4005;

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', async ( req, res )=> {
    const event = req.body;
    events.push(event);
    await axios.post('http://posts-clusterip-srv:4000/events', event).catch(err => console.log(err.message));
    await axios.post('http://comments-srv:4001/events', event).catch(err => console.log(err.message));
    await axios.post('http://query-srv:4002/events', event).catch(err => console.log(err.message));
    await axios.post('http://moderation-srv:4003/events', event).catch(err => console.log(err.message));
    res.send({status:'OK'});
});
app.get('/events', (req, res) => {
    res.send(events)
})
app.listen(PORT, () => {
    console.log('Events listening on port', PORT);
})