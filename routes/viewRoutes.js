const express = require('express');
const router = express.Router();

const viewController = require(`../controllers/viewController`);

router
.route('/')
.get(viewController.getOverview);

router
.route('/tour/:slug')
.get(viewController.getTour);


module.exports = router ;