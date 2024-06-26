import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { disabledSubmitButton, enabledSubmitButton } from "../../utils/dom";
import ChannelInfo from "../ChannelInfo";
import * as channelActions from "../../redux/channel";

function UpdatedChannelModal({ channel, channelHeaderText }) {
  const dispatch = useDispatch();
  const { setModalContent } = useModal();
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic);
  const [description, setDescription] = useState(channel.description);
  const [errors, setErrors] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();
    disabledSubmitButton();

    const payload = {
      name,
      topic,
      description
    }

    const workspace = document.querySelector(".workspace.selected");
    if (!workspace) return;

    const data = await dispatch(channelActions.updateChannelThunk(channel.id, payload));
    if (data?.errors) {
      enabledSubmitButton();
      return setErrors(data.errors);
    }
    setModalContent(<h2 className="subheading alert-success">Successfully updated</h2>);

    const channelEl = document.querySelector(".workspace-channel.selected");
    if (channelEl) {
      await dispatch(channelActions.loadChannels(+workspace.id));
      const messageHeader = document.querySelector(".message-header");
      messageHeader.innerHTML = channelHeaderText(name);
      messageHeader.querySelector("#channel-info").addEventListener('click', () => {
        setModalContent(<ChannelInfo headerName={name} c={payload} />)
      });
    }
    enabledSubmitButton();
  }

  if (!channel) return;

  return (
    <>
      <h2 className="channel-edit-form-header">
        <div className="subheading">Edit channel</div>
        <p className="caption">{channel.channel?.name}</p>
      </h2>
      <form className="edit-channel-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          value={name}
          placeholder="At least 4 characters"
          spellCheck={false}
          onChange={e => setName(e.target.value)}
        />
        {errors && <p className="modal-errors">{errors.name}</p>}
        <label htmlFor="name">Topic</label>
        <input
          type="text"
          value={topic}
          spellCheck={false}
          onChange={e => setTopic(e.target.value)}
        />
        {errors && <p className="modal-errors">{errors.topic}</p>}
        <label htmlFor="name">Description</label>
        <input
          type="text"
          value={description}
          spellCheck={false}
          onChange={e => setDescription(e.target.value)}
        />
        {errors && <p className="modal-errors">{errors.description}</p>}
        <button
          type="submit"
          disabled={name?.length < 4}
          className={name?.length < 4 ? "disabled" : ""}
        >
          Submit
        </button>
      </form>
    </>
  )
}

export default UpdatedChannelModal;
