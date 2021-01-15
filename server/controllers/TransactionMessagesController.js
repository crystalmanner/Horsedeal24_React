const sdk = require('../utils/sdk');
const integrationSdk = require('sharetribe-flex-integration-sdk').createInstance({
  clientId: process.env.REACT_APP_SHARETRIBE_INTEGRATION_SDK_CLIENT_ID,
  clientSecret: process.env.REACT_APP_SHARETRIBE_INTEGRATION_SDK_CLIENT_SECRET,
});

// const marketplaceSdk = require('sharetribe-flex-sdk').createInstance({
//   clientId: process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID,
//   baseUrl: process.env.REACT_APP_CANONICAL_ROOT_URL
// });

const TransactionMessage = require('../models').TransactionMessage;
const File = require('../models').File;

const aws = require('aws-sdk');
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

module.exports = {

  create: async (req, res) => {

    const transactionUuid = req.params.transactionUuid;
    const content = req.body.content;
    const reqFile = req.file;

    try {

      if (content === undefined || content.length < 1) {
        const error = Error('Content required');
        error.status = 422;
        throw error;
      }

      let result = await sdk.getSdk(req, res).messages.send({
        transactionId: transactionUuid,
        content: content,
      });

      if (reqFile !== undefined) {

        let messageUuid = result.data.data.id.uuid;

        // Prepare saved file path before saving
        let path = process.env.NODE_ENV + "/messages/" + messageUuid + "/" + encodeURI(reqFile.originalname);

        // First upload file to S3 bucket
        await s3.upload({
          Bucket: process.env.S3_BUCKET,
          Key: path,
          Body: reqFile.buffer
        }).promise();

        // Then save file metadata into DB
        let file = await File.create({
          name: reqFile.originalname.split('.').shift(),
          fileName: reqFile.originalname,
          mimeType: reqFile.mimetype,
          disk: 's3',
          size: reqFile.size,
          path: path,
        });

        // Then create transaction message and associate file with them
        await TransactionMessage.create({
          transactionUuid: transactionUuid,
          messageUuid: messageUuid,
          fileId: file.id,
        });

        result.data.data.file = file;
      }

      return res.send(result);

    } catch (e) {
      return res.status(e.status !== undefined ? e.status : 400).send({
        status: e.status,
        message: e.message,
      });
    }
  },

  list: async (req, res) => {
    const transactionUuid = req.params.transactionUuid;
    const page = req.query.page ? req.query.page : 1;

    try {
      // get all messages from sharetribe-api by transaction uuid
      let result = await sdk.getSdk(req, res).messages.query({
        transactionId: transactionUuid,
        perPage: 25,
        page: page,
      });

      if (Array.isArray(result.data.data)) {

        let data = result.data.data;

        // Retrieve only messageUuid`s
        let messageUuids = data.map(function(value) {
          return value.id.uuid;
        });

        // Get associated files by previously retrieved messageUuid`s
        let trMessages = await TransactionMessage.findAll({
          where: {
            transactionUuid: transactionUuid,
            messageUuid: messageUuids,
          },
          include: [
            { model: File, as: 'file' }, // load all pictures
          ],
        });

        // Make assoc array for fast searching
        let trMessagesAssoc = {};
        await trMessages.forEach(function(value, key) {
          trMessagesAssoc[value.messageUuid] = value;
        });

        // Mix sharetribe-api response with attached files.
        data = data.map(function(value) {
          const uuid = value.id.uuid;
          if (trMessagesAssoc[uuid] !== undefined) {
            value.attributes.file = trMessagesAssoc[uuid].file;
          } else {
            value.attributes.file = null;
          }
          return value;
        });

        result.data.data = data;
      }

      return res.send(result);

    } catch (e) {

      return res.status(404).send({
        'code': e.code,
        'message': e.message,
        'stack': e.stack,
      });
    }
  },
};
