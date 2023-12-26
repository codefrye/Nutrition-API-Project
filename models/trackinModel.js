const { default: mongoose } = require("mongoose");
 
const trackingSchema = mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId, ref:'users',required:true},
    foodId:{type:mongoose.Types.ObjectId, ref:'foods', required:true},
    quantity:{type:Number, min:1,required:true},
    eatenDate:{type:String,  default:new Date().toLocaleDateString()}

},{timestamps:true});


const trackingModel=mongoose.model('trackings',trackingSchema);


module.exports=trackingModel;