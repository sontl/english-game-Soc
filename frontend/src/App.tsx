import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminDashboard from "./routes/AdminDashboard";
import Home from "./routes/Home";
import GameHub from "./routes/GameHub";
import { useAppStore } from "./store/appStore";

const App = () => {
  const { initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/games/:gameId" element={<GameHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
