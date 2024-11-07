import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import peer from '../services/Peer'
import { useNavigate } from 'react-router-dom';
import Videoplayer from './Videoplayer';
const VideoChat = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [RemoteSocketId, setRemoteSocketId] = useState(null)
    const [mystream, setMystream] = useState()
    const [Remotestream, setRemotestream] = useState()
    const handelUserJoined = ({ email, id }) => {
        console.log(`${email} joined the room`)
        setRemoteSocketId(id)
    }
    const handelIncomingcall = async ({ from, offer }) => {
        console.log(`incoming call `, from, offer)
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMystream(stream)
        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted', { to: from, ans })
    }
    const SendStreams = () => {
        for (const track of mystream.getTracks()) {
            peer.peer.addTrack(track, mystream);
        }
    }
    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams
            // console.log("got tracks")
            // console.log(remoteStream[0])
            setRemotestream(remoteStream[0])
        })
    }, [])
    const handelCallAccepted = ({ from, ans }) => {
        peer.setRemoteDescription(ans);
        console.log("call accepted");
        SendStreams()
    }

    const handelNegoNeeded = async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: RemoteSocketId })
    }
    const handelIncomingNego = async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans })
    }
    const handelnegoFinal = async ({ ans }) => {
        await peer.setRemoteDescription(ans)
    }



    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handelNegoNeeded)
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handelNegoNeeded)
        }
    }, [RemoteSocketId, socket, handelNegoNeeded])

    const HandelgoBack = () => {
        navigate("/")
    }

    useEffect(() => {
        socket.on("user:joined", handelUserJoined)
        socket.on("incoming:call", handelIncomingcall)
        socket.on("call:accepted", handelCallAccepted)
        socket.on("peer:nego:needed", handelIncomingNego)
        socket.on("peer:nego:final", handelnegoFinal)
        return () => {
            socket.off("user:joined", handelUserJoined)
            socket.off("incoming:call", handelIncomingcall)
            socket.off("call:accepted", handelCallAccepted)
            socket.off("peer:nego:needed", handelIncomingNego)
            socket.off("peer:nego:final", handelnegoFinal)
        }
    }, [socket, handelIncomingcall, handelUserJoined, handelCallAccepted, handelIncomingNego, handelnegoFinal])
    const handelAdmitUser = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: RemoteSocketId, offer })
        setMystream(stream)
    }
    // const handelHangup = () => {
    //     setRemoteSocketId(null);
    //     navigate('/')
    // }
    return (
        <div className='text-center'>
            <h3>Room {RemoteSocketId ? 'Connected' : 'no one in room'}</h3>
            {RemoteSocketId && <button onClick={handelAdmitUser} className='btn btn-success'>Admit</button>}
            {/* {mystream && <button onClick={SendStreams}>send Stream</button>} */}
            {
                // mystream &&
                // <>
                // <h3>my stream</h3>
                // <Videoplayer url={mystream} height={250} width={300}  />
                // </>
            }
            <hr />
            {Remotestream &&
                <>
                    <h3>Collaborator</h3>
                    <Videoplayer url={Remotestream} height={250} width={300}  />
                </>
            }
            {!RemoteSocketId ? <button onClick={HandelgoBack} className='btn btn-danger'>go back</button> : ""}
            {/* {RemoteSocketId ? <button onClick={handelHangup} className='btn btn-danger text-center' >Hangup</button>:''} */}
        </div>
    )
}

export default VideoChat
