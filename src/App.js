import React, { Component } from 'react';

import FileButton from './components/FileButton';
import MessagesBox from './components/MessagesBox';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      buttonCounter: 1,
      sizeSum: 0,
      buttons: [],
      files: [],
      dragging: false,
      messages: [],
      isMessagesSended: false,
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

    this.addButtonsIntoArr();
  }

  componentWillUnmount() {
    let div = this.dropRef.current;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }



  // --------------------------- ADDING FILES THROUGH THE BUTTON -------------------------------------

  addButtonsIntoArr = (counter = 1) => {
    let buttons = this.state.buttons;

    buttons.push({
      component: <FileButton 
        buttonCounter={ this.state.buttonCounter }
        index={ counter }
        key={ counter } 
        addFile={ this.addFile } 
        deleteFile={ this.deleteFile } />,
      number: counter,
    });

    this.setState({
      buttons: buttons,
    });
  }


  addFile = (file) => {
    let counter = this.state.buttonCounter;
    const newFileSize = file.size/1024/1024;
    const newSizeSum  = newFileSize + this.state.sizeSum;
    const button = document.getElementById(`label-${counter}`);
    const fileInput = document.getElementById(`file-${counter}`);

    if(newFileSize < 5 && newSizeSum < 20) {
      fileInput.setAttribute("disabled", "");
      const content = "";
      
      button.innerHTML = file.name;
      counter++;

      this.setState({
        buttonCounter: counter,
        sizeSum: newSizeSum, 
      }, () => this.addButtonsIntoArr(counter));

      this.state.files.push(JSON.stringify({
        name: file.name,
        content: content,
        encoding: "base64",
      })); 

    } else if(newFileSize > 5){
      alert("Size of file too large!");
      fileInput.value = "";
    } else if(newSizeSum > 20) {
      alert("Sum of file's sizes too large!");
      fileInput.value = "";
    }
  }

  // --------------------------------------- DELETING FILES -------------------------------------------

  deleteFile = (index) => {
    let counter = this.state.buttonCounter;
    let buttons = this.state.buttons;
    let files = this.state.files;
    //const newSum = this.state.sizeSum - inputToDelete.files[0].size/1024/1024;
    // files = files.filter(index-1, 1);
    buttons = buttons.filter(el => el.number !== index);
    counter--;

    this.setState({
      files: files,
      //sizeSum: newSum,
      buttons: buttons,
      buttonCounter: counter,
    });
  }
  

  // --------------------------------------- SENDING REQUEST TO API -------------------------------------

  sendMail = (e) => {
    e.preventDefault();
    let fromName = document.getElementById("fromName");
    let fromMail = document.getElementById("fromMail");
    let toName = document.getElementById("toName");
    let toMail = document.getElementById("toMail");
    let subject = document.getElementById("subject");
    let text = document.getElementById("text");

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date();
    const mailDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  
    const newMessage = {
      subject: subject.value,
      fromName: fromName.value,
      fromMail: fromMail.value,
      toName: toName.value,
      toMail: toMail.value,
      text: text.value,
      date: mailDate,
      status: "sended",
    }

    const messages = this.state.messages;

    messages.push(newMessage);

    this.setState({
      messages: messages,
      isMessagesSended: true,
    })
    var params = {
      "action" : "login",

      "login"  : "nipanasovich@gmail.com", 

      "sublogin" : "nipanasovich",

      "password" : "uu1Quem", 
    };

    var request = "request=" + encodeURIComponent(JSON.stringify(params));

    fetch("https://api.sendsay.ru/?apiversion=100&json=1&", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: request,
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.log(err));

    fromName.value = "";
    fromMail.value = "";
    toName.value = "";
    toMail.value = "";
    subject.value = "";
    text.value = "";

    for(let i=1; i<=this.state.files.length; i++) {
      this.deleteFile(i);
    }

    this.setState({
      sizeSum: 0,
      buttonCounter: 1,
      files: [],
    })

  }
  

  // ---------------------------------------- REDNER ----------------------------------

  render() {
    const { dragging, sizeSum, isMessagesSended, messages, buttons } = this.state;

    return (
      <div className="App">
        <form onSubmit={ this.sendMail } className="form" ref={ this.dropRef }>
          <div className={ dragging ? "drop-zone" : "disabled"}>
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
          <textarea className="textarea" id="text" rows="7" placeholder="Write your message here!" minLength="10" required></textarea>

          <div className="files">
            { 
              buttons.map((item) => item.component)
            }
          </div>

          <div className="files-size">
            <p>Total size of files: { sizeSum } MB</p>
            <p>Max size of one file: 5 MB</p>
            <p>Max size of all files: 20 MB</p>
          </div>

          <input type="submit" className="submit-btn" value = "Send!"/>
        </form>

        <MessagesBox isMessagesSended={ isMessagesSended } messages={ messages } />
      </div>
    );
  }
}

export default App;