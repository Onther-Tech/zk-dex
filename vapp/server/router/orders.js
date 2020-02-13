const express = require('express');

const asyncWrap = require('../asyncWrap');

const {
  getOrder,
  getOrders,
  getOrdersByUser,
  addOrder,
  addOrderHistory,
  updateOrderHistoryState,
  updateOrderState,
  updateOrderTaker,
  updateOrderHistory,
} = require('../localstorage');

const router = express.Router();

router.get('/', asyncWrap(
  async function (req, res) {
    const orders = getOrders();
    return res.status(200).json({
      orders,
    });
  }
));

router.post('/', asyncWrap(
  async function (req, res) {
    const order = req.body.order;
    const orders = addOrder(order);
    return res.status(200).json({
      orders,
    });
  }
));

router.get('/:id', asyncWrap(
  async function (req, res) {
    const id = req.params.id;
    const order = getOrder(id);
    return res.status(200).json({
      order,
    });
  }
));

router.put('/', asyncWrap(
  async function (req, res) {
    const orderId = req.body.orderId;
    const orderState = req.body.orderState;
    const orders = updateOrderState(orderId, orderState);
    return res.status(200).json({
      orders,
    });
  }
));

module.exports = router;