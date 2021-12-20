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

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;

  //reqName, reqDescription, reqPrice, reqImageUrl stored in locals
  const initDishName = dish.name;
  const initDishDescr = dish.description;
  const initDishPrice = dish.price;
  const initDishImageUrl = dish.image_url;

  if (initDishName !== res.locals.reqName) {
    dish.name = res.locals.reqName;
  }
  if (initDishDescr !== res.locals.reqDescription) {
    dish.description = res.locals.reqDescription;
  }
  if (initDishPrice !== res.locals.reqPrice) {
    dish.price = res.locals.reqPrice;
  }
  if (initDishImageUrl !== res.locals.reqImageUrl) {
    dish.image_url = res.locals.reqImageUrl;
  }
  res.json({ data: dish });
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

function ifBodyHasIdValidateParamMatch(req, res, next) {
  const { data: { id } = {} } = req.body;
  if (id) {
    const { dishId } = req.params;
    if (id !== dishId) {
      next({
        status: 400,
        message: `URL dish id (${dishId}) does not match update request dish id (${id})`,
      });
    }
  }
  return next();
}

//Validations for existing dish
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
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
  read: [dishExists, read],
  update: [
    dishExists,
    ifBodyHasIdValidateParamMatch,
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    pricePropertyIsValid,
    bodyHasImageUrlProperty,
    update,
  ],
};
