var express			= require('express')
var app					= express()
var server			= require('http').createServer(app)
var io 					= require('socket.io').listen(server)

var users 			= []
var connections	= []
var messages 		= []

server.listen(process.env.PORT || 3000, function(){
	console.log('Server is running!')
})

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
})

// Open connetion
io.on('connection', function(s){
	connections.push(s)
	console.log('Connected: %s sockets connected.', connections.length)

	// Get old messages on load
	s.on('get old messages', function(){
		// console.log('front is loaded', messages)
		s.emit('send old messages', messages)
	})

	// Sending message
	s.on('send message', function(data){
		messages.push(data)
		io.sockets.emit('new message', data)
		// console.log('I got a message-back: ', data)
	})

	// New user
	s.on('new user', function(data, callback){
		callback(true)
		s.username = data
		users.push(s.username)
		updateUsernames()
		// console.log('I got a message-back: ', data)
	})

	// function to help updating the usernames
	function updateUsernames(){
		io.sockets.emit('get users', users)
	}

	// On dis-connect
	s.on('disconnect', function(){
		connections.splice(connections.indexOf(s), 1)
		console.log('Disconnected: %s sockets connected.', connections.length)
		if(!s.username){
			return
		}else{
			users.splice(users.indexOf(s.username), 1)
			updateUsernames()
		}
	})
})