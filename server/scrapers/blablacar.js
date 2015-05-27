var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var redisClient = require('../lib/redis');
var path = require('path');
var minify = require('html-minifier').minify;
var fs = require('fs');
var _ = require('lodash');
var redis = require('redis');

module.exports = function(outboundDate, outboundLocation, inboundDate, inboundLocation, callback) {
    var blablacarJourneys = {
        outbound: {
            date: outboundDate,
            journeys: []
        },
        inbound: {
            date: inboundDate,
            journeys: []
        }
    };
    var getData = function(from, to, date, type, done) {
        var url = 'https://www.blablacar.co.uk/search_xhr?fn=' + from + '&tn=' + to + '&db=' + date + '&sort=trip_date&order=asc&limit=100';

        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(JSON.parse(body).html.results);
                var schedules = $('ul.trip-search-results li');
                $(schedules).each(function() {
                    blablacarJourneys[type].journeys.push({
                        departTime: $(this).find('h3.time').text().match(/[\d]{2}:[\d]{2}/)[0],
                        from: $(this).find('dl.geo-from > dd').text().trim(),
                        to: $(this).find('dl.geo-to > dd').text().trim(),
                        price: $(this).find('div.offer.span2 > div.price.price-red > strong > span').text().replace(/[^0-9]/g, '')
                    });
                });
            }
            done();
        });
    };

    async.parallel([function(done) {
        getData(inboundLocation, outboundLocation, encodeURIComponent(outboundDate), 'inbound', done);
    }, function(done) {
        getData(outboundLocation, inboundLocation, encodeURIComponent(inboundDate), 'outbound', done);
    }], function() {
        fs.readFile(path.join(__dirname, '../../views/blablacar.tpl.html'), 'utf-8', function(err, template) {
            if (err) throw err;
            var indexTemplate = _.template(template);
            redisClient.hset(['templates', 'blablacar', minify(indexTemplate(blablacarJourneys.outbound), {
                removeComments: true,
                collapseWhitespace: true
            })], redis.print);
            redisClient.save();
            callback();
        });
    });
};
