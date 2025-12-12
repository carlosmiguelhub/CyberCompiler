import { useEffect, useState } from "react";
import {
  createProject,
  createFile,
  saveFile,
  subscribeToProjects,
} from "../services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  // Load all projects + files in real time
  useEffect(() => {
    const unsub = subscribeToProjects(setProjects);
    return () => unsub();
  }, []);

  return {
    projects,
    activeFile,
    setActiveFile,
    createProject,
    createFile,
    saveFile,
  };
}
