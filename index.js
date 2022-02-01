import { Server } from "socket.io";

const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
 });

let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
};

io.on("connection", (socket) => {
    // when connect
    console.log("a user connected.");
    
    // take userId and socketId from user
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    // send and get message
    socket.on("sendMessage", ({ senderId, senderPicture, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getMessage", {
            senderId,
            senderPicture,
            text
        });
    });

    socket.on("sendNotification", ({ senderId, receiverId, type }) => {
        const receiver = getUser(receiverId);
        io.to(receiver?.socketId).emit("getNotification", {
            senderId,
            type
        });
    });

    socket.on("sendText", ({ senderId, receiverId, text }) => {
        const receiver = getUser(receiverId);
        io.to(receiver?.socketId).emit("getText", {
            senderId,
            text
        });
    });

    // when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected.");
        removeUser(socket.id);
    });
});

io.listen(process.env.PORT || 5000);