import React from 'react';

import Message from './Message';

const MessagesBox = ({ isMessagesSended, messages, session }) => {

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
                messages.reverse().map( (item, index) => <Message trackId={ item.id } session={ session } date={ item.date } subject={ item.subject } key={ index }/>)
              }
            </div>
          </div>
        </div>
    );
}

export default MessagesBox;