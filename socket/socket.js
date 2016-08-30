module.exports = function(io, rooms){
	var chatrooms = io.of('/roomlist').on('connection', function(socket){
		console.log('connection on ha server pr');
		socket.emit('roomupdate',  JSON.stringify(rooms));

		socket.on('newroom', function(data){
			rooms.push(data);
			console.log(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			socket.emit('roomupdate', JSON.stringify(rooms));
		})
	})

	var messages = io.of('/messages').on('connection', function(socket){
		console.log('connection on ha room ka!!');

		socket.on('joinroom', function(data){
			socket.username = data.user;
			socket.userPic = data.userPic;
			socket.join(data.room);
			updateUserList(data.room, true);
		})

		socket.on('newMessage', function(data){
			socket.broadcast.to(data.user_number).emit('messagefeed', JSON.stringify(data));
		})

		function updateUserList(room, updataAll){
			var getUsers = io.of('/messages').clients(room);
			var userlist = [];
			for(var i in getUsers){
				userlist.push({user:getUsers[i].username, userPic:getUsers[i].userPic});
			}
			socket.to(room).emit('updateUsersList', JSON.stringify(userlist));

			if(updataAll){
				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userlist));
			}
		}


		socket.on('updateList', function(data){
			updateUserList(data.room);
		})
	})
}