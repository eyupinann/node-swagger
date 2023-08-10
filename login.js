const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dbConfig = require('./server');
const jwt = require('jsonwebtoken');
const { verifyToken, secretKey } = require('./auth');
const crypto = require('crypto');

const router = express.Router();
const pool = new Pool(dbConfig);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/', async (req, res) => {
    
    /* 	#swagger.tags = ['Auth']
    #swagger.description = 'Endpoint to sign in a specific Auth' */

    /*
   #swagger.consumes = ['application/x-www-form-urlencoded']
   #swagger.parameters['email'] = {
       in: 'formData',
       type: 'string',
       required: true,
   }
   #swagger.parameters['password'] = {
       in: 'formData',
       type: 'string',
       required: true,
   }
   */
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const values = [email, hashedPassword];
        const result = await pool.query(query, values);
        const user = result.rows[0];

        if (user) {
            const token = jwt.sign({ email }, secretKey);
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Kullanıcı girişi sırasında bir hata oluştu:', error);
        res.status(500).json({ error: 'An error occurred during user login' });
    }
});

module.exports = router;
