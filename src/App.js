import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CompilerPage from "./pages/CompilerPage";
import ProfilePage from "./pages/ProfilePage";      // 👈 new
import AppLayout from "./layouts/AppLayout";        // 👈 new
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 new

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes (requires login) */}
        <Route
          path="/compiler"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CompilerPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
