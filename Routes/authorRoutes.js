const router = require('express').Router();
const controller = require('../Controllers/authorController');

router.post('/', controller.createauthor);
router.get('/', controller.getauthors);
router.get('/:id', controller.getauthor);
router.put('/:id', controller.updateauthor);
router.delete('/:id', controller.deleteauthor);

module.exports = router;