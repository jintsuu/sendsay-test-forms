import React, { Component } from 'react';

import FileButton from './components/FileButton';
import MessagesBox from './components/MessagesBox';

import './style.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      buttonCounter: 1,
      sizeSum: 0,
      sizes: [], // For displaying total size of files
      buttons: [],
      files: [],   // For http-requests
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
      component: "",
      number: counter,
    });

    this.setState({
      buttons: buttons,
    });
  }


  addFile = (file) => {
    let counter = this.state.buttonCounter;
    const sizes = this.state.sizes;
    const newFileSize = file.size/1024/1024;
    const newSizeSum  = newFileSize + this.state.sizeSum;
    const button = document.getElementById(`label-${counter}`);
    const fileInput = document.getElementById(`file-${counter}`);

    const reader = new FileReader();

    if(newFileSize < 5 && newSizeSum < 20) {
      fileInput.setAttribute("disabled", "");
      let content;
      reader.onload = (e) => {
        content = e.target.result;
        this.state.files.push({
          file: {
          name: file.name,
          content: content,
          encoding: "base64",
          },
          number: counter,
        });
      }
      console.log(this.state.files);
      reader.readAsDataURL(file);
      button.innerHTML = file.name;
      counter++;
      sizes.push({
        size: newFileSize,
        number: counter,
      })

      this.setState({
        buttonCounter: counter,
        sizeSum: newSizeSum,
        sizes: sizes, 
      }, () => this.addButtonsIntoArr(counter));

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
    let buttons = this.state.buttons;
    let files = this.state.files;
    let sizes = this.state.sizes;
    let newSum;
    files = files.filter(el => el.number !== index+1);
    buttons = buttons.filter(el => el.number !== index);
    sizes = sizes.filter(el => el.number !== index+1);
    newSum = sizes.reduce((sum, { size }) => sum + size, 0);
    console.log(files);
    this.setState({
      files: files,
      sizeSum: newSum,
      sizes: sizes,
      buttons: buttons,
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
      "action" : "issue.send.test",
      "letter" : {
        "subject" : subject.value,
        "from.name" : fromName.value, 
        "from.email" : fromMail.value,
        "to.name" : toName.value,
        "message": {"text" : text.value },
        "attaches": this.state.files
      },
      "sendwhen": "test",
      "mca": [
        toMail.value,
      ],
      "session": "Брать из cookies по ключу session",
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

    // Cleaning the form

    fromName.value = "";
    fromMail.value = "";
    toName.value = "";
    toMail.value = "";
    subject.value = "";
    text.value = "";

    this.setState({
      sizeSum: 0,
      buttonCounter: 1,
      files: [],
      sizes: [],
      buttons: [],
    }, () => this.addButtonsIntoArr());

    
  }
  

  // ---------------------------------------- REDNER ----------------------------------

  render() {
    const { buttonCounter, dragging, sizeSum, isMessagesSended, messages, buttons } = this.state;

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
              buttons.map((item) => {
                item.component = <FileButton 
                    buttonCounter = { buttonCounter }
                    index={ item.number }
                    key={ item.number } 
                    addFile={ this.addFile } 
                    deleteFile={ this.deleteFile } />
                return item.component
              })
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