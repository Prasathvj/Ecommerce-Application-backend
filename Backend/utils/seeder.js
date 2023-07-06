const dbConnection = require("../config/db");
const products = require("../data/products.json");
const Product = require("../models/productModel");
const dotenv = require("dotenv");

dotenv.config({path:'Backend/config/.env'})
dbConnection();
const seedProducts = async()=>{
    try {
        await Product.deleteMany();
        console.log("products deleted successfully");

        await Product.insertMany(products);
        console.log("All products added successfully ")
    } catch (error) {
        console.log("products added failed",error)
    }
    process.exit();
}

seedProducts()