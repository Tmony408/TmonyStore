const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000
const dbConnect = require('./configs/dbConnect');
const authRoutes = require('./routes/authroute');
const productRoutes = require('./routes/productRoute');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorUtils');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')


dbConnect();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser())
app.use(morgan("dev"));

app.get('/', (req,res)=>{
    res.send('I\'m okay')
})


// Routes
app.use('/api/user', authRoutes )
app.use('api/product', productRoutes)


// Error errorHandler
app.use(notFound);
app.use(errorHandler)
 

app.listen(PORT, ()=>{
    console.log('Server running on port '+ PORT)
})