require('dotenv').config();

class PageResource {
    constructor(page) {
        this.id = page.id;
        this.title = page.title;
        this.text = page.text;
        this.image = page.image
        // this.image = process.env.URL + '/images' + page.image;
    }
}

module.exports = PageResource;
