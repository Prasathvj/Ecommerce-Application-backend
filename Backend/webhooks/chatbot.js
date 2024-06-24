const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
router.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    console.log("Intent:", intent); // Logging the intent
    console.log("Parameters:", parameters); // Logging the parameters
    if (intent === 'AddProductToOrder') {
        const { orderId, productId, quantity } = parameters;
        console.log("product1",productId)

        try {
            const response = await axios.post('http://localhost:9090/api/v1/order/add-product', {
                orderId,
                productId,
                quantity
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization // Use the authorization header as it is
                }
            });

            res.json({
                fulfillmentText: `Product added to order successfully.`
            });
        } catch (error) {
            res.json({
                fulfillmentText: `Failed to add product to order.`
            });
        }
    }

    if (intent === 'RemoveProductFromOrder') {
        const { orderId, productId } = parameters;

        try {
            const response = await axios.post('http://localhost:9090/api/v1/order/remove-product', {
                orderId,
                productId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                }
            });

            res.json({
                fulfillmentText: `Product removed from order successfully.`
            });
        } catch (error) {
            res.json({
                fulfillmentText: `Failed to remove product from order.`
            });
        }
    }

    if (intent === 'ViewProductInfo') {
        const productName = parameters['product-name'];
        const product = await Product.findOne({ name: productName });
    
        if (product) {
            const productId = product._id.toString(); // Convert ObjectId to string
            const productLink = `http://localhost:3000/product/${productId}`;
            res.json({
                fulfillmentText: `Here is the product ID for ${productName}: ${productLink}`
            });
        } else {
            res.json({
                fulfillmentText: `Sorry, I could not find information for ${productName}`
            });
        }
    }

    if (intent === 'SearchProducts') {
        const priceRange = parameters['price-range'];
        const minPrice = priceRange[0].amount;
        const maxPrice = priceRange[1].amount;
        const category = parameters['category'];
        const productName = parameters['product-name'];

        // Construct the query object
        let query = {};

        // Add price range filter if specified
        if (minPrice && maxPrice) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        }

        // Add category filter if specified
        if (category) {
            query.category = category;
        }

        // Add name filter if specified
        if (productName) {
            query.name = { $regex: productName, $options: 'i' }; // Case-insensitive search
        }

        try {
            // Fetch products matching the criteria
            const products = await Product.find(query);

            if (products.length > 0) {
                // Construct a response with the list of matching products
                let responseText = 'Here are the matching products:\n';
                products.forEach(product => {
                    responseText += `${product.name} - $${product.price}\n<a href="http://localhost:3000/product/${product._id}" target="_blank">${product.name}</a>\n\n`;
                });

                res.json({
                    fulfillmentText: responseText
                });
            } else {
                res.json({
                    fulfillmentText: 'No products found matching your criteria.'
                });
            }
        } catch (error) {
            console.error(error);
            res.json({
                fulfillmentText: 'Failed to search for products.'
            });
        }
    }

    if (intent === 'FilterProductsByRating') {
        const minRating = parameters['star-rating'][0];
        console.log("rating", minRating);

        try {
            const products = await Product.find({ ratings: { $gte: minRating } });

            if (products.length > 0) {
                // Construct a response with the list of matching products as rich content chips
                let richContent = [
                    [
                        {
                            "type": "chips",
                            "options": products.map(product => ({
                                "text": `${product.name} - ${product.ratings} stars`,
                                "link": `http://localhost:3000/product/${product.images[0].image}`,
                                "linkType": "newTab", // Ensure the link opens in a new tab
                                "image": {
                                    "src": {
                                        "rawUrl": `${product.images[0].image}` // Replace with actual image URL if available
                                    }
                                }
                            }))
                        }
                    ]
                ];

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
    
});

module.exports = router;
