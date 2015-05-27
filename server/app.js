var scrapers = require('./scrapers');
// scrapers.all()


// scrapers.eurostar(outboundDate, inboundDate, function(values){
//     console.log(JSON.stringify(values));
// });

// scrapers.idbus(outboundDate, inboundDate, function(values){
//     console.log(JSON.stringify(values));
// });

// scrapers.blablacar(outboundDate, 'Lille', inboundDate, 'London', function(values){
//     console.log(JSON.stringify(values));
// });
//

var express = require('express');
var app = express();
var redisClient = require('./lib/redis');

// fs.readFile(path.join(__dirname, '../views/index.tpl.html'), 'utf-8', function(err, template) {
//     if (err) throw err;
//     var indexTemplate = _.template(template);
//     redisClient.hset(['templates', 'eurostar', minify(indexTemplate(data.outbound), {
//         removeComments: true,
//         collapseWhitespace: true
//     })], redis.print);
//     redisClient.save()
// });

// console.log(compiled({ 'user': 'fred' }))

app.set('port', process.env.PORT || 8080);

// app.use(express["static"](path.join(__dirname, "public")));

app.use('/', function(req, res) {
    redisClient.hget('templates', 'blablacar', function(err, reply) {
        res.send(reply);
    });
});
// start server
app.listen(app.get('port'), function() {
    console.log('Server listen on port ' + app.get('port'));
});
