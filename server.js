const express = require('express');
const redis = require('redis');

const app = express();
const port = 3001;

const redisClient  = redis.createClient();

const layouts = ['layout1', 'layout2', 'layout3'];
const USER_ASSIGNMET_KEY = 'user_assignment';
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/health', (req, res) => {
    res.json({ message: 'Server is up and running'});
});

// API: /layout, Method: POST, Usage: To assign random layout to user
app.post('/layout', (req, res) => {
    const {userId} = req.body;
    const randomId = Math.floor(Math.random() * layouts.length);
    const layout = layouts[randomId];
    redisClient.hSet(USER_ASSIGNMET_KEY, userId, layout);
    res.json({layout: layout});
});

// API: /layout, Method: GET, Usage: Get assigned layout by user
app.get('/layout',async (req, res) => {
    const {userId} = req.query;
    try {
        var layout = await redisClient.hGet(USER_ASSIGNMET_KEY, userId);
        if(layout) {
            res.json({layout: layout});
        } else {
            res.status(404).json({message: 'Layout not found'});
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});



app.listen(port, async () => {
    if(!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Successfully connected to redis");
    }
    console.log(`Server is running on port: ${port}`);
});