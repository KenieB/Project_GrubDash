const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass

router.route("/").get(controller.list).all(methodNotAllowed);

module.exports = router;