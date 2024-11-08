import React, { useEffect, useCallback, useState } from "react";
import Videoplayer from "../component/Videoplayer";
import peer from "../services/Peer";
import { useSocket } from "../context/SocketProvider";

const VideoChat = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log("Incoming Call", from, offer);

            const answer = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, answer });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach((track) => {
                peer.peer.addTrack(track, myStream);
            });
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, answer }) => {
            peer.setLocalDescription(answer);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegotiationNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
        };
    }, [handleNegotiationNeeded]);

    const handleNegotiationIncoming = useCallback(
        async ({ from, offer }) => {
            const answer = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, answer });
        },
        [socket]
    );

    const handleNegotiationFinal = useCallback(async ({ answer }) => {
        await peer.setLocalDescription(answer);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener("track", (event) => {
            const [stream] = event.streams;
            console.log("Received remote track!");
            setRemoteStream(stream[0]);
        });
    }, []);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegotiationIncoming);
        socket.on("peer:nego:final", handleNegotiationFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegotiationIncoming);
            socket.off("peer:nego:final", handleNegotiationFinal);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncomingCall,
        handleCallAccepted,
        handleNegotiationIncoming,
        handleNegotiationFinal,
    ]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
            {myStream && (
                <button onClick={sendStreams} className="btn btn-primary">Send Stream</button>
            )}
            {remoteSocketId && (
                <button onClick={handleCallUser} className="btn btn-success">Admit</button>
            )}
            {myStream && (
                <>
                    <h1>My Stream</h1>
                    <Videoplayer
                        height="100px"
                        width="200px"
                        url={myStream}
                    />
                </>
            )}
            {remoteStream && (
                <>
                    <h1>Remote Stream</h1>
                    <Videoplayer
                        height="100px"
                        width="200px"
                        url={remoteStream}
                    />
                </>
            )}
        </div>
    );
};

export default VideoChat;
