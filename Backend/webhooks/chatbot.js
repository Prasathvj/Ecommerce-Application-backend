const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
router.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

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
                fulfillmentText: `Here is the product ID for ${productName}`,
                fulfillmentMessages: [
                    {
                        platform: "ACTIONS_ON_GOOGLE",
                        simpleResponses: {
                            simpleResponses: [
                                {
                                    textToSpeech: `Here is the product ID for ${productName}: ${productLink}`,
                                    displayText: `Here is the product ID for ${productName}: ${productLink}`
                                }
                            ]
                        }
                    },
                    {
                        platform: "ACTIONS_ON_GOOGLE",
                        basicCard: {
                            title: productName,
                            subtitle: `Product ID: ${productId}`,
                            buttons: [
                                {
                                    title: "View Product",
                                    openUrlAction: {
                                        url: productLink
                                    }
                                }
                            ]
                        }
                    }
                ]
            });
        } else {
            res.json({
                fulfillmentText: `Sorry, I could not find information for ${productName}`
            });
        }
    }
    
    
    
    
});

module.exports = router;
