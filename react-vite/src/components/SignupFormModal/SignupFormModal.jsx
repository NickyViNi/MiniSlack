import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { disabledSubmitButton, enabledSubmitButton } from "../../utils/dom";
import { isImageValid } from "../../utils/image";
import Loading from "../Loading";
import * as sessionActions from "../../redux/session";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imageIsUploading, setImageIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setModalContent } = useModal();

  const handleSubmit = async e => {
    e.preventDefault();
    disabledSubmitButton();

    if (profileImageUrl && !isImageValid(profileImageUrl.name)) {
      enabledSubmitButton();
      return setErrors({ profileImageUrl: "Only .png, .jpg, .jpeg, .gif are allowed" });
    }

    if (password !== confirmPassword) {
      enabledSubmitButton();
      return setErrors({ confirmPassword: "Confirm Password field must be the same as the Password field" });
    }

    setImageIsUploading(true);
    const data = await dispatch(
      sessionActions.signup({
        first_name: firstName,
        last_name: lastName,
        profile_image_url: profileImageUrl,
        email,
        username,
        password,
      })
    );

    if (data?.errors) {
      enabledSubmitButton();
      setImageIsUploading(false);
      return setErrors(data.errors);
    }
    setModalContent(<h2 className="subheading alert-success">Successfully Signed Up</h2>);
    setImageIsUploading(false);
  };

  const inputInvalid = () => {
    return (
      !firstName.length ||
      !lastName.length ||
      !email.length ||
      username.length < 4 ||
      password.length < 6
    );
  }

  return (
    <>
      <h2 className="subheading">Sign Up</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>First Name</label>
        <input
          type="text"
          spellCheck={false}
          placeholder="Required"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        {errors.first_name && <p className="modal-errors">{errors.first_name}</p>}
        <label>Last Name</label>
        <input
          type="text"
          spellCheck={false}
          placeholder="Required"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        {errors.last_name && <p className="modal-errors">{errors.last_name}</p>}
        <label>Email</label>
        <input
          type="text"
          spellCheck={false}
          placeholder="user@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {errors.email && <p className="modal-errors">{errors.email}</p>}
        <label>Username</label>
        <input
          type="text"
          spellCheck={false}
          placeholder="At least 4 characters"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        {errors.username && <p className="modal-errors">{errors.username}</p>}
        <label>Password</label>
        <input
          type="password"
          spellCheck={false}
          placeholder="At least 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="modal-errors">{errors.password}</p>}
        <label>Confirm Password</label>
        <input
          type="password"
          spellCheck={false}
          placeholder="At least 6 characters"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        {errors.confirmPassword && <p className="modal-errors">{errors.confirmPassword}</p>}
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setProfileImageUrl(e.target.files[0])}
        />
        {errors.profileImageUrl && <p className="modal-errors">{errors.profileImageUrl}</p>}
        {imageIsUploading && <Loading />}
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

export default SignupFormModal;
