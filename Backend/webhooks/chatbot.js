const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
router.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    
    if (intent === 'SearchProductsByPriceRange') {
        const minPrice = parameters['min-price'];
        const maxPrice = parameters['max-price'];
    
        if (!minPrice || !maxPrice) {
            return res.json({
                fulfillmentText: 'Please provide both minimum and maximum values for the price range.'
            });
        }
    
        let query = {
            price: { $gte: minPrice.amount, $lte: maxPrice.amount }
        };
    
        try {
            const products = await Product.find(query);
            if (products.length > 0) {
                let richContent = [[]];
                products.forEach(product => {
                    richContent[0].push({
                        "type": "info",
                        "title": product.name,
                        "subtitle": `${product.price} USD`,
                        "image": {
                            "src": {
                                "rawUrl": product.images[0].image
                            }
                        },
                        "actionLink": `https://prasath-e-commerce.netlify.app/product/${product._id}`
                    });
                });
    
                return res.json({
                    fulfillmentMessages: [
                        {
                            "payload": {
                                "richContent": richContent
                            }
                        }
                    ]
                });
            } else {
                return res.json({
                    fulfillmentText: 'No products found matching your criteria.'
                });
            }
        } catch (error) {
            console.error(error);
            return res.json({
                fulfillmentText: 'Failed to search for products.'
            });
        }
    }    

    if (intent === 'SearchProductsByCategory') {
        const category = parameters['category'] || "";
    
        if (!category) {
            return res.json({
                fulfillmentText: 'Please provide a category.'
            });
        }
    
        let query = { category };
    
        try {
            const products = await Product.find(query);
            if (products.length > 0) {
                let richContent = [[]];
                products.forEach(product => {
                    richContent[0].push({
                        "type": "info",
                        "title": product.name,
                        "subtitle": `${product.price} USD`,
                        "image": {
                            "src": {
                                "rawUrl": product.images[0].image
                            }
                        },
                        "actionLink": `https://prasath-e-commerce.netlify.app/product/${product._id}`
                    });
                });
    
                return res.json({
                    fulfillmentMessages: [
                        {
                            "payload": {
                                "richContent": richContent
                            }
                        }
                    ]
                });
            } else {
                return res.json({
                    fulfillmentText: 'No products found in the specified category.'
                });
            }
        } catch (error) {
            console.error(error);
            return res.json({
                fulfillmentText: 'Failed to search for products.'
            });
        }
    }

    if (intent === 'SearchProductsByProductName') {
        const productName = parameters['product-name'] || "";
    
        if (!productName) {
            return res.json({
                fulfillmentText: 'Please provide a product name.'
            });
        }
    
        let query = { name: { $regex: productName, $options: 'i' } };
    
        try {
            const products = await Product.find(query);
            if (products.length > 0) {
                let richContent = [[]];
                products.forEach(product => {
                    richContent[0].push({
                        "type": "chips",
                        "options": [
                            {
                                "text": product.name,
                                "image": {
                                    "src": {
                                        "rawUrl": product.images[0].image
                                    }
                                },
                                "link": `https://prasath-e-commerce.netlify.app/product/${product._id}`
                            }
                        ]
                    });
                });
    
                return res.json({
                    fulfillmentMessages: [
                        {
                            "payload": {
                                "richContent": richContent
                            }
                        }
                    ]
                });
            } else {
                return res.json({
                    fulfillmentText: 'No products found matching the specified name.'
                });
            }
        } catch (error) {
            console.error(error);
            return res.json({
                fulfillmentText: 'Failed to search for products.'
            });
        }
    }
    
    if (intent === 'FilterProductsByRating') {
        const rating = parameters['star-rating'];
        console.log("rating", rating);

        try {
            const products = await Product.find({ ratings: rating });  // { $gte: minRating }
            if (products.length > 0) {
                let richContent = products.map(product => ([
                    {
                        "type": "info",
                        "title": product.name,
                        "subtitle": `${product.ratings} stars - $${product.price}`,
                        "image": {
                            "src": {
                                "rawUrl": `${product.images[0].image}`
                            }
                        },
                        "actionLink": `https://prasath-e-commerce.netlify.app/product/${product._id}`
                    }
                ]));

                return res.json({
                    fulfillmentMessages: [
                        {
                            "payload": {
                                "richContent": richContent
                            }
                        }
                    ]
                });
            } else {
                return res.json({
                    fulfillmentText: 'No products found with the specified star rating.'
                });
            }
        } catch (error) {
            console.error("Error fetching products:", error); // Log the error
            return res.json({
                fulfillmentText: 'An error occurred while fetching the products. Please try again later.'
            });
        }
    }

    if (intent === 'signinIntent') {
        const password = parameters && parameters.password;
        const email = parameters && parameters.email;
    
        if (!email || !password) {
            return res.json({
                fulfillmentText: 'Email ID or password is missing. Please try again.'
            });
        }
    
        try {
            const response = await axios.post('https://ecommerce-application-ynf3.onrender.com/api/v1/login', {
                email: email,
                password: password
            });
    
            if (response.data.success) {
                return res.json({
                    fulfillmentText: 'Login successful!',
                    payload: {
                        redirectUrl: '/'
                    }
                });
            } else {
                return res.json({
                    fulfillmentText: 'Login failed. Please check your credentials and try again.'
                });
            }
        } catch (error) {
            console.error("Error during login:", error);
            return res.json({
                fulfillmentText: 'An error occurred during login. Please try again later.'
            });
        }
    }
    

    
});

module.exports = router;
