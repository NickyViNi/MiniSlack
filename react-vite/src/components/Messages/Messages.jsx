import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { disabledSubmitButton, enabledSubmitButton } from "../../utils/dom";
import { createReactionApi, deleteReactionApi } from "../../utils/reactions";
import MessageTime from "../MessageTime";
import MessageSettings from "../MessageSettings";
import EditMessageForm from "../EditMessageForm";
import EmojisList from "../EmojsList";
import ShowReactions from "../ShowReactions";
import * as messageActions from "../../redux/message";

function Messages({ user, messages, showMessageTime, getMessageAuthorImage, formattedDate, formattedTime, messageInput, setMessageInput, editMessageInput, setEditMessageInput, emojis, getMessageAuthorName, newMessageNotification, setNewMessageNotification }) {
  const dispatch = useDispatch();
  const { setModalContent } = useModal();
  const [searchMessage, setSearchMessage] = useState("");
  const [currentMessages, setCurrentMessages] = useState([...messages]);
  const [deletedIds, setDeletedIds] = useState([]);
  const messagesBottomRef = useRef(null);

  const scrollToNewMessage = () => {
    messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const notification = document.querySelector(".notification");
    if (newMessageNotification) notification.classList.remove("hidden");
  }, [newMessageNotification]);

  useEffect(() => {
    setCurrentMessages([...messages]);
  }, [messages]);

  const handleScrollingBottom = () => {
    scrollToNewMessage();
    const notification = document.querySelector(".notification");
    if (notification) notification.classList.add("hidden");
    setNewMessageNotification(false);
  }

  const disabledInputMessage = () => {
    if (user && user.user === null) {
      return true;
    }
    const userReceiver = document.querySelector(".workspace-message.selected");
    const channelReceiver = document.querySelector(".workspace-channel.selected");
    const workspace = document.querySelector(".workspace.selected");
    if (!workspace || (!userReceiver && !channelReceiver)) {
      return true;
    }
    return false;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    disabledSubmitButton();

    const userReceiver = document.querySelector(".workspace-message.selected");
    const channelReceiver = document.querySelector(".workspace-channel.selected");
    const workspace = document.querySelector(".workspace.selected");

    if (!userReceiver && !channelReceiver) return enabledSubmitButton();
    if (!workspace || !messageInput.length) return enabledSubmitButton();

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

    const data = await dispatch(messageActions.createMessageThunk(payload));
    if (data?.errors) {
      enabledSubmitButton();
      return setModalContent(<h2 className="subheading modal-errors">User is no longer a member of the workspace</h2>)
    }
    setMessageInput("");
    enabledSubmitButton();
  }


  const handleKeyPress = e => {
    if (e.keyCode === 13) { // enter
      e.preventDefault(); // prevent default new line
      if (e.ctrlKey) {
        setMessageInput(messageInput + "\n")
      } else {
        handleSubmit(e);
      }
    }
  }

  const showEmojisList = async e => {
    e.stopPropagation();
    if (!disabledInputMessage()) {
      document.querySelector(".emojis-list").classList.remove("hidden");
    }
  }

  const hideEmojisList = e => {
    if (!e.target.closest(".emojis-list")) {
      document.querySelector(".emojis-list").classList.add("hidden");
    }
  }

  const createReaction = async (reactionEl, m, reaction) => {
    const data = await createReactionApi(m.id, String.fromCodePoint(reaction));
    if (data?.errors) return;
    const reactionId = data.id;
    const messaegId = data.message_id;
    const userId = data.user_id;
    reactionEl.addEventListener("click", e2 => deleteReaction(e2, messaegId, userId, reactionId));
    return data;
  }

  const deleteReaction = async (e, messageId, ownerId, reactionId) => {
    e.stopPropagation();
    if (ownerId === user?.id) {
      e.target.remove();
      await deleteReactionApi(messageId, reactionId);
    }
  }

  return (
    <div className="messages-wrapper">
      <div className="messages-details-wrapper" onClick={hideEmojisList}>
        <div className="message-header"></div>
        {!messages.length ? '' : <div className="searchbox-messages">
          <input
            type="text"
            spellCheck={false}
            placeholder={`Search for messages`}
            value={searchMessage}
            onChange={e => {
              setSearchMessage(e.target.value);
              if (e.target.value === "") return setCurrentMessages(messages.filter(message => !deletedIds.includes(message.id)));
              setCurrentMessages(messages.filter(message => !deletedIds.includes(message.id) && message.message.toLowerCase().includes(e.target.value.toLowerCase())));
            }}
          />
        </div>}
        {currentMessages.map(m => (
          <div
            id={m.id}
            key={m.id}
            className={`message ${m.sender_id === user?.id ? 'me' : ''} message-${m.id}`}
            onClick={showMessageTime}
          >
            <div className="message-details">
              {m.sender_id === user?.id ? (
                <>
                  <div>{m.message}</div>
                  <EditMessageForm
                    m={m}
                    messageActions={messageActions}
                    dispatch={dispatch}
                    editMessageInput={editMessageInput}
                    setEditMessageInput={setEditMessageInput}
                  />
                  <div className="message-image"><img src={getMessageAuthorImage(m)} alt="avatar" /></div>
                </>
              ) : (
                <>
                  <div className="message-image" title={getMessageAuthorName(m)}><img src={getMessageAuthorImage(m)} alt="avatar" /></div>
                  <div>{m.message}</div>
                </>
              )}
            </div>
            {m.sender_id === user?.id ? (
              <div onClick={e => e.stopPropagation()} className={`hidden message-time ${m.sender_id === user?.id ? 'me' : ''}`}>
                <MessageTime formattedDate={formattedDate} formattedTime={formattedTime} m={m} emojis={emojis} createReaction={createReaction} user={user} />
                <MessageSettings setEditMessageInput={setEditMessageInput} setDeletedIds={setDeletedIds} />
              </div>
            ) : (
              <div onClick={e => e.stopPropagation()} className={`hidden message-time ${m.sender_id === user?.id ? 'me' : ''}`}>
                <MessageTime formattedDate={formattedDate} formattedTime={formattedTime} m={m} emojis={emojis} createReaction={createReaction} user={user} />
              </div>
            )}
            <div className={`reactions reaction-message-${m.id}`}><ShowReactions m={m} deleteReaction={deleteReaction} user={user} /></div>
          </div>
        ))}
        <div ref={messagesBottomRef}></div>
      </div>
      <div id="message-input" onClick={hideEmojisList}>
        <form onSubmit={handleSubmit} id="create-message-form">
          <textarea
            spellCheck="false"
            value={messageInput}
            disabled={disabledInputMessage()}
            onChange={e => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="new-message" title="Scroll to the bottom">
            <i className="fa-brands fa-weixin" onClick={handleScrollingBottom}></i>
            <div className="notification hidden">
              <i className="fa-solid fa-circle" onClick={handleScrollingBottom}></i>
            </div>
          </div>
          <div className="emojis">
            <i onClick={showEmojisList} className={`fa-solid fa-face-smile${disabledInputMessage() ? " disabled" : ""}`} title="Add Emojis">
            </i>
          </div>
          <button
            disabled={disabledInputMessage()}
            type="submit"
            className={disabledInputMessage() ? "disabled" : ""}
          >
            <i className="fa-regular fa-paper-plane" title="Send">
            </i>
          </button>
        </form>
      </div>
      <EmojisList emojis={emojis} setMessageInput={setMessageInput} />
    </div>
  );
}

export default Messages;
