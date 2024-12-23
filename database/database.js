//Write a function
//Importing packages
//Always export the function

//1.Importing th e package
const mongoose=require('mongoose');

//2. Creating a function
const connectDB =() => {
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("Database Connected Sucessfully")
    })
}
//3.Exporting the function
module.exports = connectDB;

