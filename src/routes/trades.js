const router = require("express").Router();
const { auth } = require("../middleware/auth"); // adjust path/name
const { validate } = require("../middleware/validate");
const { updateTradeBody } = require("../validation/tradeSchema");
const { updateTrade } = require("../controllers/tradesController");

router.patch("/:id", auth, validate(updateTradeBody), updateTrade);

module.exports = router;
