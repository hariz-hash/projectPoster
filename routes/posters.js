const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {Posters, MediaProperty, Tag} = require('../models/index')
const { bootstrapField, createPostersForm } = require('../forms');


router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Posters.collection().fetch(
        {
            withRelated:['mediaProperty']
        }
    );
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', async (req, res) => {
    const mediaProperties  = await MediaProperty.fetchAll().map((each) => {
        return [each.get('id'), each.get('name')];
// console.log(mediaProperties);
    })

    const allTags = await Tag.fetchAll().map( each => [each.get('id'), each.get('name')]);
    const postersForm = createPostersForm(mediaProperties, allTags);
    res.render('posters/create',{
        'form': postersForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
     const mediaProperties  = await MediaProperty.fetchAll().map((each) => {
       return [each.get('id'), each.get('name')];
        console.log(mediaProperties);
    })
    const postersForm = createPostersForm(mediaProperties);
    postersForm.handle(req, {
        'success': async (form) => {
            // separate out tags from the other product data
            // as not to cause an error when we create
            // the new product
            let {tags, ...posterData} = form.data;
            const poster = new Posters(posterData);
            // poster.set('title', form.data.title);
            // poster.set('cost', form.data.cost);
            // poster.set('description', form.data.description);
            // poster.set('date', form.data.date);
            // poster.set('stock', form.data.stock);
            // poster.set('height', form.data.height);
            // poster.set('width', form.data.width);
            await poster.save();
            if (tags) {
                await poster.tags().attach(tags.split(","));
            }
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
        withRelated:['tags'],
    });

        const allTags = await Tag.fetchAll().map(each => [each.get('id'), each.get('name')]);

        // fetch all the categories
        const mediaProperties  = await MediaProperty.fetchAll().map((each) => {
            return [each.get('id'), each.get('name')];
             console.log(mediaProperties);
         })

    const posterForm = createPostersForm(mediaProperties,allTags);

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.width.value = poster.get('media_properties_id');
    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value= selectedTags;


    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })

})

router.post('/:poster_id/update', async (req, res) => {
  /*********** very important to get data from realtion */
            // fetch all the categories
    const mediaProperties  = await MediaProperty.fetchAll().map((each) => {
            return [each.get('id'), each.get('name')];
        })
    

    // fetch the product that we want to update
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    // process the form
    const postersForm = createPostersForm(mediaProperties);
    postersForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData } = form.data;

            poster.set(posterData);
            poster.save();

            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            // add in all the tags selected in the form
            await poster.tags().attach(tagIds);

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
        
    })

})

router.get('/:poster_id/delete', async (req, res) => {
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
});

router.post('/:poster_id/delete', async (req, res) => {
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    await poster.destroy();
    res.redirect('/posters')
})


// router.post('/create', async (req, res) => {
//     // const mediaProperties  = await MediaProperty.fetchAll().map((each) => {
//     //    return [each.get('id'), each.get('name')];
//     //     console.log(mediaProperties);
//     // })
//     // // console.log("in route/poster"+ mediaProperties);

//     // const postersForm = createPostersForm(mediaProperties);
//     // postersForm.handle(req, {
//     //     'success': async (form) => {
//     //         const poster = new Posters();
//     //         await poster.save();
//     //         res.redirect('/posters');
//     //     },
//     //     'error': async (form) => {
//     //         res.render('posters/create', {
//     //             'form': form.toHTML(bootstrapField)
//     //         })
//     //     }
//     // })
// })

module.exports = router;