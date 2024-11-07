import React from 'react'
import { LANGUAGE_VERSION } from "../constants"
const languages = Object.entries(LANGUAGE_VERSION)
const LanguageSelector = ({ language, onSelect }) => {
    // language is populates by using constants file which is created and exports as constant
    // language and onselect is destructure form the editor to change the name of langauge after selection
    return (
        <>
            <button type="button" className=" btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" id="scrollableDropdown" aria-expanded="false">
                {language.toUpperCase()}
            </button>
           
            <ul className="dropdown-menu" aria-labelledby="scrollableDropdown" style={{maxHeight : "90vh", overflowY: "auto"}}>
                {languages.map(([language, version]) => (
                    <li className="dropdown-item " onClick={() => onSelect(language)} key={language}>{language.toUpperCase()}&nbsp;
                        <p style={{ fontSize: "15px" }}>{version}</p>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default LanguageSelector
