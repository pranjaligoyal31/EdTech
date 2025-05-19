const  mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description: {
        type:String,
    },
    course: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
],
});
//export the tags model
module.exports = mongoose.model("Category",categorySchema);