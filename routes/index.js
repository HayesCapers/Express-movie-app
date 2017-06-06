var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
});

connection.connect();

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
			sessionInfo: req.session
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

router.get('/register',(req,res)=>{
	var message = req.query.msg
	if (message == 'badEmail'){
		message = 'This email is already registered'
	}
	res.render('register',{
		message
	});
});

router.post('/registerProcess', (req,res)=>{
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);

	var selectQuery = "SELECT * FROM users WHERE email = ?"
	connection.query(selectQuery, [email], (error,results)=>{
		if(results.length == 0){
			var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)"
			connection.query(insertQuery, [name,email,hash], (error,results)=>{
				// add session vars name,email,loggedin,id
				req.session.name = name;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/?msg=registered')
			});
		}else{
			res.redirect('/register?msg=badEmail');
		}	
	});	
});

router.get('/login',(req,res)=>{
	res.render('login',{

	});
});

router.post('/processLogin', (req,res)=>{
	// res.json(req.body);
	var email = req.body.email;
	var password = req.body.password;
	var selectQuery = "SELECT * FROM users WHERE email = ?"

	connection.query(selectQuery,[email], (error,results)=>{
		if (results.length == 1){
			var match = bcrypt.compareSync(password,results[0].password);
			if (match){
				req.session.loggedin = true;
				req.session.name = results.name;
				req.session.email = results.email;
				res.redirect('/?msg=loggedin');
			}else{
				res.redirect('/login?msg=badLogin')
			}	
		}else{
			// This is not the doid we are looking for
			res.redirect('/login?msg=badLogin')
		}
	});
});

module.exports = router;

























