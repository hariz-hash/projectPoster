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

router.get('/:poster_id/update', async (req, res) => {
    // retrieve the product
    const posterId = req.params.poster_id
    const poster = await Posters.where({
        'id': posterId
    }).fetch({
        require: true,
    });

    const posterForm = createPostersForm();

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })

})

router.post('/:poster_id/update', async (req, res) => {

    // fetch the product that we want to update
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    // process the form
    const postersForm = createPostersForm();
    postersForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
        
    })

})
module.exports = router;