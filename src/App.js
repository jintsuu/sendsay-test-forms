import React, { Component } from 'react';

import FileButton from './components/FileButton';
import MessagesBox from './components/MessagesBox';

import './style.css';

class App extends Component {
  state = {
    buttonCounter: 1,
    sizeSum: 0,
    sizes: [], // For displaying total size of files
    buttons: [],
    files: [],   // For http-requests
    dragging: false,
    messages: [],
    isMessagesSended: false,
    isMessageSending: false,
    session: '',
    isAuth: false,
    toMail: '',
    errors: {}, // For form validation
    isInputsValid: false,
  };

  // ---------------------------------- DRAG AND DROP -------------------------------------------

  dropRef = React.createRef();

  componentDidMount() {
    let div = this.dropRef.current;
    this.dragCounter = 0;
    this.addButtonsIntoArr();

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

    const data = e.dataTransfer.files;
    this.setState({
      dragging: false
    });

    if (data && data.length > 0) {
      for(let i = 0, len = data.length; i < len; i++) {
        this.addFile(data[i]);
      }
    }
  }


  // --------------------------- ADDING FILES THROUGH THE BUTTON -------------------------------------

  addFile = (file) => {
    let counter = this.state.buttonCounter;
    let content;
    const { sizes, files } = this.state;
    const newFileSize = file.size/1024/1024;
    const newSizeSum  = newFileSize + this.state.sizeSum;
    const button = document.getElementById(`label-${counter}`);
    const fileInput = document.getElementById(`file-${counter}`);
    const reader = new FileReader();

    if(newFileSize < 5 && newSizeSum < 20) {
      fileInput.setAttribute("disabled", "");
      
      reader.onload = (e) => {
        content = e.target.result;
        files.push({
          file: {
          name: file.name,
          content: content,
          encoding: "base64",
          },
          number: counter,
        });
      }
      
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
    let { buttons, sizes, files } = this.state;
    let newSum;

    files = files.filter(el => el.number !== index+1);
    buttons = buttons.filter(el => el.number !== index);
    sizes = sizes.filter(el => el.number !== index+1);
    newSum = sizes.reduce((sum, { size }) => sum + size, 0);

    this.setState({
      files: files,
      sizeSum: newSum,
      sizes: sizes,
      buttons: buttons,
    });
  }

  // ------------------------------ Filling buttons array ---------------------------------------

  addButtonsIntoArr = (counter = 1) => {
    const buttons = this.state.buttons;

    buttons.push({
      component: "",
      number: counter,
    });

    this.setState({
      buttons: buttons,
    });
  }

 // --------------------------------------- Authorisation -------------------------------------

 auth = (e) => {
  e.preventDefault();

  const request = "apiversion=100&json=1&request=" + encodeURIComponent(JSON.stringify(params));

  fetch("https://api.sendsay.ru/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: request,
  })
  .then(res => res.json())
  .then(res => { 
    console.log(res.session);
    this.setState({
      session: res.session,
    }, () => this.sendMail());
    }
  )
  .catch(err => console.log(err));
}

// ---------------------------------------------- SEND MAIL ----------------------------------------------------------------

sendMail = (e) => {
  if(this.state.isAuth) {
    e.preventDefault();
  }

  let fromName = document.getElementById("fromName");
  let fromMail = document.getElementById("fromMail");
  let toName = document.getElementById("toName");
  let toMail = document.getElementById("toMail");
  let subject = document.getElementById("subject");
  let text = document.getElementById("text");

  let filesArr = [];
  const { files, messages} = this.state;
  files.forEach((item) => {
    filesArr.push(item.file);
  })

  const monthNames = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
  const date = new Date();
  const mailDate = `${date.getDate()} ${monthNames[date.getMonth()]}`;

  this.setState(({ isMessageSending }) => ({
    isMessageSending: !isMessageSending,
    toMail: toMail.value,
  }));

  const params = { 
    "action" : "issue.send.test",
    "letter" : {
      "subject" : subject.value,
      "from.name" : fromName.value, 
      "from.email" : fromMail.value,
      "to.name" : toName.value,
      "message": {"text" : text.value },
      "attaches": filesArr,
    },
    "sendwhen": "test",
    "mca": [
      toMail.value,
    ],
    "session": this.state.session,
  };

  const request = "apiversion=100&json=1&request=" + encodeURIComponent(JSON.stringify(params));

  fetch("https://api.sendsay.ru/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: request,
  })
  .then(res => res.json())
  .then(res => {
      messages.push({
        subject: subject.value,
        fromName: fromName.value,
        fromMail: fromMail.value,
        toName: toName.value,
        toMail: toMail.value,
        text: text.value,
        date: mailDate,
        id: res["track.id"],
      });

      // Cleaning the form

      fromName.value = "";
      fromMail.value = "";
      toName.value = "";
      toMail.value = "";
      subject.value = "";
      text.value = "";

      setTimeout( () => this.stateClear(messages), 2000);
    })
    .catch(err => console.log(err));
  }

  // ---------------------------------------------- Cleaning state --------------------------------------------------------------

  stateClear = (messages) => {
    this.setState(({ isMessageSending }) => ({
      messages: messages,
      isMessagesSended: true,
      isMessageSending: !isMessageSending,
      isAuth: true,
      sizeSum: 0,
      buttonCounter: 1,
      files: [],
      sizes: [],
      buttons: [],
    }), () => this.addButtonsIntoArr())
  }

  // ----------------------------------------------- Validation -----------------------------------------------------------------------

  checkInputValidity = () => {
    const fromName = document.getElementById("fromName").value;
    const fromMail = document.getElementById("fromMail").value;
    const toName = document.getElementById("toName").value;
    const toMail = document.getElementById("toMail").value;
    const subject = document.getElementById("subject").value;
    const errors = {};
    let isInputsValid = true;

    if(this.state.messages.length === 0) {
      errors["fromName"] = ""; 
      errors["fromMail"] = ""; 
      errors["toName"] = "";
      errors["toMail"] = "";
      errors["subject"] = "";
      errors["text"] = "";
    }
    
    if( fromName === "") {
      errors.fromName = "Имя не может быть пустым";
    } else if( !fromName.match(/^[a-zA-Zа-яА-Я]*$/) ) {
      errors.fromName = "Имя содержит некорректные символы";
    } else {
      errors.fromName = "";
    }

    if( toName === "") {
      errors.toName = "Имя не может быть пустым";
    } else if( !toName.match(/^[a-zA-Zа-яА-Я]*$/) ) {
      errors.toName = "Имя содержит некорректные символы";
    } else {
      errors.toName = "";
    }

    if( fromMail === "") {
      errors.fromMail = "Email не может быть пустым";
    } else if( !fromMail.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/) ) {
      errors.fromMail = "Пожалуйста введите корректный Email";
    } else {
      errors.fromMail = "";
    }

    if( toMail === "") {
      errors.toMail = "Email не может быть пустым";
    } else if( !toMail.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/) ) {
      errors.toMail = "Пожалуйста введите корректный Email";
    } else {
      errors.toMail = "";
    }

    if( subject === "") {
      errors.subject = "Тема сообщения не может быть пустой";
    } else {
      errors.subject = "";
    }

    for( let i in errors ) {
      if(errors[i] !== "") {
        isInputsValid = false;
      }
    }
    
    this.setState({
      errors: errors,
      isInputsValid: isInputsValid,
    })

  }

  // ---------------------------------------- RENDER ----------------------------------

  render() {
    const { 
      isAuth, toMail, buttonCounter, 
      dragging, isMessagesSended, messages, 
      buttons, session, isMessageSending,
      errors, isInputsValid 
    } = this.state;

    return (
      <div className="App">

        {/* ------------------------------------------- Sending field -------------------------------------- */}
        <div className={ isMessageSending ? "file-sending-zone" : "disabled" }>
          <h2 className="file-sending-zone__heading">Сообщение поставлено в очередь на отправку</h2>
          <p className="file-sending-zone__text">
            Совсем скоро сообщение вылетит из сервера, и будет двигаться в сторону почты 
            получателя { toMail } со скоростью электронов
          </p>
        </div>
        <form onSubmit={ isInputsValid ? (isAuth ? this.sendMail : this.auth) : (e) => e.preventDefault()} className={ isMessageSending ? "disabled" : "form" } ref={ this.dropRef }>

          {/* ------------------- DROP ZONE ------------------------------- */}
          <div className={ dragging ? "drop-zone" : "disabled"}>
            <div className="drop-zone--inner">
              <p className="drop-zone__text">Бросайте файлы сюда, я ловлю</p>
              <span className="drop-zone__sub-text">Мы принимаем картинки (jpg, png, gif), офисные файлы (doc, xls, pdf) и zip-архивы. Размеры файла до 5 МБ</span>
            </div>
          </div>

          {/* ----------------------------------------- MAIN FORM ------------------------------ */}
          <h1 className="form__heading">Отправлялка сообщений</h1>
          <div className="form__inputs">  
            {/* ----------------------------------- FORM GROUP 1 -------------------------------------------- */}
            <label className="label">
              <h3 className="label--heading">От кого</h3>
              <div className="input-group">
                <div className="input-wrapper">
                  <input className="input input--left" type="text" id="fromName" name="from-name" minLength="2" maxLength="30" placeholder="Имя" required />
                  <span className={ errors.fromName === "" ? "disabled" : "input-error" } > { errors.fromName } </span>
                </div>
                <div className="input-wrapper">
                  <input className="input input--right" type="email" id="fromMail" name="from-mail" placeholder="Email" required />
                  <span className={ errors.fromMail === "" ? "disabled" : "input-error" } > { errors.fromMail } </span>
                </div> 
              </div>
            </label>
            
            {/* ----------------------------------- FORM GROUP 2 -------------------------------------------- */}
            <label className="label">
              <h3 className="label--heading">Кому</h3>
              <div className="input-group">
                <div className="input-wrapper">
                  <input className="input input--left" type="text" id="toName" name="to-name" minLength="2" maxLength="30" placeholder="Имя" required />
                  <span className={ errors.toName === "" ? "disabled" : "input-error" } > { errors.toName } </span>
                </div>
                <div className="input-wrapper">
                  <input className="input input--right" type="email" id="toMail" name="to-mail" placeholder="Email"  required />
                  <span className={ errors.toMail === "" ? "disabled" : "input-error" } > { errors.toMail } </span>
                </div> 
              </div>
            </label>
            
            {/* ----------------------------------- FORM GROUP 3 -------------------------------------------- */}
            <label className="label">
              <h3 className="label--heading">Тема письма</h3>
              <div className="input-group">
                <div className="input-wrapper input-wrapper--center"> 
                  <input className="input input--center" type="text" id="subject" name="subject" minLength="4" placeholder="Тема письма"  required />
                  <span className={ errors.subject === "" ? "disabled" : "input-error" } > { errors.subject } </span>
                </div>
              </div>
            </label>

            {/* ----------------------------------- FORM GROUP 4 -------------------------------------------- */}
            <label className="label">
              <h3 className="label--heading">Сообщение</h3>
              <div className="input-wrapper input-wrapper--center">
                <textarea className="textarea" id="text" placeholder="Введите сообщение!" minLength="10" required></textarea>
              </div>
            </label>
          </div>
          
          {/* ------------------------------------- FILES ----------------------------------- */}
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
          <input type="submit" className="submit-btn" value="Отправить" onClick={ this.checkInputValidity }/>
        </form>

        {/* ------------------------------------------- SENDED MESSAGES ------------------------------------------------ */}
        <MessagesBox isMessagesSended={ isMessagesSended } messages={ messages } session={ session }/>
      </div>
    );
  }
}

export default App;
