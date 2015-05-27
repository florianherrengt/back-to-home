//ToDo: DRY code
var cheerio = require('cheerio');
var redisClient = require('../lib/redis');
var path = require('path');
var minify = require('html-minifier').minify;
var fs = require('fs');
var _ = require('lodash');
var redis = require('redis');

module.exports = function(outboundDate, outboundLocation, inboundDate, inboundLocation, callback) {
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
        .url('http://uk.idbus.com/')
        .click(page.input.to)
        .click(page.modal.lille)
        .setValue(page.input.departTime, outboundDate)
        .setValue(page.input.returnTime, inboundDate)
        .click(page.input.submit)
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
            fs.readFile(path.join(__dirname, '../../views/journeys.tpl.html'), 'utf-8', function(err, template) {
                if (err) throw err;
                var indexTemplate = _.template(template);
                redisClient.hset(['templates', 'idbus', minify(indexTemplate(blablacarJourneys.outbound), {
                    removeComments: true,
                    collapseWhitespace: true
                })], redis.print);
                redisClient.save();
                callback();
            });
        })
        .end();
};
