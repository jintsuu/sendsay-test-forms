import React, { Component } from 'react';
import Sendsay from 'sendsay-api';

import FileButton from './components/FileButton';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      fileCounter: 1,
      sizeSum: 0,
      files: [],
      dragging: false,
      filesButtons: [],
    };
  }

  // ---------------------------------- DRAG AND DROP -------------------------------------------

  dropRef = React.createRef();

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;
    if(e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
    }
  }

  handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.setState({ dragging: false });
    }
  }
  
  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      dragging: false
    });
    const data = e.dataTransfer.files;
    if (data && data.length > 0) {
      for(let i = 0, len = data.length; i < len; i++) {
        this.addFile(data[i]);
      }
    }
  }

  componentDidMount() {
    this.dragCounter = 0;
    let div = this.dropRef.current;
    div.addEventListener('dragenter', this.handleDragIn);
    div.addEventListener('dragleave', this.handleDragOut);
    div.addEventListener('dragover', this.handleDrag);
    div.addEventListener('drop', this.handleDrop);
  }

  componentWillUnmount() {
    let div = this.dropRef.current;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }


  // --------------------------- ADDING FILES THROUGH THE BUTTON -------------------------------------
  addFile = (file) => {
    let counter = this.state.fileCounter;
    const newFileSize = file.size/1024/1024;
    const newSizeSum  = newFileSize + this.state.sizeSum;
    const button = document.getElementById(`label-${counter}`);
    const fileInput = document.getElementById(`file-${counter}`);
    if(newFileSize < 5 && newSizeSum < 20) {
      const content = "";
      this.state.files.push(JSON.stringify({
        name: file.name,
        content: content,
        encoding: "base64",
      }));
      button.innerHTML = file.name;
      counter++
      this.setState({
        fileCounter: counter,
        sizeSum: newSizeSum,
      })
      fileInput.setAttribute("disabled", "");

    } else {
      alert("Too large size of file or of sum of files");
      fileInput.value = "";
    }
  }

  // --------------------------------------- DELETING FILES -------------------------------------------

  

  // --------------------------------------- SENDING REQUEST TO API -------------------------------------

  sendMail = () => {
    const fromName = document.getElementById("fromName").value;
    const fromMail = document.getElementById("fromMail").value;
    const toName = document.getElementById("toName").value;
    const toMail = document.getElementById("toMail").value;
    const subject = document.getElementById("subject").value;
    const text = document.getElementById("text").value;

    const data = {
      "action" : "issue.send.test",
      "letter" : {
        "subject" : subject,
        "from.name" : fromName,
        "from.email" : fromMail,
        "to.name" : toName,
        "message": {"text" : text },
        "attaches": this.state.files,
      },
      "sendwhen": "test",
      "mca": [
        toMail,
      ],
      "session": "coooooookies"
    }
    
    fetch("https://api.sendsay.ru/clu180", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.log(err));

    return false;
  }
  

  // ---------------------------------------- REDNER ----------------------------------

  render() {
    const { fileCounter, dragging, sizeSum, filesButtons } = this.state;
    let buttons = [];
    for(let i = 0; i < fileCounter; i++){
      buttons.push(<FileButton fileCounter={ fileCounter } index={ i + 1 } key={ i } addFile={ this.addFile }/>)
    }

    return (
      <div className="App">
        <form onSubmit={ (e) => e.preventDefault() } className="form" ref={this.dropRef}>
          <div className={ dragging ? "drop-zone" : "drop-zone--disabled"}>
            <div className="drop-zone--inner"><p className="drop-zone__text">Drop me Here!</p></div>
          </div>
          <h1 className="form__heading">BestMail</h1>
          <div className="form__inputs">
            <div className="input-wrapper">
              <input className="input" type="text" id="fromName" name="from-name" minLength="2" maxLength="20" placeholder="Your Name" required />
              <label htmlFor="from-name" className="label">Your Name</label>
            </div>
            <div className="input-wrapper">
              <input className="input" type="email" id="fromMail" name="from-mail" placeholder="Your Email" required />
              <label htmlFor="from-name" className="label">Your Email</label>
            </div>
            <div className="input-wrapper">
              <input className="input" type="text" id="toName" name="to-name" minLength="2" maxLength="20" placeholder="Receiver Name" required />
              <label htmlFor="from-name" className="label">Receiver Name</label>
            </div>
            <div className="input-wrapper">
              <input className="input" type="email" id="toMail" name="to-mail" placeholder="Receiver Email"  required />
              <label htmlFor="from-name" className="label">Receiver Email</label>
            </div>
            <div className="input-wrapper input--subject">
              <input className="input" type="text" id="subject" name="subject" minLength="4" placeholder="Message Subject"  required />
              <label htmlFor="subject" className="label">Message Subject</label>
            </div>
          </div>
          <textarea className="textarea" id="text" rows="10" cols="94" placeholder="Write your message here!" minLength="10" required></textarea>

          <div className="files">
            { buttons }
          </div>

          <div className="files-size">
            Total size of files: { sizeSum } MB
          </div>

          <input type="submit" className="submit-btn" onClick={ this.sendMail } value = "Send!"/>
        </form>

        
      </div>
    );
  }
}

export default App;