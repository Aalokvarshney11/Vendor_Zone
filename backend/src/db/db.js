const mongoose = require("mongoose")

async function connectDB(){

    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to db")
    }

    catch(error){
        console.log("database connection error:",error)
        process.exit(1);
    }
}

module.exports = connectDB