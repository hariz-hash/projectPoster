const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {Posters} = require('../models')
const { bootstrapField, createPostersForm } = require('../forms');


router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Posters.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
  
})

router.get('/create', async (req, res) => {
    const postersForm = createPostersForm();
    res.render('posters/create',{
        'form': postersForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const postersForm = createPostersForm();
    postersForm.handle(req, {
        'success': async (form) => {
            const poster = new Posters();
            poster.set('title', form.data.title);
            poster.set('cost', form.data.cost);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            await poster.save();
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;