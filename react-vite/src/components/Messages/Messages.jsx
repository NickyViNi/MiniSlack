import { useDispatch } from "react-redux";
import { disabledSubmitButton, enabledSubmitButton } from "../../utils/dom";
import MessageTime from "../MessageTime";
import MessageSettings from "../MessageSettings";
import EditMessageForm from "../EditMessageForm";
import * as messageActions from "../../redux/message";

function Messages({ user, messages, showMessageTime, getMessageAuthorImage, formattedDate, formattedTime, messageInput, setMessageInput, scrollToNewMessage }) {
  const dispatch = useDispatch();

  const disabledInputMessage = () => {
    if (user && user.user === null) return true;
    const userReceiver = document.querySelector(".workspace-message.selected");
    const channelReceiver = document.querySelector(".workspace-channel.selected");
    const workspace = document.querySelector(".workspace.selected");
    if (!workspace) return true;
    if (!userReceiver && !channelReceiver) return true;
    return false;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    disabledSubmitButton();

    const userReceiver = document.querySelector(".workspace-message.selected");
    const channelReceiver = document.querySelector(".workspace-channel.selected");
    const workspace = document.querySelector(".workspace.selected");

    if (!userReceiver && !channelReceiver) return;
    if (!workspace || !messageInput.length) return;

    let payload;

    if (userReceiver) {
      payload = {
        message: messageInput,
        is_private: true,
        workspace_id: +workspace.id,
        receiver_id: +userReceiver.id
      }
    } else {
      payload = {
        message: messageInput,
        is_private: false,
        workspace_id: +workspace.id,
        channel_id: +channelReceiver.id
      }
    }

    await dispatch(messageActions.createMessageThunk(payload));
    setMessageInput("");
    scrollToNewMessage();
    enabledSubmitButton();
  }

  return (
    <div className="messages-wrapper">
      <div className="messages-details-wrapper">
        <div className="message-header"></div>
        {messages.map(m => (
          <div
            id={m.id}
            key={m.id}
            className={`message ${m.sender_id === user.id ? 'me' : ''}`}
            onClick={showMessageTime}
          >
            <div className="message-details">
              {m.sender_id === user.id ? (
                <>
                  <div>{m.message}</div>
                  <EditMessageForm m={m} messageActions={messageActions} dispatch={dispatch} messageInput={messageInput} setMessageInput={setMessageInput} />
                  <div className="message-image"><img src={getMessageAuthorImage(m)} alt="avatar" /></div>
                </>
              ) : (
                <>
                  <div className="message-image"><img src={getMessageAuthorImage(m)} alt="avatar" /></div>
                  <div>{m.message}</div>
                </>
              )}
            </div>
            {m.sender_id === user.id ? (
              <div onClick={e => e.stopPropagation()} className={`hidden message-time ${m.sender_id === user.id ? 'me' : ''}`}>
                <MessageTime formattedDate={formattedDate} formattedTime={formattedTime} m={m} />
                <MessageSettings />
              </div>
            ) : (
              <div onClick={e => e.stopPropagation()} className={`hidden message-time ${m.sender_id === user.id ? 'me' : ''}`}>
                <MessageTime formattedDate={formattedDate} formattedTime={formattedTime} m={m} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div id="message-input">
        <form onSubmit={handleSubmit}>
          <textarea
            spellCheck="false"
            value={messageInput}
            disabled={disabledInputMessage()}
            onChange={e => setMessageInput(e.target.value)}
          />
          <button disabled={disabledInputMessage()} type="submit"><i className="fa-regular fa-paper-plane"></i></button>
        </form>
      </div>
    </div>
  );
}

export default Messages;
