import React from 'react';

import del from '../img/del.svg';


const FileButton = ({ fileCounter, addFile, index }) => {

    return(
        <div className="file-input-wrapper">
            <input className="file-input" type="file" id={`file-${index}`} onChange={ (e) => addFile(e.target.files[0]) }/>
            <label htmlFor={`file-${index}`} className="file-label" id={`label-${index}`}>Add some file into me!</label>
            <img src={ del } alt="Delete" className = { fileCounter === index ? "delete-btn--disabled" : "delete-btn" } />
        </div>
    );
}

export default FileButton;