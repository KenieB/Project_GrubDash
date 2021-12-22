const { stat } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function create(req, res) {
  const newOrderId = nextId();
  const newOrder = {
    id: newOrderId,
    deliverTo: res.locals.reqDeliverTo,
    mobileNumber: res.locals.reqMobileNumber,
    status: "",
    dishes: res.locals.reqDishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const order = res.locals.order;

  order.deliverTo = res.locals.reqDeliverTo;
  order.mobileNumber = res.locals.reqMobileNumber;
  order.status = res.locals.reqOrderStatus;
  order.dishes = res.locals.reqDishes;

  res.json({ data: order });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  const deletedOrder = orders.splice(orderIndex, 1);
  res.sendStatus(204);
}

//Request Validations
function bodyHasDeliverToProperty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    res.locals.reqDeliverTo = deliverTo;
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

function bodyHasMobileNumberProperty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    res.locals.reqMobileNumber = mobileNumber;
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

function bodyHasDishesProperty(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    if (typeof dishes !== "object" || !dishes[0]) {
      next({
        status: 400,
        message: "Order must include at least one dish",
      });
    }
    res.locals.reqDishes = dishes;
    return next();
  }
  next({
    status: 400,
    message: "Order must include a dish",
  });
}

function allDishesHaveQuantity(req, res, next) {
  const dishes = res.locals.reqDishes;

  dishes.forEach((dish, index) => {
    const { quantity } = dish;
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  return next();
}

function ifBodyHasIdValidateParamMatch(req, res, next) {
  const { data: { id } = {} } = req.body;
  if (id) {
    const { orderId } = req.params;
    if (id !== orderId) {
      next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      });
    }
  }
  return next();
}

//Validations for existing order
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function orderHasStatusProperty(req, res, next) {
  const currentOrderState = res.locals.order;
  const { data: { status } = {} } = req.body;
  const orderFields = Object.keys(currentOrderState);

  if (!orderFields.includes("status") || !status) {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else {
    res.locals.reqOrderStatus = status;
    res.locals.orderStatusAtChange = currentOrderState.status;
    return next();
  }
}

function statusPropertyIsValidForUpdate(req, res, next) {
    const validOrderStatus = ["pending", "preparing", "out-for-delivery", "delivered"]
    if (!validOrderStatus.includes(res.locals.orderStatusAtChange) || !validOrderStatus.includes(res.locals.reqOrderStatus)) {
        next({
          status: 400,
          message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
      }
    else  if (res.locals.orderStatusAtChange === "delivered" || res.locals.reqOrderStatus === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else {
    return next();
  }
}

function statusPropertyIsValidForDelete(req, res, next) {
  const currentOrderState = res.locals.order;
  if (currentOrderState.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  } else {
    return next();
  }
}

module.exports = {
  list,
  create: [
    bodyHasDeliverToProperty,
    bodyHasMobileNumberProperty,
    bodyHasDishesProperty,
    allDishesHaveQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    ifBodyHasIdValidateParamMatch,
    orderHasStatusProperty,
    statusPropertyIsValidForUpdate,
    bodyHasDeliverToProperty,
    bodyHasMobileNumberProperty,
    bodyHasDishesProperty,
    allDishesHaveQuantity,
    update,
  ],
  delete: [
    orderExists,
    statusPropertyIsValidForDelete,
    destroy,
  ],
};
