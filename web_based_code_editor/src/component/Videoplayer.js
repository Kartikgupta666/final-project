import React, { useState } from 'react'
import ReactPlayer from 'react-player'

const Videoplayer = ({ url, height, width }) => {
  const [ismuted, setIsmuted] = useState(false);
  const handelMute = () => {
    if (ismuted === false) {
      setIsmuted(true);
    }
    else {
      setIsmuted(false)
    }
  }
  return (
    <>
      <ReactPlayer url={url} height={height} width={width} playing muted={ismuted} volume={1} />
      <div className="d-flex gap-2 justify-content-center">
        <button className={`btn btn-${(ismuted === false ? "secondary" : "danger")}`} style={{height : "3.5rem", width : "3.5rem" , border : "1px solid transparent" , borderRadius : "50px", fontSize : "30px" , textAlign : "center"}} onClick={handelMute}>{ismuted === false ? <i className='fa fa-volume-up'></i> : <i className='fa fa-volume-off'></i>}</button>
      </div>
    </>
  )
}

export default Videoplayer
