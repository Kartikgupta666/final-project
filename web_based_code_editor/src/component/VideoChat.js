import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../services/Peer';
import { useNavigate } from 'react-router-dom';
import Videoplayer from './Videoplayer';

const VideoChat = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [RemoteSocketId, setRemoteSocketId] = useState(null);
    const [mystream, setMystream] = useState();
    const [Remotestream, setRemotestream] = useState();

    const handelUserJoined = ({ email, id }) => {
        console.log(`${email} joined the room`);
        setRemoteSocketId(id);
    };

    const handelIncomingcall = async ({ from, offer }) => {
        console.log(`Incoming call from ${from}`, offer);
        setRemoteSocketId(from);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMystream(stream);

        for (const track of stream.getTracks()) {
            peer.peer.addTrack(track, stream);
        }

        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans });
    };

    const SendStreams = () => {
        if (mystream) {
            for (const track of mystream.getTracks()) {
                peer.peer.addTrack(track, mystream);
            }
        }
    };

    useEffect(() => {
        peer.peer.addEventListener('track', (event) => {
            const [remoteStream] = event.streams;
            setRemotestream(remoteStream);
        });
    }, []);

    const handelCallAccepted = async ({ from, ans }) => {
        try {
            await peer.setRemoteDescription(ans);
            console.log("Call accepted");
            SendStreams();
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    };

    const handelNegoNeeded = async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: RemoteSocketId });
    };

    const handelIncomingNego = async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
    };

    const handelnegoFinal = async ({ ans }) => {
        try {
            await peer.setRemoteDescription(ans);
        } catch (error) {
            console.error("Error in final negotiation:", error);
        }
    };

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handelNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handelNegoNeeded);
        };
    }, [RemoteSocketId]);

    const HandelgoBack = () => {
        navigate("/");
    };

    useEffect(() => {
        socket.on("user:joined", handelUserJoined);
        socket.on("incoming:call", handelIncomingcall);
        socket.on("call:accepted", handelCallAccepted);
        socket.on("peer:nego:needed", handelIncomingNego);
        socket.on("peer:nego:final", handelnegoFinal);

        return () => {
            socket.off("user:joined", handelUserJoined);
            socket.off("incoming:call", handelIncomingcall);
            socket.off("call:accepted", handelCallAccepted);
            socket.off("peer:nego:needed", handelIncomingNego);
            socket.off("peer:nego:final", handelnegoFinal);
        };
    }, [socket]);

    const handelAdmitUser = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMystream(stream);

        for (const track of stream.getTracks()) {
            peer.peer.addTrack(track, stream);
        }

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: RemoteSocketId, offer });
    };

    return (
        <div className='text-center'>
            <h3>Room {RemoteSocketId ? 'Connected' : 'No one in room'}</h3>
            {RemoteSocketId && <button onClick={handelAdmitUser} className='btn btn-success'>Admit</button>}
            {mystream && <Videoplayer url={mystream} height={250} width={300} />}
            <hr />
            {Remotestream && <Videoplayer url={Remotestream} height={250} width={300} />}
            {!RemoteSocketId && <button onClick={HandelgoBack} className='btn btn-danger'>Go back</button>}
        </div>
    );
};

export default VideoChat;
