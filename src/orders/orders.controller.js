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
    status: "pending",
    dishes: res.locals.reqDishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
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

  next();
}

//Validations for existing order

module.exports = {
  list,
  create: [
      bodyHasDeliverToProperty,
      bodyHasMobileNumberProperty,
      bodyHasDishesProperty,
      allDishesHaveQuantity,
      create,
  ],
};
