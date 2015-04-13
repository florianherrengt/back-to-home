var cheerio = require('cheerio');
var moment = require('moment');
var currentDate = moment();
if (currentDate.day() > 4) {
    currentDate.add(7, 'day');
}
var outboundDate = currentDate.day('Friday').format("DD/MM/YYYY");
var inboundDate = currentDate.add(2, 'day').format("DD/MM/YYYY")

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

var home = require('./objects/home.js');
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
    .click(home.input.to)
    .waitFor(home.modal.lille)
    .waitForVisible(home.modal.lille)
    .click(home.modal.lille)
    .pause(5000)
    // set from time
    .waitFor(home.input.departTime)
    .waitForVisible(home.input.departTime)
    .setValue(home.input.departTime, '')
    .click(home.input.departTime)
    .keys(outboundDate)
    .keys('Enter')
    .pause(1000)
    // set return time
    .waitFor(home.input.returnTime)
    .waitForVisible(home.input.returnTime)
    .setValue(home.input.returnTime, inboundDate)
    .click(home.input.submit)
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
    .waitFor(home.firstPrice)
    .waitForVisible(home.firstPrice)
    .click(home.firstPrice)
    .pause(5000)
    .click(home.input.goNext)
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
        console.log(JSON.stringify(eurostarJourneys))
    })
    .end();
