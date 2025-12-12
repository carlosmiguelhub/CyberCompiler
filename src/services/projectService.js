import { db, auth } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

// Get base path for the signed-in user
function userProjectsRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not logged in");
  return collection(db, "users", uid, "projects");
}

// Create a new project
export async function createProject(name) {
  const ref = doc(userProjectsRef());
  await setDoc(ref, {
    name,
    createdAt: Date.now(),
  });
  return ref.id;
}

// Delete a project
export async function deleteProject(projectId) {
  await deleteDoc(doc(userProjectsRef(), projectId));
}

// Create a file inside a project
export async function createFile(projectId, { filename, language }) {
  const filesRef = collection(
    db,
    "users",
    auth.currentUser.uid,
    "projects",
    projectId,
    "files"
  );

  const fileRef = doc(filesRef);

  await setDoc(fileRef, {
    filename,
    language,
    content: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return fileRef.id;
}

// Save file content
export async function saveFile(projectId, fileId, content) {
  const fileRef = doc(
    db,
    "users",
    auth.currentUser.uid,
    "projects",
    projectId,
    "files",
    fileId
  );

  await updateDoc(fileRef, {
    content,
    updatedAt: Date.now(),
  });
}

// Real-time listener for projects + files
export function subscribeToProjects(callback) {
  const ref = userProjectsRef();

  return onSnapshot(ref, async (projectsSnap) => {
    const projects = [];

    for (const projectDoc of projectsSnap.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();

      // Fetch files inside each project
      const filesSnap = await getDocs(
        collection(
          db,
          "users",
          auth.currentUser.uid,
          "projects",
          projectId,
          "files"
        )
      );

      const files = filesSnap.docs.map((fileDoc) => ({
        id: fileDoc.id,
        ...fileDoc.data(),
      }));

      projects.push({
        id: projectId,
        ...projectData,
        files,
      });
    }

    callback(projects);
  });
}
