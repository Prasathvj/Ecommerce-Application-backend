const express = require('express');
const { newOrder, getSingleOrder, myOrders, orders, updateOrder, deleteOrder, addProductToOrder, removeProductFromOrder } = require('../controllers/ordercontroller');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/authenticate');

router.route('/order/new').post(isAuthenticatedUser,newOrder);
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder);
router.route('/myorders').get(isAuthenticatedUser,myOrders);

//Admin Routes
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), orders)
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
                        .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)

                      
                        
//chatbot
router.route('/order/add-product').post(addProductToOrder);
router.route('/order/remove-product').post(removeProductFromOrder);
                       

module.exports = router;