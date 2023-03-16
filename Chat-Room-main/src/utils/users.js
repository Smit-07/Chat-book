const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const existingUser = users.find((ele) => {
    return username === ele.username && ele.room === room;
  });

  if (existingUser) {
    return {
      error: "Username is already in use!",
    };
  }

  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((ele) => id === ele.id);

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((ele) => ele.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();

  return users.filter((ele) => ele.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
