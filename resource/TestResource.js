require('dotenv').config();

class TestResource {
    constructor(test) {
        this.id = test.id;
        this.title = test.title;
        this.text = test.text;
        this.button_text = test.button_text;
        this.image = process.env.URL + '/images' + test.image;
    }
}

module.exports = TestResource;
