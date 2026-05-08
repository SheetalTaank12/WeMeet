import express from 'express';
import {createServer} from 'http';

import {Server} from 'socket.io';
import mongoose from 'mongoose';
import { connectToSocket } from './controllers/socketManager.js';
import userRoutes from './routes/users.routes.js';
// import meetingRoutes from './routes/meetings.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();
const app = express();
app.use(cors());

app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({extended: true, limit: "40kb"}));
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.get('/', (req, res) => {
  res.send('Hello World!');
});


//here v1 is the version of the api, we can have multiple versions of the api in future if needed
//we can also have multiple routes for different resources like users, meetings, etc.
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/meetings', meetingRoutes);

const start = async () => {

    app.set("mongo_user")

    const connectionDb = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to mongo host: " + connectionDb.connection.host);
    server.listen(app.get("port"), () => {
        console.log('Server is running on port ' + app.get("port"));
    });
}

start();