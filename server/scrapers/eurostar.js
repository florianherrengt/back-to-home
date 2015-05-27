//ToDO: Remove pause
var cheerio = require('cheerio');

module.exports = function(outboundDate, inboundDate, callback) {
    var eurostarJourneys = {
        outbound: {
            date: outboundDate,
            journeys: []
        },
        inbound: {
            date: inboundDate,
            journeys: []
        }
    }

    var page = require('./objects/eurostar.js');
    var webdriverio = require('webdriverio'),
        client = webdriverio.remote({
            desiredCapabilities: {
                // browserName: 'chrome'
                browserName: 'phantomjs'
            }
        }).init();

    client
        .url('http://www.eurostar.com/uk-en')
        //set destination
        .click(page.input.to)
        .waitFor(page.modal.lille)
        .waitForVisible(page.modal.lille)
        .click(page.modal.lille)
        .pause(5000)
        // set from time
        .waitFor(page.input.departTime)
        .waitForVisible(page.input.departTime)
        .setValue(page.input.departTime, '')
        .click(page.input.departTime)
        .keys(outboundDate)
        .keys('Enter')
        .pause(1000)
        // set return time
        .waitFor(page.input.returnTime)
        .waitForVisible(page.input.returnTime)
        .setValue(page.input.returnTime, inboundDate)
        .click(page.input.submit)
        .pause(10000)
        .source(function(err, res) {
            $ = cheerio.load(res.value);
            $('.price-row.even').each(function(i, elem) {
                eurostarJourneys.outbound.journeys.push({
                    depart: $(this).find('.depart.first').html(),
                    arrive: $(this).find('.arrive').html(),
                    price: $(this).find('.price-cell.standard .price').text().match(/([\d]){2}\.([\d]){2}/)[0]
                });
            });
        })
        .waitFor(page.firstPrice)
        .waitForVisible(page.firstPrice)
        .click(page.firstPrice)
        .pause(5000)
        .click(page.input.goNext)
        .pause(5000)
        .source(function(err, res) {
            $ = cheerio.load(res.value);
            $('.price-row.even').each(function(i, elem) {
                eurostarJourneys.inbound.journeys.push({
                    depart: $(this).find('.depart.first').html(),
                    arrive: $(this).find('.arrive').html(),
                    price: $(this).find('.price-cell.standard .price').text().match(/([\d]){2}\.([\d]){2}/)[0]
                });
            });
            callback(eurostarJourneys);
        })
        .end();
};
