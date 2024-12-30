const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    origin: ["http://localhost:5173", "https://starterblog-indol.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors()); // Handle preflight requests

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URL)
    .then(() => app.listen(3000, () => console.log(`DB connected...Server running on ${process.env.PORT}`)))
    .catch(error => console.log(error));