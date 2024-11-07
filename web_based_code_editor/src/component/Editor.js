import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import Lobby from './Lobby';
import { Routes, Route } from 'react-router-dom'
import VideoChat from '../component/VideoChat'
import { useSocket } from '../context/SocketProvider';


const CodeEditor = () => {
    const socket = useSocket()
    const editorRef = useRef(null);
    const [value, setValue] = useState('')
    const [id, setID] = useState('')
    const [language, setlangauge] = useState("javascript")
    const handelUserJoined = (data) => {
        // console.log(data)
        setID(data.room)
    }
    useEffect(() => {
        const handleEditorChange = (newValue) => {
            setValue(newValue);
        };

        socket.on("editorChange", handleEditorChange);
        return () => {
            socket.off("editorChange")
        }
    }, [])
    useEffect(() => {
        socket.on("room:join", handelUserJoined)
        return () => {
            socket.off("user:joined")
        }
    })
    const handelOnMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    const onSelect = (language) => {
        setlangauge(language);
    }
    const handelchange = (value) => {
        socket.emit("editorChange", { id, value })
        setValue(value)
    }

    return (
        <div>
            <div className="row ">
                <div className="col-6">
                    <div className=" d-flex gap-2 mb-2 justify-content-end">
                        <LanguageSelector language={language} onSelect={onSelect} />

                    </div>
                    <div style={{ border: "1px solid #ddd" }}>
                        <Editor
                            height="90vh"
                            language={language.toLowerCase()}
                            defaultValue="// write code here"
                            value={value}
                            theme="vs-dark"
                            onChange={handelchange}
                            onMount={handelOnMount}
                            minmap='false'
                        />
                    </div>
                </div>
                <div className="col-3 ">
                    <Output code={value} language={language} />
                </div>
                <div className="col-3 ">
                    <Routes>
                        <Route exact path="/" element={<Lobby />} />
                        <Route exact path="/room/:roomId" element={<VideoChat />}></Route>
                    </Routes>
                </div>

            </div>
        </div>
    );
};

export default CodeEditor;
