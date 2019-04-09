import React from 'react';

const MessagesBox = ({ isMessagesSended, messages }) => {

    return(
        <div className={ isMessagesSended ? "messages-box" : "disabled" }>
          <div className="messages-box__wrapper">
            <ul className="messages-box__titles">
              <li className="titles__item">
                Date
              </li>
              <li className="titles__item">
                Subject
              </li>
              <li className="titles__item">
                Status
              </li>
            </ul>
            <hr />
            <div className="messages">
              {
                messages.reverse().map( (item, index) => {
                  return(
                    <div className="messages__item" key={index}>
                      <p className="item__date">
                        { item.date }
                      </p>
                      <p className="item__subject">
                        { item.subject }
                      </p> 
                      <p className="item__status">
                        { item.status }
                      </p>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
    );
}

export default MessagesBox;