import React, { Component } from 'react';

class Messages extends Component {
    constructor(props) {
      super(props); 
      this.state = {
        status: 'В очереди',
        statusClass: 'sending',
        isStatusSetted: false,
        date: this.props.date,
        subject: this.props.subject,
      }
    }

    componentDidMount() {
      this.interval = setInterval( () => this.getStatus(this.props.trackId), 2000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    getStatus = (id) => {
      let status = "В очереди";
      let statusClass = "sending";
      let isStatusSetted = false;
      let response;
      const params = {
        "action": "track.get",
        "id": id,
        "session": this.props.session,
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
        response = res["obj"]["status"];
        response = Number(response);
        if(response === -1) {
          status = "Отправлено";
          statusClass = 'sended';
          isStatusSetted = true;
        } else if(response < -1) {
          status = "Ошибка";
          statusClass = "error";
          isStatusSetted = true;
        }

        if(isStatusSetted) {
          clearInterval(this.interval);
        }

        this.setState({
          status: status,
          statusClass: statusClass,
          isStatusSetted: isStatusSetted,
        })
      })
      .catch(err => console.log(err));
    }

    // --------------------------------- RENDER ------------------------------------------------------------

    render() {
      const { status, statusClass, date, subject } = this.state;
      return(
        <div className="messages__item">
            <p className="item__date">
                { date }
            </p>
            <p className="item__subject">
                { subject }
            </p> 
            <p className={`item__status ${statusClass}`}>
                { status }
            </p>
        </div>
      );
    }
}

export default Messages;