var cheerio = require('cheerio');
var moment = require('moment');
var currentDate = moment();
if (currentDate.day() > 4) {
    currentDate.add(7, 'day');
}
var outboundDate = currentDate.day('Friday').format("DD/MM/YYYY");
var inboundDate = currentDate.add(2, 'day').format("DD/MM/YYYY")

var idBusJourneys = {
    outbound: {
        date: outboundDate,
        journeys: []
    },
    inbound: {
        date: inboundDate,
        journeys: []
    }
}

var page = require('./objects/idbus.js');
var webdriverio = require('webdriverio'),
    client = webdriverio.remote({
        desiredCapabilities: {
            // browserName: 'chrome'
            browserName: 'phantomjs'
        }
    }).init();

client
    // .url('http://localhost:8000')
    .url('http://uk.idbus.com/')
    .click(page.input.to)
    .click(page.modal.lille)
    .setValue(page.input.departTime, outboundDate)
    .setValue(page.input.returnTime, inboundDate)
    .click(page.input.submit)
    .pause(5000)
    .source(function(err, res) {
        var $ = cheerio.load(res.value);
        var schedules = $('.schedules');
        var outboundSchedule = $(schedules[0]);
        var inboundSchedule = $(schedules[1]);
        $(outboundSchedule.find('ul')).each(function() {
            var price = $(this).find('.offer').text();
            if (price !== 'Full') {
                idBusJourneys.outbound.journeys.push({
                    depart: $(this).find('.depart > span:nth-child(2)').text(),
                    arrive: $(this).find('.arrival > span:nth-child(2)').text(),
                    price: price
                });
            }
        });
        $(inboundSchedule.find('ul')).each(function() {
            var price = $(this).find('.offer').text();
            if (price !== 'Full' && price !== '') {
                idBusJourneys.inbound.journeys.push({
                    depart: $(this).find('.depart > span:nth-child(2)').text(),
                    arrive: $(this).find('.arrival > span:nth-child(2)').text(),
                    price: price
                });
            }
        });
        console.log(JSON.stringify(idBusJourneys));
    })
    .end();
