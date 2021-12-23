const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const { default: axios } = require('axios');

const PORT = 4001;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', ( req, res ) => {
    res.send(commentsByPostId[req.params.id] || [])
});
app.post('/posts/:id/comments', async ( req, res ) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;
    const comments = commentsByPostId[req.params.id] || [];
    const initialStatus = 'pending';
    comments.push({id: commentId, content, status: initialStatus});
    commentsByPostId[req.params.id] = comments;
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
           id: commentId, 
           content, 
           postId: req.params.id, 
           status:initialStatus
        }
    }).catch(err => console.log(err.message))
    res.status(201).send(comments);
});
app.post('/events', async (req, res) => {
    console.log('Event Received: ', req.body.type);
    const { type, data } = req.body;
    if(type === 'CommentModerated'){
        const { postId, id, status } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find( com => {
            return com.id === id;
        })
        comment.status = status
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data:{
                ...data, status: status
            }
        }).catch(err => console.log(err.message));
    }
    res.send({});
});

app.listen(PORT, () => {
    console.log('Comments listening on port',PORT);
})
