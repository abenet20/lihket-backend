const express = require("express");
const router = express.Router();
const {tardy} = require('../controllers/unitLeadrersControllers/tardy');


router.post('/tardy', tardy);

module.exports = router;