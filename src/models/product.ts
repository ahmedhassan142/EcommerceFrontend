import mongoose from 'mongoose'
const productschema=new mongoose.Schema({
  name:{type:String,required:true},
  description:{type:String,required:true},
  image:{type:String,required:true},
  price:{type:Number,required:true},
  stock:{type:Number,required:true}
})
export const ProductModel=mongoose.models.Product||mongoose.model("Product",productschema)
