import mongoose from "mongoose"


const connectToDb = ()=>{
    mongoose.connect(process.env.dbConnection)
    .then(()=>{console.log("db is connected")})
    .catch(()=>{console.error("connect To db is failed")})
}
export {connectToDb}