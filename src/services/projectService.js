// src/services/projectService.js
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Make sure user is logged in
function requireUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

// Helper to get projects collection for current user
function getProjectsCollection() {
  const user = requireUser();
  return collection(db, "users", user.uid, "projects");
}

// Helper to get files subcollection for a project
function getFilesCollection(projectId) {
  const user = requireUser();
  return collection(db, "users", user.uid, "projects", projectId, "files");
}

/**
 * Load all projects + their files for the current user.
 * Returns: [{ id, name, files:[{id, filename, language}] }]
 */
export async function fetchProjectsWithFiles() {
  const projectsCol = getProjectsCollection();
  const projSnap = await getDocs(projectsCol);

  const projects = [];

  for (const projDoc of projSnap.docs) {
    const projData = projDoc.data();
    const project = {
      id: projDoc.id,
      name: projData.name || "Untitled",
      files: [],
    };

    const filesCol = getFilesCollection(projDoc.id);
    const filesSnap = await getDocs(filesCol);
    project.files = filesSnap.docs.map((fileDoc) => {
      const f = fileDoc.data();
      return {
        id: fileDoc.id,
        filename: f.filename || "untitled.txt",
        language: f.language || "text",
      };
    });

    projects.push(project);
  }

  return projects;
}

/**
 * Create a new project for current user.
 * Returns: { id, name, files: [] }
 */
export async function createProject(name) {
  const projectsCol = getProjectsCollection();
  const docRef = await addDoc(projectsCol, {
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    name,
    files: [],
  };
}

/**
 * Delete a project and all its files.
 */
export async function deleteProject(projectId) {
  const projRef = doc(getProjectsCollection(), projectId);

  // delete files in subcollection
  const filesCol = getFilesCollection(projectId);
  const filesSnap = await getDocs(filesCol);
  await Promise.all(filesSnap.docs.map((f) => deleteDoc(f.ref)));

  // delete project doc itself
  await deleteDoc(projRef);
}

/**
 * Create a file inside a project.
 * Returns: { id, filename, language }
 */
export async function createFile(projectId, filename, language) {
  const filesCol = getFilesCollection(projectId);
  const docRef = await addDoc(filesCol, {
    filename,
    language,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    filename,
    language,
  };
}

/**
 * Delete a file from a project.
 */
export async function deleteFile(projectId, fileId) {
  const fileRef = doc(getFilesCollection(projectId), fileId);
  await deleteDoc(fileRef);
}

/**
 * (for later) Update file content / metadata in Firestore.
 * We’re not using this yet in the UI, but it’s ready.
 */
export async function updateFileContent(projectId, fileId, data) {
  const fileRef = doc(getFilesCollection(projectId), fileId);
  await updateDoc(fileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
