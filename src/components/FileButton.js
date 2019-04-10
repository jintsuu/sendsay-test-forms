import React from 'react';

import del from '../img/del.svg';


const FileButton = ({ buttonCounter, addFile, deleteFile, index}) => {
     return(
        <div className="file-input-wrapper" id={`button-${index}`}>
            <input className="file-input" type="file" id={`file-${index}`} onChange={ (e) => addFile(e.target.files[0]) }/>
            <label htmlFor={`file-${index}`} className="file-label" id={`label-${index}`}>Add some file into me!</label>
            <img src={ del } alt="Delete" className={ buttonCounter === index ? "disabled" : "delete-btn" } onClick={ () => deleteFile(index) } />
        </div> 
    );
}

export default FileButton;