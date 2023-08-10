const express = require('express');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const bodyParser = require('body-parser');
const upload = require('../images/multerConfig');
const { body, validationResult } = require('express-validator');
const { Test } = require('../models');
const path = require('path');
const fs = require('fs');
const TestResource = require('../resource/TestResource');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



router.get('/', authMiddleware, (req, res) => {
    /* #swagger.security = [{
     "Bearer": []
 }] */
    /* 	#swagger.tags = ['Test']
       #swagger.description = 'Endpoint to sign in a specific Test' */


    Test.findAll()
        .then((tests) => {
            const transformedTests = tests.map((test) => new TestResource(test));
            res.json(transformedTests);
        })
        .catch((error) => {
            console.error('Test getirirken hata oluştu:', error);
            res.status(500).json({ error: 'Test getirirken hata oluştu' });
        });
});


router.post('/', authMiddleware, upload.single('image'), [
    body('title').notEmpty().withMessage('Başlık boş olamaz'),
    body('text').notEmpty().withMessage('Metin boş olamaz'),
], async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    
    /* 	#swagger.tags = ['Test']
    #swagger.description = 'Endpoint to sign in a specific Test' */

    /*
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['title'] = {
     in: 'formData',
     type: 'string',
     required: true,
    }
    #swagger.parameters['text'] = {
     in: 'formData',
     type: 'string',
     required: true,
    }
    #swagger.parameters['button_text'] = {
     in: 'formData',
     type: 'string',
     required: true,
    }
    #swagger.parameters['image'] = {
     in: 'formData',
     type: 'file',
     required: true,
     description: 'Some description...',
    }
    */

    const destinationPath = path.join(__dirname, '..', 'images', 'uploads');

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    const imagePath = path.join(destinationPath, req.file.filename);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    fs.rename(req.file.path, imagePath, async (err) => {
        if (err) {
            console.error('Resim yüklerken hata oluştu:', err);
            return res.status(500).json({ error: 'Resim yüklerken hata oluştu' });
        }

        const { title, text, button_text } = req.body;
        const imagePath = '/uploads/' + req.file.filename;

        try {
           const test = await Test.create({
                title,
                text,
                button_text,
                image: imagePath,
            });

            res.status(201).json({ message: 'Test oluşturuldu', test : new TestResource(test)});
        } catch (error) {
            console.error('Test oluştururken hata oluştu:', error);
            res.status(500).json({ error: 'Test oluştururken hata oluştu' });
        }
    });
});



router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    /* #swagger.security = [{
     "Bearer": []
 }] */

    
    /* 	#swagger.tags = ['Test']
    #swagger.description = 'Endpoint to sign in a specific Test' */

    /*

   #swagger.consumes = ['multipart/form-data']
   #swagger.parameters['title'] = {
    in: 'formData',
    type: 'string',
    required: false,
   }
   #swagger.parameters['text'] = {
    in: 'formData',
    type: 'string',
    required: false,
   }
   #swagger.parameters['button_text'] = {
    in: 'formData',
    type: 'string',
    required: false,
   }
   #swagger.parameters['image'] = {
    in: 'formData',
    type: 'file',
    required: false,
    description: 'Some description...',
   }
   */
    const destinationPath = path.join(__dirname, '..', 'images', 'uploads');

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    const { title, text,button_text } = req.body;
    const id = req.params.id;

    if (req.file) {
        const imagePath = path.join(destinationPath, req.file.filename);

        fs.rename(req.file.path, imagePath, async (err) => {
            if (err) {
                console.error('Resim yüklerken hata oluştu:', err);
                return res.status(500).json({ error: 'Resim yüklerken hata oluştu' });
            }

            try {
                const updatedCount = await Test.update(
                    { title, text,button_text, image: '/uploads/' + req.file.filename },
                    { where: { id } }
                );

                if (updatedCount[0] === 0) {
                    return res.status(404).json({ error: 'Test bulunamadı' });
                }

                res.json({ message: 'Test güncellendi' });
            } catch (error) {
                console.error('Test güncellenirken hata oluştu:', error);
                res.status(500).json({ error: 'Test güncellenirken hata oluştu' });
            }
        });
    } else {
        try {
            const test = await Test.findByPk(id);

            if (!test) {
                return res.status(404).json({ error: 'Test bulunamadı' });
            }

            await Test.update(
                { title, text, button_text,image: test.image },
                { where: { id } }
            );

            res.json({ message: 'Test güncellendi' , test: new TestResource(test)});
        } catch (error) {
            console.error('Test güncellenirken hata oluştu:', error);
            res.status(500).json({ error: 'Test güncellenirken hata oluştu' });
        }
    }
});



router.delete('/:id', authMiddleware, async(req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    /* 	#swagger.tags = ['Test']
    #swagger.description = 'Endpoint to sign in a specific Test' */
    const id = req.params.id;

    try {
        const deletedCount = await Test.destroy({ where: { id } });

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Test bulunamadı' });
        }

        res.json({ message: 'Test silindi' });
    } catch (error) {
        console.error('Test silinirken hata oluştu:', error);
        res.status(500).json({ error: 'Test silinirken hata oluştu' });
    }
});

module.exports = router;
