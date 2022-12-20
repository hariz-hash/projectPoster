const bookshelf = require('../bookshelf')

const Posters = bookshelf.model('Posters', {
    tableName:'posters',
    mediaProperty() {
        return this.belongsTo('MediaProperty','media_properties_id')
    },//veryyy important to add foreign key on both sides
    tags() {
        return this.belongsToMany('Tag');
    }
});

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName:'media_properties',
    posters() {
        return this.hasMany('Posters','media_properties_id');
    }
});
const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    posters() {
        return this.belongsToMany('Posters')
    }
})


module.exports = { Posters, MediaProperty, Tag };
