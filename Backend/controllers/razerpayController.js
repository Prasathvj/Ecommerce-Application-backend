const Razorpay = require('razorpay')
var crypto = require("crypto");

const KEY_ID = 'rzp_test_f6mxNa7ao2fEfK'
const KEY_SECRET = 'sh252X7EJ9tmCZ58e4EFhVoO'

exports.orders = (req, res) => {
    try {
        const instance = new Razorpay({ 
        key_id: KEY_ID, 
        key_secret: KEY_SECRET 
    });

    var options = {
        amount: req.body.amount * 100,  // amount in the smallest currency unit
        currency: "INR",
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            console.log(err)
            return res.send({ code: 500, message: 'Server Err.' })
        }
        return res.send({ code: 200, message: 'order created', data: order })
    });
    } catch (error) {
        console.log(error)
    }
 
   
}


exports.verfiy = (req, res) => {


    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    var expectedSignature = crypto.createHmac('sha256', 'sh252X7EJ9tmCZ58e4EFhVoO')
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === req.body.response.razorpay_signature) {
        res.send({ code: 200, message: 'Sign Valid' });
    } else {

        res.send({ code: 500, message: 'Sign Invalid' });
    }
}