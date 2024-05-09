import {app} from './app';
import {v2 as cloudinary} from 'cloudinary'
import connectDB from './utils/db';
require("dotenv").config();


//cloudinary config


try{
    cloudinary.config({
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.CLOUD_API_KEY,
        api_secret:process.env.CLOUD_SECRET_KEY,

        
    });
//     console.log('CLOUD_NAME:', process.env.CLOUD_NAME);
// console.log('CLOUD_API_KEY:', process.env.CLOUD_API_KEY);
// console.log('CLOUD_SECRET_KEY:', process.env.CLOUD_SECRET_KEY);


}
catch(error:any){
    console.error("config cloudinary errror",error);
}



// CREATE SERVER

app.listen(process.env.PORT, () =>{
    console.log(`server is connected with port ${process.env.PORT}`);

    connectDB();
});