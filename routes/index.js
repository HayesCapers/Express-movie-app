var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key=' + config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
const imageBackDropUrl = 'http://image.tmdb.org/t/p/w600';



/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movie_list', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: 'Welcome to this thing... it is a thing',
		});
	});
});

router.post('/search',(req,res)=>{
	// req.body is available b/c of the body parser module
	// body parser module was installed when we created the Expressapp
	// req.body is where Posted data will live
	// console.log(req.body);
	// res.json(req.body);
	var termUserSearchedFor = req.body.searchString;
	var searchUrl = `${apiBaseUrl}/search/movie?query=${termUserSearchedFor}&api_key=${config.apiKey}`;
	request.get(searchUrl,(error,response,movieData)=>{
		// res.json(JSON.parse(movieData));
		var movieData = JSON.parse(movieData);
		res.render('movie_list',{
			movieData: movieData.results,
			imageBaseUrl:imageBaseUrl,
			titleHeader: `You searched for something(${termUserSearchedFor})... Here are some things.`
		});
	});	
});

router.get('/movie/:id', (req,res)=>{
	// The route has a wildcard variable (id) in it
	// Wildcard routes are stored in req.params.(whatever the wildcard is named)
	var thisMovieId = req.params.id
	var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
	// res.send(req.params.id);
	request.get(thisMovieUrl, (error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		// res.json(movieData);
		// First arg = the view.ejs filename
		// Second param = what to send the view
		res.render('single-movie', {
			movieData: movieData,
			imageBaseUrl: imageBackDropUrl,
		});
	});
});

module.exports = router;
