import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";

// Import pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ExportPage from "./pages/ExportPage";

// Import chat components
import VirtualAssistanceButton from "./components/chat/VirtualAssistanceButton";

// Import styles
import "./styles/global.css";

const App = () => {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
        <VirtualAssistanceButton />
      </Router>
    </ChatProvider>
  );
};

export default App;
