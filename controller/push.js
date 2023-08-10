const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const serviceAccount = require('../config/auth-213ef-firebase-adminsdk-xoha3-2d2d4119e7.json');


const router = express.Router();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/', async (req, res) => {
    /* 	#swagger.tags = ['Push']
      #swagger.description = 'Endpoint to sign in a specific Push' */

    /*
   #swagger.consumes = ['application/x-www-form-urlencoded']
   #swagger.parameters['token'] = {
       in: 'formData',
       type: 'string',
       required: true,
   }

   */
    const token = req.body.token;
    console.log(token);

    const message = {
        token: token,
        notification: {
            title: 'Test',
            body: 'Lorem ipsum dolor sit amet',
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent notification:', response);
        res.json( response);
    } catch (error) {
        console.error('Error sending notification:', error);
        res.json( error);
    }
});

module.exports = router;
