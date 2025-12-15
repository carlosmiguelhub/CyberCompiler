// src/components/projects/ProjectWorkspace.jsx
import { useState, useEffect } from "react";
import { HiFolder, HiOutlinePlusSm, HiPencilAlt } from "react-icons/hi";
import { HiDocumentText, HiTrash } from "react-icons/hi2";
import {
  fetchProjectsWithFiles,
  createProject,
  deleteProject,
  createFile,
  deleteFile,
  renameProject,
  renameFile,
} from "../../services/projectService";
import { auth, db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function ProjectWorkspace({ onOpenFile }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    type: null, // 'addProject' | 'addFile' | 'deleteProject' | 'deleteFile' | 'renameProject' | 'renameFile'
    projectId: null,
    fileId: null,
  });

  const [projectNameInput, setProjectNameInput] = useState("");
  const [fileNameInput, setFileNameInput] = useState("");

  // ✅ Load from Firestore + subscribe for realtime
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const load = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError("");

        const data = await fetchProjectsWithFiles();
        if (!isMounted) return;

        const withOpenFlag = data.map((p) => ({
          ...p,
          isOpen: true,
        }));
        setProjects(withOpenFlag);
      } catch (err) {
        console.error("Failed to load projects:", err);
        if (!isMounted) return;
        setError("Failed to load your workspaces.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const init = async () => {
      await load();

      try {
        const user = auth.currentUser;
        if (!user) return;

        const projectsCol = collection(db, "users", user.uid, "projects");

        // 🔁 Re-run `load()` whenever anything about projects (or their updatedAt) changes
        unsubscribe = onSnapshot(projectsCol, () => {
          load();
        });
      } catch (err) {
        console.error("Failed to subscribe to projects:", err);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleProject = (id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isOpen: !p.isOpen } : p
      )
    );
  };

  // ---- Add project ----
  const openAddProjectModal = () => {
    setProjectNameInput("");
    setModal({ type: "addProject", projectId: null, fileId: null });
  };

  const confirmAddProject = async () => {
    const name = projectNameInput.trim();
    if (!name) return;

    try {
      const newProj = await createProject(name);
      setProjects((prev) => [
        ...prev,
        {
          ...newProj,
          files: [],
          isOpen: true,
        },
      ]);
      closeModal();
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create workspace. Please try again.");
    }
  };

  // ---- Rename project ----
  const openRenameProjectModal = (project) => {
    setProjectNameInput(project.name || "");
    setModal({ type: "renameProject", projectId: project.id, fileId: null });
  };

  const confirmRenameProject = async () => {
    const name = projectNameInput.trim();
    if (!name || !modal.projectId) return;

    try {
      await renameProject(modal.projectId, name);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === modal.projectId ? { ...p, name } : p
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to rename project:", err);
      alert("Failed to rename workspace. Please try again.");
    }
  };

  // ---- Add file ----
  const openAddFileModal = (projectId) => {
    setFileNameInput("");
    setModal({ type: "addFile", projectId, fileId: null });
  };

  const confirmAddFile = async () => {
    const filename = fileNameInput.trim();
    if (!filename || !modal.projectId) return;

    const languageGuess = guessLanguageFromFilename(filename);
    const defaultContent = getDefaultCodeForLanguage(languageGuess);

    try {
      const newFile = await createFile(
        modal.projectId,
        filename,
        languageGuess,
        defaultContent
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === modal.projectId
            ? {
                ...p,
                files: [...p.files, newFile],
              }
            : p
        )
      );

      closeModal();
    } catch (err) {
      console.error("Failed to create file:", err);
      alert("Failed to create file. Please try again.");
    }
  };

  // ---- Rename file ----
  const openRenameFileModal = (projectId, file) => {
    setFileNameInput(file.filename || "");
    setModal({ type: "renameFile", projectId, fileId: file.id });
  };

  const confirmRenameFile = async () => {
    const filename = fileNameInput.trim();
    const { projectId, fileId } = modal;
    if (!filename || !projectId || !fileId) return;

    try {
      await renameFile(projectId, fileId, filename);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                files: p.files.map((f) =>
                  f.id === fileId ? { ...f, filename } : f
                ),
              }
            : p
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to rename file:", err);
      alert("Failed to rename file. Please try again.");
    }
  };

  // ---- Delete project ----
  const openDeleteProjectModal = (projectId) => {
    setModal({ type: "deleteProject", projectId, fileId: null });
  };

  const confirmDeleteProject = async () => {
    if (!modal.projectId) return;

    try {
      await deleteProject(modal.projectId);
      setProjects((prev) => prev.filter((p) => p.id !== modal.projectId));
      closeModal();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete workspace. Please try again.");
    }
  };

  // ---- Delete file ----
  const openDeleteFileModal = (projectId, fileId) => {
    setModal({ type: "deleteFile", projectId, fileId });
  };

  const confirmDeleteFile = async () => {
    const { projectId, fileId } = modal;
    if (!projectId || !fileId) return;

    try {
      await deleteFile(projectId, fileId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                files: p.files.filter((f) => f.id !== fileId),
              }
            : p
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert("Failed to delete file. Please try again.");
    }
  };

  const closeModal = () => {
    setModal({ type: null, projectId: null, fileId: null });
  };

  // ---- Open file in editor ----
  const handleOpenFile = (projectId, file) => {
    if (!onOpenFile) return;

    onOpenFile({
      projectId,
      file: {
        ...file,
        content: file.content ?? "",
      },
    });
  };

  return (
    <>
      <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {/* Header */}
        <header className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Project Files
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Organize subjects & files
            </p>
          </div>
          <button
            type="button"
            onClick={openAddProjectModal}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <HiOutlinePlusSm className="h-3 w-3" />
            <span>New</span>
          </button>
        </header>

        {/* Status */}
        {loading && (
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Loading your workspaces...
          </p>
        )}
        {error && !loading && (
          <p className="mt-2 text-center text-[11px] text-red-500">
            {error}
          </p>
        )}

        {/* List */}
        <div className="mt-1 flex-1 space-y-1 overflow-y-auto pr-1">
          {!loading && projects.length === 0 ? (
            <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
              No projects yet. Click <span className="font-semibold">New</span> to
              create one.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-start justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    className="flex flex-1 items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <HiFolder className="h-4 w-4 text-amber-500" />
                      <span className="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {project.files.length} file
                        {project.files.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {project.isOpen ? "▾" : "▸"}
                      </span>
                    </div>
                  </button>

                  {/* Rename project */}
                  <button
                    type="button"
                    onClick={() => openRenameProjectModal(project)}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    title="Rename workspace"
                  >
                    <HiPencilAlt className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete project */}
                  <button
                    type="button"
                    onClick={() => openDeleteProjectModal(project.id)}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    title="Delete workspace"
                  >
                    <HiTrash className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Files */}
                {project.isOpen && project.files.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-5">
                    {project.files.map((file) => (
                      <li key={file.id} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleOpenFile(project.id, file)}
                          className="flex w-full items-center justify-between rounded-md px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                          <span className="flex items-center gap-1.5">
                            <HiDocumentText className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{file.filename}</span>
                          </span>
                          <span className="rounded-full bg-slate-100 px-1.5 py-[1px] text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {file.language}
                          </span>
                        </button>

                        {/* Rename file */}
                        <button
                          type="button"
                          onClick={() => openRenameFileModal(project.id, file)}
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                          title="Rename file"
                        >
                          <HiPencilAlt className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete file */}
                        <button
                          type="button"
                          onClick={() => openDeleteFileModal(project.id, file.id)}
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Delete file"
                        >
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add file button */}
                {project.isOpen && (
                  <div className="mt-1 pl-5">
                    <button
                      type="button"
                      onClick={() => openAddFileModal(project.id)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    >
                      <HiOutlinePlusSm className="h-3 w-3" />
                      <span>Add file</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* MODAL */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Add / Rename Project */}
            {(modal.type === "addProject" || modal.type === "renameProject") && (
              <>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {modal.type === "addProject"
                    ? "Create new workspace / subject"
                    : "Rename workspace"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {modal.type === "addProject"
                    ? <>
                        Give your workspace a clear name. Example:
                        <span className="font-semibold">
                          {" "}
                          "Computer Programming 1"
                        </span>{" "}
                        or
                        <span className="font-semibold"> "Data Structures Lab"</span>.
                      </>
                    : "Update the workspace name to something more descriptive."}
                </p>

                <label className="mt-4 block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Workspace name
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder='e.g. "Programming 1 - Section A"'
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  />
                </label>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={
                      modal.type === "addProject"
                        ? confirmAddProject
                        : confirmRenameProject
                    }
                    className="rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700"
                  >
                    {modal.type === "addProject"
                      ? "Create workspace"
                      : "Save name"}
                  </button>
                </div>
              </>
            )}

            {/* Add / Rename File */}
            {(modal.type === "addFile" || modal.type === "renameFile") && (
              <>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {modal.type === "addFile" ? "Create new file" : "Rename file"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Use a descriptive file name with the correct extension so we can
                  detect the language automatically. Examples:
                  <br />
                  <span className="font-mono text-[10px]">
                    hello.c, main.py, loops.java, index.js
                  </span>
                </p>

                <label className="mt-4 block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  File name
                  <input
                    type="text"
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                    placeholder='e.g. "hello.c" or "main.py"'
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  />
                </label>

                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                  Tip: Your instructor might ask you to submit exactly named files
                  like <span className="font-mono">hello.c</span> or{" "}
                  <span className="font-mono">activity1.py</span>.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={
                      modal.type === "addFile"
                        ? confirmAddFile
                        : confirmRenameFile
                    }
                    className="rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700"
                  >
                    {modal.type === "addFile" ? "Create file" : "Save name"}
                  </button>
                </div>
              </>
            )}

            {modal.type === "deleteProject" && (
              <>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Delete workspace?
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  This will remove the workspace and all of its files from this list.
                  It won&apos;t affect any backups you may have exported.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteProject}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-red-700"
                  >
                    Delete workspace
                  </button>
                </div>
              </>
            )}

            {modal.type === "deleteFile" && (
              <>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Delete file?
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  This will remove the file from this workspace. Make sure you
                  don&apos;t need the code anymore or have it exported before
                  deleting.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteFile}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-red-700"
                  >
                    Delete file
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function guessLanguageFromFilename(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".c")) return "c";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx"))
    return "cpp";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".py")) return "python";
  return "text";
}

function getDefaultCodeForLanguage(lang) {
  switch ((lang || "").toLowerCase()) {
    case "c":
      return `#include <stdio.h>

int main() {
    printf("Hello, world!\\n");
    return 0;
}
`;
    case "cpp":
      return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
`;
    case "java":
      return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
`;
    case "javascript":
      return `console.log("Hello, world!");`;
    case "python":
      return `print("Hello, world!")`;
    default:
      return "// Start coding here...";
  }
}

export default ProjectWorkspace;
