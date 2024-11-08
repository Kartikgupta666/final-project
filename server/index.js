const { Server } = require('socket.io')


const io = new Server(8000, {
    cors: true,
});
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected: " + socket.id);

    // Handle room joining
    socket.on("room:join", (data) => {
        const { email, room } = data;

        // Map email to socket ID and vice versa
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        // Notify the room that a new user has joined
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });

        // Notify the user of their room join confirmation
        io.to(socket.id).emit("room:join", data);
    });

    // Handle incoming call
    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    // Handle call acceptance
    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    // Handle negotiation needed for connection
    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    // Handle final negotiation after answering an offer
    socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    // Handle editor changes for live collaborative editing
    socket.on("editorChange", ({ id, value }) => {
        io.to(id).emit("editorChange", value);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected: " + socket.id);
        const email = socketIdToEmailMap.get(socket.id);

        // Remove socket ID and email from maps
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(socket.id);
    });
});

console.log("Socket.io server is running on port 8000");