import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { disabledSubmitButton, enabledSubmitButton } from "../../utils/dom";
import * as sessionActions from "../../redux/session";

function UpdateUserFormModal({ user }) {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [password, setPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async e => {
    e.preventDefault();
    disabledSubmitButton();

    const data = await dispatch(
      sessionActions.updateUser({
        first_name: firstName,
        last_name: lastName,
        profile_image_url: profileImageUrl,
        email: user.email,
        username: user.username,
        password,
      })
    );
    console.log(data)
    if (data?.errors) {
      enabledSubmitButton();
      return setErrors(data.errors);
    }
    closeModal();
  };

  const inputInvalid = () => {
    return (
      !firstName.length ||
      !lastName.length ||
      password.length < 6
    );
  }

  if (!user) return;

  return (
    <>
      <h2 className="subheading">Update Profile</h2>
      {errors.server && <p className="modal-errors">{errors.server}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        {errors.first_name && <p className="modal-errors">{errors.first_name}</p>}
        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        {errors.last_name && <p className="modal-errors">{errors.last_name}</p>}
        <label>Email</label>
        <input
          type="text"
          value={user.email}
          className="disabled"
          disabled
        />
        <label>Username</label>
        <input
          type="text"
          value={user.username}
          disabled
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="modal-errors">{errors.password}</p>}
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setProfileImageUrl(e.target.files[0])}
        />
        {errors.profileImageUrl && <p className="modal-errors">{errors.profileImageUrl}</p>}
        <button
          type="submit"
          className={`btn-submit ${inputInvalid() ? 'disabled' : ''}`}
          disabled={inputInvalid()}
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default UpdateUserFormModal;
