import React, { Component } from 'react';

class Messages extends Component {
    constructor(props) {
      super(props); 
      this.state = {
        status: 'Sending',
        isStatusSetted: false,
      }
    }

    componentDidMount() {
      this.interval = setInterval( () => this.getStatus(this.props.trackId), 2000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    getStatus = (id) => {
      let status = "Sending";
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
          status = "Sended";
          isStatusSetted = true;
        } else if(response < -1) {
          status = "Error";
          isStatusSetted = true;
        }

        if(isStatusSetted) {
          clearInterval(this.interval);
        }

        this.setState({
          status: status,
          isStatusSetted: isStatusSetted,
        })
      })
      .catch(err => console.log(err));
    }

    render() {
      const { date, subject } = this.props;
      const { status } = this.state;
      return(
        <div className="messages__item">
            <p className="item__date">
                { date }
            </p>
            <p className="item__subject">
                { subject }
            </p> 
            <p className={`item__status ${status}`}>
                { status }
            </p>
        </div>
      );
    }
}

export default Messages;