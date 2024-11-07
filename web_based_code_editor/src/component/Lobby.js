import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router-dom'

const Lobby = () => {
    const [email, setEmail] = useState('')
    const [room, setRoom] = useState('')
    const navigate = useNavigate()
    const Socket = useSocket()
    const join = (e) => {
        e.preventDefault();
        Socket.emit("room:join", { email, room });
    }
    const handelJoinRoom = (data) => {
        const { email, room } = data
        console.log(email, room)
        if (email === '' || room === '') {
            return
        }
        else {
            navigate(`/room/${room}`)
        }
    }

    useEffect(() => {
        Socket.on("room:join", handelJoinRoom)
        return () => {
            Socket.off("room:join", handelJoinRoom)

        }
    }, [Socket, handelJoinRoom])


    return (
        <div className='text-center border mt-5 p-3 rounded'>
            <h1>lobby</h1>
            <hr />
            <div className='d-flex flex-column gap-2'>

                <label htmlFor="email">Email</label>
                <input type="email"
                    value={email}
                    id="email"
                    placeholder='enter your email here'
                    onChange={e => setEmail(e.target.value)}
                    className='border rounded'
                    required />

                <label htmlFor="roomcode">RoomCode</label>
                <input type="text" value={room} required id="roomcode" placeholder='enter the room code' className='border rounded' onChange={e => setRoom(e.target.value)} />

                <button onClick={join} className='btn btn-primary' >JOIN</button>
            </div>
        </div>
    )
}

export default Lobby
