const catchAsyncError = require("../middlewares/catchAsyncError");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel")

//Create New Order - api/v1/order/new
exports.newOrder =  catchAsyncError( async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success: true,
        order
    })
})
//Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

//Get Loggedin User Orders - /api/v1/myorders
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({user: req.user.id});

    res.status(200).json({
        success: true,
        orders
    })
})

//Admin: Get All Orders - api/v1/orders
exports.orders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//Admin: Update Order / Order Status - api/v1/order/:id
exports.updateOrder =  catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus == 'Delivered') {
        return next(new ErrorHandler('Order has been already delivered!', 400))
    }
    //Updating the product stock of each order item
    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity)
    })

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
        success: true
    })
    
});

async function updateStock (productId, quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBeforeSave: false})
}

//Admin: Delete Order - api/v1/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    await order.remove();
    res.status(200).json({
        success: true
    })
})


// Add product to order
exports.addProductToOrder = catchAsyncError(async (req, res, next) => {
    const { orderId, productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    let order = await Order.findById(orderId);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    const orderItem = {
        product: productId,
        name: product.name,
        quantity,
        price: product.price,
        image: product.images[0].image
    };

    order.orderItems.push(orderItem);
    order.itemsPrice += product.price * quantity;
    order.totalPrice += product.price * quantity;
    await order.save();

    res.status(200).json({
        success: true,
        order
    });
});

// Remove product from order
exports.removeProductFromOrder = catchAsyncError(async (req, res, next) => {
    const { orderId, productId } = req.body;

    let order = await Order.findById(orderId);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    const orderItemIndex = order.orderItems.findIndex(item => item.product.toString() === productId);
    if (orderItemIndex === -1) {
        return next(new ErrorHandler('Product not found in order', 404));
    }

    const orderItem = order.orderItems[orderItemIndex];
    order.itemsPrice -= orderItem.price * orderItem.quantity;
    order.totalPrice -= orderItem.price * orderItem.quantity;
    order.orderItems.splice(orderItemIndex, 1);
    await order.save();

    res.status(200).json({
        success: true,
        order
    });
});
