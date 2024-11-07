import React from 'react'

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

export default Loader
