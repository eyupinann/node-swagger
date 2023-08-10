const express = require('express');
const authMiddleware = require("./middleware/authMiddleware");
const crypto = require('crypto');
const {users} = require("./models");
const UserResource = require("./resource/UserResource");
const bodyParser = require("body-parser");
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', authMiddleware,(req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    /* 	#swagger.tags = ['Users']
      #swagger.description = 'Endpoint to sign in a specific Users' */

    users.findAll()
        .then((users) => {
            const transformedTests = users.map((user) => new UserResource(user));
            res.json(transformedTests);
        })
        .catch((error) => {
            console.error('Kullanıcı getirirken hata oluştu:', error);
            res.status(500).json({ error: 'Kullanıcı getirirken hata oluştu' });
        });
});

router.post('/', authMiddleware, [
    body('name').notEmpty().withMessage('İsim boş olamaz'),
    body('email').notEmpty().withMessage('Email boş olamaz'),
    body('password').notEmpty().withMessage('Şifre boş olamaz'),
], async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */

    /* 	#swagger.tags = ['Users']
    #swagger.description = 'Endpoint to sign in a specific Users' */

    /*
     #swagger.consumes = ['application/x-www-form-urlencoded']
    #swagger.parameters['name'] = {
        in: 'formData',
        type: 'string',
        required: true,
    }
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
    const { name, email, password } = req.body;
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'Kullanıcı oluşturuldu', user: new UserResource(newUser) });
    } catch (error) {
        console.error('Kullanıcı oluştururken hata oluştu:', error);
        res.status(500).json({ error: 'Kullanıcı oluştururken hata oluştu' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */

    /* 	#swagger.tags = ['Users']
    #swagger.description = 'Endpoint to sign in a specific Users' */
    /*
 #swagger.consumes = ['application/x-www-form-urlencoded']
    #swagger.parameters['name'] = {
        in: 'formData',
        type: 'string',
        required: false,
    }
    #swagger.parameters['email'] = {
        in: 'formData',
        type: 'string',
        required: false,
    }
       #swagger.parameters['password'] = {
        in: 'formData',
        type: 'string',
        required: false,
    }

    */
    const id = req.params.id;
    const { name, email, password } = req.body;
    try {
        const user = await users.findByPk(id);

        const updatedData = {}; // Initialize the updatedData object

        if (name) {
            updatedData.name = name;
        }
        if (email) {
            updatedData.email = email;
        }
        if (password) {
            const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
            updatedData.password = hashedPassword;
        }


        const [updatedCount, updatedUsers] = await users.update(updatedData, {
            where: { id },
        });

        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Kullanıcı güncellendi', user: new UserResource(user)});
    } catch (error) {
        console.error('Kullanıcı güncellenirken hata oluştu:', error);
        res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
    }
});


router.delete('/:id', authMiddleware, async(req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    /* 	#swagger.tags = ['Users']
    #swagger.description = 'Endpoint to sign in a specific Users' */
    const id = req.params.id;

    try {
        const deletedCount = await users.destroy({ where: { id } });

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Kullanıcı silindi' });
    } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
        res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu' });
    }
});

module.exports = router;
