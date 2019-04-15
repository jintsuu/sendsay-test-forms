import React from 'react';

import Message from './Message';

const MessagesBox = ({ isMessagesSended, messages, session }) => {

    return(
        <div className="messages-box" >
          <h2 className="messages-box__heading">Отправленные сообщения</h2>
          <div className="messages-box__wrapper">
            <ul className={ isMessagesSended ? "messages-box__titles" : "disabled" } >
              <li className="titles__item">
                Дата
              </li>
              <li className="titles__item">
                Тема
              </li>
              <li className="titles__item">
                Статус
              </li>
            </ul>
            <p className={isMessagesSended ? "disabled" : "messages-box__text" } > Сообщения ещё не отправлялись </p>
            <div className="messages">
              {
                messages.map( (item, index) => <Message trackId={ item.id } session={ session } date={ item.date } subject={ item.subject } key={ index }/>)
              }
            </div>
          </div>
        </div>
    );
}

export default MessagesBox;