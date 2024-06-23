const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intent === 'AddProductToOrder') {
        const { orderId, productId, quantity } = parameters;

        try {
            const response = await axios.post('http://localhost:9090/api/v1/order/add-product', {
                orderId,
                productId,
                quantity
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.headers.authorization}`
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
                    'Authorization': `Bearer ${req.headers.authorization}`
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
});

module.exports = router;
