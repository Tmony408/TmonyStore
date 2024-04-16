const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000
const dbConnect = require('./configs/dbConnect');
const authRoutes = require('./routes/authroute');
const productRoutes = require('./routes/productRoute');
const blogRoutes = require('./routes/blogRoute')
const categoryRoutes = require('./routes/categoryRoute')
const blogCategoryRoutes = require('./routes/blogCategoryRoute')
const brandRoutes = require('./routes/brandRoute')
const couponRoutes = require('./routes/couponRoutes')
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
app.use('/api/user', authRoutes );
app.use('/api/product', productRoutes);
app.use('/api/blog', blogRoutes )
app.use('/api/category', categoryRoutes )
app.use('/api/blog-category', blogCategoryRoutes )
app.use('/api/brand', brandRoutes )
app.use('/api/coupon', couponRoutes)



// Error errorHandler
app.use(notFound);
app.use(errorHandler)
 

app.listen(PORT, ()=>{
    console.log('Server running on port '+ PORT)
})