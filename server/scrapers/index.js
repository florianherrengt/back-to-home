var moment = require('moment');
var scrapers = {
    eurostar: require('./eurostar'),
    idbus: require('./idbus'),
    blablacar: require('./blablacar')
};

module.exports = {
    getOne: function(type, outboundDate, outboundLocation, inboundDate, inboundLocation, callback){
        var scrapper = scrapers[type];
        var currentDate = moment();
        if (currentDate.day() > 4) {
            currentDate.add(7, 'day');
        }
        outboundDate = currentDate.day('Friday').format("DD/MM/YYYY");
        inboundDate = currentDate.add(2, 'day').format("DD/MM/YYYY");

        scrapper(outboundDate, 'Lille', inboundDate, 'London', function() {
            console.log(type + ' scraper: done');
        });

    },
    all: function() {

        // this.blablacar(outboundDate, 'Lille', inboundDate, 'London', function() {
        //     console.log('Blablacar scraper: done');
        // });

        // this.blablacar(outboundDate, 'Lille', inboundDate, 'London', function() {
        //     console.log('Blablacar scraper: done');
        // });
    }
};
