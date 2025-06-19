import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/AuthForm.css";

const EyeIcon = ({ open, onClick }) => (
  <span className="password-toggle" tabIndex={0} role="button" aria-label="Toggle password visibility" onClick={onClick}>
    {open ? (
      // Eye open SVG
      <svg width="22" height="22" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
    ) : (
      // Eye closed SVG
      <svg width="22" height="22" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.38 0 2.63-.56 3.54-1.47"/></svg>
    )}
  </span>
);

const EmailIcon = () => (
  <span className="email-icon email-icon-end">
    <svg width="20" height="20" fill="none" stroke="#4b5563" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
  </span>
);

const DownArrowIcon = () => (
  <span className="select-arrow">
    <svg width="18" height="18" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  </span>
);

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [transitionClass, setTransitionClass] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    setRegisteredUsers(storedUsers);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = registeredUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      alert("Invalid email or password. Please try again or register.");
    } else {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }
      // Store logged-in user for session
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      alert("Successfully logged in!");
      setEmail("");
      setPassword("");
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }
    
    if (!role) {
      alert("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    const isAlreadyRegistered = registeredUsers.some(
      (user) => user.email === email
    );
    if (isAlreadyRegistered) {
      alert("This email is already registered. Please log in.");
      return;
    }

    const newUser = { firstName, lastName, role, email, password };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    alert("Registration successful! Please log in.");
    resetForm();
    toggleAuthMode();
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setRole("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setAgreeToTerms(false);
    setRememberMe(false);
  };

  const toggleAuthMode = () => {
    setTransitionClass("slide-out");
    setTimeout(() => {
      setIsLogin(!isLogin);
      resetForm();
      setTransitionClass("slide-in");
    }, 300);
  };

  return (
    <div className={`auth-container ${transitionClass}`}>
      <div className="auth-header">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
      </div>
      <form
        className="auth-form"
        onSubmit={isLogin ? handleLogin : handleRegister}
      >
        {!isLogin && (
          <>
            <div className="input-row">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
            <div className="form-group select-group">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="role-select"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <DownArrowIcon />
            </div>
          </>
        )}
        <div className="email-container">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <EmailIcon />
        </div>
        <div className={isLogin ? "password-container" : "input-row"}>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {isLogin && (
              <EyeIcon open={showPassword} onClick={() => setShowPassword((v) => !v)} />
            )}
          </div>
          {!isLogin && (
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Retype password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}
        </div>
        {!isLogin && (
          <div className="show-password">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show password</label>
          </div>
        )}
        {isLogin ? (
          <div className="auth-links">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>
        ) : (
          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms of Use</a> and{" "}
              <a href="#">Privacy Policy</a>
            </label>
          </div>
        )}
        <button type="submit" className="auth-button">
          {isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>
      <div className="divider">
        <span>
          {isLogin ? "New to our platform?" : "Already have an account?"}
        </span>
      </div>
      <button className="toggle-auth-button" onClick={toggleAuthMode}>
        {isLogin ? "Create an account" : "Sign in"}
      </button>
    </div>
  );
};

export default AuthForm;
