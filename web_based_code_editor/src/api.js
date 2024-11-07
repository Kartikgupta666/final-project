import axios from "axios";
import { LANGUAGE_VERSION } from "./constants";
const api = "https://emkc.org/api/v2/piston";

export const executeCode = async (language, sourceCode) => {
    const res = await axios.post(`${api}/execute`, {

        "language":  language ,
        "version": LANGUAGE_VERSION[language],
        "files": [
            {
                "content":  sourceCode 
            }
        ],

    })
    return res.data
}