require('dotenv').config()
const isAuthorized = require('../middlewares/sharetribeUser').isAuthorized;
const multer  = require('multer')
const path = require('path');
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
})

/** Controllers */
const transactionsMessagesController = require('../controllers/TransactionMessagesController');
const Event = require('../models/event');

/** Express validator */
const { body, validationResult } = require('express-validator');

// Configure process.env with .env.* files
require('../env').configureEnv();
const client = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_SECRET_TOKEN
);

module.exports = (app) => {

  /**
   * @param {EventVM.model} model.body.required
   * @route POST /api/events
   * @group Events
   * @returns {string}  500 - Internal Server Error
   * @returns {void}  200 - Success
   */

  /**
   * @typedef EventVM
   * @property {string} title
   * @property {string} start
   * @property {string} end
   * @property {string} transactionId
   * @property {string} ownerId
   * @property {string} acceptedTransactionId
   */
  app.post('/api/events'/*, isAuthorized()*/, async (req, res) => {
    try {
      return res.send(await Event.create({
        'title': req.body.title,
        'start': req.body.start,
        'end': req.body.end,
        'ownerId': req.body.ownerId,
        'transactionId': req.body.transactionId,
      }));

    } catch (e) {
      return res.status(500).send({
        'error': true,
        'message': e.message,
      });
    }
  });

  app.post('/api/messages', async (req, res) => {
    res.header('Content-Type', 'application/json');
    client.messages
      .create({
        from: process.env.TWILIO_FROM_PHONE,
        to: req.body.to,
        body: req.body.message
      })
      .then(() => {
        return res.send(JSON.stringify({ success: true }));
      })
      .catch(err => {
        console.error(err)
        return res.send(JSON.stringify({ success: false, error: err }));
      });
  });

  /**
   * @param {string} transactionId.path.required
   * @param {string} from.query
   * @param {string} to.query
   * @route GET /api/transactions/{transactionId}/events
   * @group Events
   * @returns {string}  500 - Internal Server Error
   * @returns {void}  200 - Success
   */
  app.get('/api/transactions/:transactionId/events'/*, isAuthorized()*/,  async (req, res) => {

    try {

      let query = {
        'start': { $gte: req.query.from, $lte: req.query.to },
        'end': { $gte: req.query.from, $lte: req.query.to },
        'transactionId': req.params.transactionId
      };

      return res.send(await Event.find(query));

    } catch (e) {
      return res.status(500).send({
        'error': true,
        'message': e.message,
      });
    }
  });

  /**
   * @param {EventVM.model} model.body.required
   * @route PUT /api/events/{eventId}
   * @group Events
   * @returns {string}  500 - Internal Server Error
   * @returns {string}  404 - Not found
   * @returns {void}  200 - Success
   */
  app.put('/api/events/:eventId'/*, isAuthorized()*/, async (req, res) => {

    try {

      let doc = {};
      if(req.body.title) doc.title = req.body.title;
      if(req.body.start) doc.start = req.body.start;
      if(req.body.end) doc.end = req.body.end;

      let event = await Event.findOneAndUpdate({ _id: req.params.eventId }, doc, { new: true });
      return res.send(event);

    } catch (e) {

      if (e.message && ~e.message.indexOf('Cast to ObjectId failed')) {
        res.status(404);
      } else {
        res.status(500);
      }

      return res.send({
        'error': true,
        'message': e.message,
      });
    }
  });

  /**
   * @param {string} eventId.path.required
   * @route GET /api/events/{eventId}
   * @group Events
   * @returns {string}  500 - Internal Server Error
   * @returns {string}  404 - Not found
   * @returns {void}  200 - Success
   */
  app.get('/api/events/:eventId'/*, isAuthorized()*/, async (req, res) => {
    try {

      //TODO check if owner eventId
      let event = await Event.findById(req.params.eventId);

      if(event === null) {
        return res.status(404).send({
          'error': true,
          'message': "Not found",
        });
      }

      return res.send(event);

    } catch (e) {

      if (e.message && ~e.message.indexOf('Cast to ObjectId failed')) {
        res.status(404);
      } else {
        res.status(500);
      }

      return res.send({
        'error': true,
        'message': e.message,
      });
    }
  });

  /**
   * @param {string} eventId.path.required
   * @route DELETE /api/events/{eventId}
   * @group Events
   * @returns {string}  500 - Internal Server Error
   * @returns {string}  404 - Not found
   * @returns {void}  200 - Success
   */
  app.delete('/api/events/:eventId'/*, isAuthorized()*/, async (req, res) => {
    try {

      //TODO check if owner eventId
      let event = await Event.remove({ _id: req.params.eventId });

      return res.status(204).send(event);

    } catch (e) {

      if (e.message && ~e.message.indexOf('Cast to ObjectId failed')) {
        res.status(404);
      } else {
        res.status(500);
      }

      return res.send({
        'error': true,
        'message': e.message,
      });
    }
  });

  /**
   * @route POST /api/transactions/{transactionUuid}/messages
   * @group TransactionMessages
   * @param {string} transactionUuid.path.required
   * @consumes multipart/form-data
   * @param {file} file.formData
   * @param {content} content.formData
   * @param {string} page.query
   * @returns {string}  500 - Internal Server Error
   * @returns {string}  422 - Invalid parameter
   * @returns {void}  200 - Success
   */
  app.post('/api/transactions/:transactionUuid/messages', isAuthorized(), upload.single('file'), (req, res, next) => {

      let file = req.file;

      if(file) {
        let filetypes = /png|jpeg|jpg|txt/;
        let mimetype = filetypes.test(file.mimetype);
        let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        let allowedFileSize = 10 * 1024 * 1024;
        let isInvalidFileSize = file.size > allowedFileSize;

        if (!mimetype && !extname) {
          return res.status(422).send({
            status: false,
            message: "File upload only supports the following filetypes - " + filetypes,
          })
        } else if(isInvalidFileSize) {
          return res.status(422).send({
            status: false,
            message: "File size should be less than " + allowedFileSize / 1024 + "Kb",
          })
        }
      }

      return next()
  }, transactionsMessagesController.create);

  /**
   * @route GET /api/transactions/{transactionUuid}/messages
   * @group TransactionMessages
   * @param {string} transactionUuid.path.required
   * @returns {string}  500 - Internal Server Error
   * @returns {string}  404 - Not found
   * @returns {void}  200 - Success
   */
  app.get('/api/transactions/:transactionUuid/messages', isAuthorized(), transactionsMessagesController.list);

  /**
   * For tests
   */
  app.get('/api/authorized', isAuthorized(), async (req, res) => {
      return res.send({
        'isAuthorized': isAuthorized(),
      });
  });

};

