import React, { useState } from 'react'
import { executeCode } from "../api"
import Loader from './Loader'
const Output = ({ code, language }) => {


    // code compilation process
    const [output, setOutput] = useState(null)
    const [isError, setisError] = useState(false)
    const [Loading, setLoading] = useState(false)

    const runCode = async () => {
        const sourceCode = code;
        if (!sourceCode || sourceCode == null) return;
        setLoading(true)
        try {
            const { run: result } = await executeCode(language, sourceCode)
            setOutput((result.output).split('\n'))
            result.stderr ? setisError(true) : setisError(false)
            // console.log(output)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    const clear = () => {
        setOutput(null)
    }
    return (
        <>

            <div className=" d-flex justify-content-between">
                <h3 className=''>Output</h3>
                <div className="d-flex gap-2">
                    <button type="button" className='btn btn-danger mb-2 ' onClick={clear}>Clear</button>
                    <button type='button' className='btn btn-primary mb-2' onClick={runCode}>RUN</button>
                </div>
            </div>
            <div className={`border px-2 ${isError ? "border-danger" : " "}`} style={{ height: "90vh" , overflowY : "hidden"}}>
                {output ? output.map((output, index) => (
                    <p key={index} className={`${isError ? "text-danger" : " "}`}>{output}</p>
                )) : <p> Run your code </p>}
                {Loading?<Loader />:""}


            </div>
        </>
    )
}

export default Output
