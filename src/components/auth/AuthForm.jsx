import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/AuthForm.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [transitionClass, setTransitionClass] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

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
      alert("You are not registered, please click on create new account to register.");
      setTransitionClass("slide-out");
      setTimeout(() => {
        setIsLogin(false);
        setTransitionClass("slide-in");
      }, 600);
    } else {
      alert("Successfully logged in, redirecting to the home page...");
      setEmail("");
      setPassword("");
      navigate("/home");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!role) {
      alert("Please select a role!");
      return;
    }

    const isAlreadyRegistered = registeredUsers.some(
      (user) => user.email === email
    );
    if (isAlreadyRegistered) {
      alert("This email is already registered. Please log in.");
      return;
    }

    const newUser = { username, email, password, role };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    alert("Registration successful!");

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");

    setTransitionClass("slide-out");
    setTimeout(() => {
      setIsLogin(true);
      setTransitionClass("slide-in");
    }, 600);
  };

  const toggleAuthMode = () => {
    setTransitionClass("slide-out");
    setTimeout(() => {
      setIsLogin(!isLogin);
      setTransitionClass("slide-in");
    }, 600);
  };

  return (
    <div className={`auth-container ${transitionClass}`}>
      <div className="auth-header">
        <h2>{isLogin ? "Sign in" : "Create Account"}</h2>
      </div>
      <form className="auth-form" onSubmit={isLogin ? handleLogin : handleRegister}>
        {isLogin ? (
          <>
            <div className="email-container">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-links">
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>
            <button type="submit" className="auth-button">
              Log in
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Retype password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
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
            </div>
            <div className="show-password">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show password</label>
            </div>
            <p className="terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of use</a> and{" "}
                <a href="#">Privacy Policy</a>
              </label>
            </p>
            <button type="submit" className="auth-button">
              Create Account
            </button>
          </>
        )}
      </form>
      <div className="divider">
        <span>
          {isLogin ? "New to our community?" : "Already have an account?"}
        </span>
      </div>
      <button className="toggle-auth-button" onClick={toggleAuthMode}>
        {isLogin ? "Create an account" : "Sign in"}
      </button>
    </div>
  );
};

export default AuthForm;
