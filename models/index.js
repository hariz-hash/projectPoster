const bookshelf = require('../bookshelf')

const Posters = bookshelf.model('Posters', {
    tableName:'posters'
});

module.exports = { Posters };