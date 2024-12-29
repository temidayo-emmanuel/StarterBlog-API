const express = require('express')
const cors = require('cors')
const {connect} = require('mongoose')
require('dotenv').config()
const upload = require('express-fileupload')


const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const {notFound, errorHandler} = require('./middlewares/errorMiddleware')



const app = express();
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials: true, origin: "https://starterblog-r6a9p8kym-dayotechs-projects.vercel.app"}))
app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))


app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound)
app.use(errorHandler)


connect(process.env.MONGO_URL)
.then(app.listen(3000, () => console.log(`DB connected...Server running on ${process.env.PORT}`)))
.catch(error => console.log(error));

