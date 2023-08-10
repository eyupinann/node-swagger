const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const firebaseConfig = require('../config/firebase-config');
const express = require('express');
const {Pool} = require('pg');
const dbConfig = require('../server');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const pool = new Pool(dbConfig);
const multer = require("multer");
const bodyParser = require('body-parser');
// const upload = require('../images/multerConfig');
const {body, validationResult} = require('express-validator');
const {Page} = require('../models');
const path = require('path');
const fs = require('fs');
const PageResource = require('../resource/PageResource');
const upload = multer({ storage: multer.memoryStorage() });

initializeApp(firebaseConfig);
const storage = getStorage();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));



router.get('/', authMiddleware, (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    /* 	#swagger.tags = ['Page']
        #swagger.description = 'Endpoint to sign in a specific Page' */

    Page.findAll()
        .then((pages) => {
            const transformedPages = pages.map((page) => new PageResource(page));
            res.json(transformedPages);
        })
        .catch((error) => {
            console.error('Sayfaları getirirken hata oluştu:', error);
            res.status(500).json({error: 'Sayfa getirirken hata oluştu'});
        });
});


router.post('/', authMiddleware, upload.single('image'), [body('title').notEmpty().withMessage('Başlık boş olamaz'), body('text').notEmpty().withMessage('Metin boş olamaz'),], async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
 /* 	#swagger.tags = ['Page']
     #swagger.description = 'Endpoint to sign in a specific Page' */
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
    #swagger.parameters['image'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'Some description...',
    }
    */


    const storageRef = ref(storage, `${req.file.originalname}`);

    const metadata = {
        contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);

    const downloadURL = await getDownloadURL(snapshot.ref);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

        const {title, text} = req.body;
        // const imagePath = '/uploads/' + req.file.filename;

        try {
           const page = await Page.create({
                title, text, image: downloadURL,
            });

            res.status(201).json({message: 'Sayfa oluşturuldu', page: new PageResource(page)});
        } catch (error) {
            console.error('Sayfa oluştururken hata oluştu:', error);
            res.status(500).json({error: 'Sayfa oluştururken hata oluştu'});
        }

});


router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */

    /* 	#swagger.tags = ['Page']
  #swagger.description = 'Endpoint to sign in a specific Page' */

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
 #swagger.parameters['image'] = {
     in: 'formData',
     type: 'file',
     required: false,
     description: 'Some description...',
 }
 */

    const {title, text} = req.body;
    const id = req.params.id;

    if (req.file) {
        const storageRef = ref(storage, `${req.file.originalname}`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);

        const downloadURL = await getDownloadURL(snapshot.ref);

        try {
            // Use the update method to update the record by ID with the new image
            const updatedCount = await Page.update({
                title, text, downloadURL
            }, {where: {id}});

            if (updatedCount[0] === 0) {
                return res.status(404).json({error: 'Sayfa bulunamadı'});
            }

            res.json({message: 'Sayfa güncellendi'});
        } catch (error) {
            console.error('Sayfa güncellenirken hata oluştu:', error);
            res.status(500).json({error: 'Sayfa güncellenirken hata oluştu'});
        }

    } else {
        try {
            const page = await Page.findByPk(id);

            if (!page) {
                return res.status(404).json({error: 'Sayfa bulunamadı'});
            }

            await Page.update({title, text, image: page.image}, {where: {id}});

            res.json({message: 'Sayfa güncellendi',page : new PageResource(page)});
        } catch (error) {
            console.error('Sayfa güncellenirken hata oluştu:', error);
            res.status(500).json({error: 'Sayfa güncellenirken hata oluştu'});
        }
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    /* #swagger.security = [{
 "Bearer": []
}] */
    /* 	#swagger.tags = ['Page']
  #swagger.description = 'Endpoint to sign in a specific Page' */
    const id = req.params.id;

    try {
        const deletedCount = await Page.destroy({where: {id}});

        if (deletedCount === 0) {
            return res.status(404).json({error: 'Sayfa bulunamadı'});
        }

        res.json({message: 'Sayfa silindi'});
    } catch (error) {
        console.error('Sayfa silinirken hata oluştu:', error);
        res.status(500).json({error: 'Sayfa silinirken hata oluştu'});
    }
});

module.exports = router;
