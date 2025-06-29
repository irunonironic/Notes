import mongoose from 'mongoose';
export default async function connectDB(){
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDb connnected');
    }catch(err){
        console.error('MongoDB connection error',err.message);
        process.exit(1);
    }
}