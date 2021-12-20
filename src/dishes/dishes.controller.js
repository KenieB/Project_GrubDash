const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const newDishId = nextId();
  const newDish = {
    id: newDishId,
    name: res.locals.reqName,
    description: res.locals.reqDescription,
    price: res.locals.reqPrice,
    image_url: res.locals.reqImageUrl,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//Request Validations
function bodyHasNameProperty(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    res.locals.reqName = name;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function bodyHasDescriptionProperty(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    res.locals.reqDescription = description;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function bodyHasPriceProperty(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    return next();
  }
  if (price === 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}

function pricePropertyIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price !== "number") {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else if (price < 0 || price % 1 !== 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else {
    res.locals.reqPrice = price;
    next();
  }
}

function bodyHasImageUrlProperty(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    res.locals.reqImageUrl = image_url;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

module.exports = {
  list,
  create: [
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    pricePropertyIsValid,
    bodyHasImageUrlProperty,
    create,
  ],
};
