// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./register.css"; 

// const Register = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleRegister = (e) => {
//     e.preventDefault();

//     if (!email.includes("@")) {
//       setError("Enter a valid email address");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     localStorage.setItem("registeredUser", email);
//     alert("Registration Successful! Please login.");
//     setTimeout(() => navigate("/"), 0);
//   };

//   return (
//     <div className="register-container">
//       <h2 className="register-title">Register</h2>
//       <form onSubmit={handleRegister}>
//         <input
//           className="register-input"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           required
//         />
//         <input
//           className="register-input"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           required
//         />
//         <input
//           className="register-input"
//           type="password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           placeholder="Confirm Password"
//           required
//         />
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         <button className="register-button" type="submit">
//           Register
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Register;
