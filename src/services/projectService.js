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
 * Returns: [{ id, name, files:[{id, filename, language, content}] }]
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
        content: f.content || "",
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
 * Rename a project (workspace).
 */
export async function renameProject(projectId, name) {
  const projRef = doc(getProjectsCollection(), projectId);
  await updateDoc(projRef, {
    name,
    updatedAt: serverTimestamp(),
  });
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
 * Returns: { id, filename, language, content }
 */
export async function createFile(projectId, filename, language, content = "") {
  const filesCol = getFilesCollection(projectId);
  const docRef = await addDoc(filesCol, {
    filename,
    language,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // bump parent project's updatedAt (for realtime)
  const projRef = doc(getProjectsCollection(), projectId);
  await updateDoc(projRef, { updatedAt: serverTimestamp() });

  return {
    id: docRef.id,
    filename,
    language,
    content,
  };
}

/**
 * Rename a file (and optionally adjust language if you want later).
 */
export async function renameFile(projectId, fileId, filename) {
  const fileRef = doc(getFilesCollection(projectId), fileId);
  await updateDoc(fileRef, {
    filename,
    updatedAt: serverTimestamp(),
  });

  // bump parent project's updatedAt (for realtime)
  const projRef = doc(getProjectsCollection(), projectId);
  await updateDoc(projRef, { updatedAt: serverTimestamp() });
}

/**
 * Delete a file from a project.
 */
export async function deleteFile(projectId, fileId) {
  const fileRef = doc(getFilesCollection(projectId), fileId);
  await deleteDoc(fileRef);

  // bump parent project's updatedAt (for realtime)
  const projRef = doc(getProjectsCollection(), projectId);
  await updateDoc(projRef, { updatedAt: serverTimestamp() });
}

/**
 * Update file content / metadata in Firestore.
 * Example: updateFileContent(pid, fid, { content: "...", language: "c" })
 */
export async function updateFileContent(projectId, fileId, data) {
  const fileRef = doc(getFilesCollection(projectId), fileId);
  await updateDoc(fileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // bump parent project's updatedAt (for realtime)
  const projRef = doc(getProjectsCollection(), projectId);
  await updateDoc(projRef, { updatedAt: serverTimestamp() });
}
