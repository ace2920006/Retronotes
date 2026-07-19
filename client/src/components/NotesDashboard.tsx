"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchAPI } from "@/lib/api";
import {
  playKeyClick,
  playSpacebar,
  playFloppySave,
  playBootBeep,
  playToggleBeep,
  isSoundEnabled,
  setSoundEnabled
} from "@/lib/retroAudio";
import CassettePlayer from "./CassettePlayer";


interface Tag {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  color?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  folderId?: string | null;
  folder?: Folder | null;
  tags: Tag[];
  color?: string | null;
}

interface DashboardStats {
  totalNotes: number;
  pinnedCount: number;
  archivedCount: number;
  trashedCount: number;
  favoriteCount: number;
  foldersCount: number;
  tagsCount: number;
  totalWordCount: number;
  folderStats: {
    folderId: string;
    folderName: string;
    color?: string;
    noteCount: number;
  }[];
}

interface NotesDashboardProps {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export default function NotesDashboard({ token, user }: NotesDashboardProps) {
  // --- STATE ---
  const [isBooting, setIsBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Note editing state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFolderId, setEditFolderId] = useState("");
  const [editTagsString, setEditTagsString] = useState(""); // comma-separated

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all"); // 'all', 'pinned', 'archived', 'trashed', 'favorite'
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Themes & Effects
  const [theme, setTheme] = useState<string>("green");
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Status flags
  const [isOffline, setIsOffline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'dashboard'>('editor');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // AI Drawer state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '### 📟 RetroNotes AI Terminal Online\n\nAsk me about your notes, or click an action below to summarize or analyze this note.' }
  ]);
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  // Keyboard shortcut help modal
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  
  // Folders modal CRUD
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3b82f6");

  // --- NEW STATES FOR ENHANCEMENTS ---
  const [editColor, setEditColor] = useState<string>("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'offline' | 'idle'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Command Palette State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteActiveView, setPaletteActiveView] = useState<'main' | 'theme'>('main');
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0);

  // Save ref to keep track of current note values
  const editTitleRef = useRef(editTitle);
  const editContentRef = useRef(editContent);
  const editFolderIdRef = useRef(editFolderId);
  const editTagsStringRef = useRef(editTagsString);

  useEffect(() => {
    editTitleRef.current = editTitle;
    editContentRef.current = editContent;
    editFolderIdRef.current = editFolderId;
    editTagsStringRef.current = editTagsString;
  }, [editTitle, editContent, editFolderId, editTagsString]);

  // --- BOOT SEQUENCE ANIMATION ---
  useEffect(() => {
    // Play BIOS beep on load
    playBootBeep();

    const logo = [
      "┌────────────────────────────────────────────────────────┐",
      "│  ____  _____ _____ ____   ___  _   _  ___ _____ _____  │",
      "│ |  _ \\| ____|_   _|  _ \\ / _ \\| \\ | |/ _ \\_   _| ____| │",
      "│ | |_) |  _|   | | | |_) | | | |  \\| | | | || | |  _|   │",
      "│ |  _ <| |___  | | |  _ <| |_| | |\\  | |_| || | | |___  │",
      "│ |_| \\_\\_____| |_| |_| \\_\\\\___/|_| \\_\\___/ |_| |_____| │",
      "└────────────────────────────────────────────────────────┘"
    ];

    const lines = [
      "RETRO-BIOS v4.10, Copyright (C) 1983-2026 RetroCorp.",
      "CPU: GEMINI 2.5 FLASH PRO @ 4.20 GHz",
      "CO-PROCESSOR: RETRO-MUSE 9000 ONLINE",
      "SOUND: SYNTHESIZED WEB-AUDIO DRIVER v1.0",
      "DISK: DRIVE A: (SQLITE DEVDB) SECTOR 0 - OK",
      "NETWORK: SYNC PROTOCOL STABLE (HTTP/JSON)",
      "AUTHENTICATING USER: " + user.name.toUpperCase(),
      "ACCESS GRANTED. INITIALIZING RETRONOTES OS...",
      "SYSTEM ONLINE. READY."
    ];

    let currentLogoLine = 0;
    let logoTimer: NodeJS.Timeout;
    let memInterval: NodeJS.Timeout;
    let restInterval: NodeJS.Timeout;

    const showLogo = () => {
      if (currentLogoLine < logo.length) {
        setBootLines((prev) => [...prev, logo[currentLogoLine]]);
        currentLogoLine++;
        logoTimer = setTimeout(showLogo, 70);
      } else {
        // Logo done, do memory check
        setBootLines((prev) => [...prev, "", "TESTING CONVENTIONAL BASE MEMORY..."]);
        let mem = 0;
        memInterval = setInterval(() => {
          mem += 64;
          if (mem <= 640) {
            setBootLines((prev) => {
              const next = [...prev];
              if (next[next.length - 1].startsWith("MEM CHECK:")) {
                next[next.length - 1] = `MEM CHECK: [ ${mem} KB ] OK`;
              } else {
                next.push(`MEM CHECK: [ ${mem} KB ] OK`);
              }
              return next;
            });
            playKeyClick(2.2);
          } else {
            clearInterval(memInterval);
            setBootLines((prev) => [...prev, ""]);
            let restIdx = 0;
            restInterval = setInterval(() => {
              if (restIdx < lines.length) {
                setBootLines((prev) => [...prev, lines[restIdx]]);
                playKeyClick(1.4);
                restIdx++;
              } else {
                clearInterval(restInterval);
                setTimeout(() => {
                  setIsBooting(false);
                }, 800);
              }
            }, 150);
          }
        }, 80);
      }
    };

    logoTimer = setTimeout(showLogo, 100);

    return () => {
      clearTimeout(logoTimer);
      clearInterval(memInterval);
      clearInterval(restInterval);
    };
  }, [user.name]);

  // --- LOCAL STORAGE CONFIGS LOAD ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("retronotes-theme") || "green";
      const savedCrt = localStorage.getItem("retronotes-crt") !== "false";
      const savedSound = localStorage.getItem("retronotes-sounds") !== "false";
      setTheme(savedTheme);
      setCrtEnabled(savedCrt);
      setSoundOn(savedSound);
      document.documentElement.setAttribute("data-theme", savedTheme);
      if (savedCrt) {
        document.documentElement.classList.add("crt-effect", "crt-flicker");
      } else {
        document.documentElement.classList.remove("crt-effect", "crt-flicker");
      }
    }
  }, []);

  // --- DATA LOADING ---
  const loadData = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch folders
      const fetchedFolders = await fetchAPI("/folders", { token });
      setFolders(fetchedFolders);

      // 2. Fetch tags
      const fetchedTags = await fetchAPI("/tags", { token });
      setTags(fetchedTags);

      // 3. Fetch notes
      const endpoint = `/notes?sort=${sortOrder}${selectedFolderId ? `&folderId=${selectedFolderId}` : ""}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}${activeStatus !== "all" ? `&status=${activeStatus}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
      const fetchedNotes = await fetchAPI(endpoint, { token });
      setNotes(fetchedNotes);

      // Save to offline cache
      localStorage.setItem("retronotes-cache-notes", JSON.stringify(fetchedNotes));
      localStorage.setItem("retronotes-cache-folders", JSON.stringify(fetchedFolders));
      localStorage.setItem("retronotes-cache-tags", JSON.stringify(fetchedTags));
      setIsOffline(false);
    } catch (error) {
      console.warn("Fetch failed, entering offline cache fallback mode:", error);
      setIsOffline(true);
      // Load cache
      const cachedNotes = localStorage.getItem("retronotes-cache-notes");
      const cachedFolders = localStorage.getItem("retronotes-cache-folders");
      const cachedTags = localStorage.getItem("retronotes-cache-tags");
      if (cachedNotes) setNotes(JSON.parse(cachedNotes));
      if (cachedFolders) setFolders(JSON.parse(cachedFolders));
      if (cachedTags) setTags(JSON.parse(cachedTags));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!isBooting) {
      loadData();
    }
  }, [isBooting, selectedFolderId, selectedTag, activeStatus, sortOrder]);

  // Load stats when dashboard is opened
  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeView]);

  const loadDashboardStats = async () => {
    try {
      const statsData = await fetchAPI("/users/dashboard", { token });
      setStats(statsData);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    }
  };

  // Debounced note search
  useEffect(() => {
    if (isBooting) return;
    const delayDebounce = setTimeout(() => {
      loadData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // --- THEME MUTATIONS ---
  const toggleTheme = (newTheme: string) => {
    playToggleBeep();
    setTheme(newTheme);
    localStorage.setItem("retronotes-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleCrt = () => {
    playToggleBeep();
    const nextCrt = !crtEnabled;
    setCrtEnabled(nextCrt);
    localStorage.setItem("retronotes-crt", String(nextCrt));
    if (nextCrt) {
      document.documentElement.classList.add("crt-effect", "crt-flicker");
    } else {
      document.documentElement.classList.remove("crt-effect", "crt-flicker");
    }
  };

  // --- ACTIONS ---
  // Select active note for editing
  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditFolderId(note.folderId || "");
    setEditTagsString(note.tags.map(t => t.name).join(", "));
    setEditColor(note.color || "");
    setFlashcards([]);
  };

  const createNewNote = () => {
    const tempNew: Note = {
      id: "new-note-temp",
      title: "Untitled Note",
      content: "",
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      isFavorite: false,
      color: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: selectedFolderId,
      tags: selectedTag ? [{ id: "temp", name: selectedTag }] : [],
    };
    setSelectedNote(tempNew);
    setEditTitle(tempNew.title);
    setEditContent(tempNew.content);
    setEditFolderId(tempNew.folderId || "");
    setEditTagsString(selectedTag ? selectedTag : "");
    setEditColor("");
    setFlashcards([]);
  };

  // Save changes to Server / Offline cache
  const saveNote = async () => {
    if (!selectedNote) return;

    playFloppySave();
    setIsSaving(true);
    setSaveMessage("SAVING TO SECTOR 4...");

    const tagNames = editTagsString
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: editTitle,
      content: editContent,
      folderId: editFolderId === "" ? null : editFolderId,
      tagNames,
      color: editColor === "" ? null : editColor,
    };

    try {
      if (isOffline || selectedNote.id === "new-note-temp") {
        if (selectedNote.id === "new-note-temp") {
          // Offline/Online New Creation
          if (isOffline) {
            // Simulated offline note
            const offlineNote: Note = {
              id: "offline-" + Math.random().toString(36).substr(2, 9),
              title: editTitle,
              content: editContent,
              isPinned: false,
              isArchived: false,
              isTrashed: false,
              isFavorite: false,
              color: editColor || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              folderId: editFolderId === "" ? null : editFolderId,
              tags: tagNames.map((name, i) => ({ id: `offline-tag-${i}`, name })),
            };
            const nextNotes = [offlineNote, ...notes];
            setNotes(nextNotes);
            localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
            setSelectedNote(offlineNote);
          } else {
            // Live backend save
            const saved = await fetchAPI("/notes", {
              token,
              method: "POST",
              body: JSON.stringify(payload),
            });
            setSelectedNote(saved);
            loadData();
          }
        } else {
          // Offline update or online update
          if (isOffline) {
            const nextNotes = notes.map(n => {
              if (n.id === selectedNote.id) {
                return {
                  ...n,
                  title: editTitle,
                  content: editContent,
                  folderId: editFolderId === "" ? null : editFolderId,
                  tags: tagNames.map((name, i) => ({ id: `offline-tag-${i}`, name })),
                  color: editColor || null,
                  updatedAt: new Date().toISOString(),
                };
              }
              return n;
            });
            setNotes(nextNotes);
            localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
          } else {
            const updated = await fetchAPI(`/notes/${selectedNote.id}`, {
              token,
              method: "PATCH",
              body: JSON.stringify(payload),
            });
            setSelectedNote(updated);
            loadData();
          }
        }
      } else {
        // Online Update
        const updated = await fetchAPI(`/notes/${selectedNote.id}`, {
          token,
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSelectedNote(updated);
        loadData();
      }

      setSaveMessage("SUCCESSFULLY WRITTEN.");
      setTimeout(() => setIsSaving(false), 800);
    } catch (e) {
      console.error(e);
      setSaveMessage("SAVE ERROR.");
      setTimeout(() => setIsSaving(false), 1500);
    }
  };

  // Toggle properties (Pin, Archive, Trash, Favorite)
  const toggleProperty = async (prop: 'isPinned' | 'isArchived' | 'isTrashed' | 'isFavorite') => {
    if (!selectedNote || selectedNote.id === "new-note-temp") return;

    const updatedVal = !selectedNote[prop];
    const updatePayload = { [prop]: updatedVal };

    // If archiving or trashing, unpin automatically
    if ((prop === 'isArchived' || prop === 'isTrashed') && updatedVal) {
      updatePayload.isPinned = false;
    }

    try {
      if (isOffline) {
        const nextNotes = notes.map(n => {
          if (n.id === selectedNote.id) {
            return { ...n, ...updatePayload };
          }
          return n;
        });
        setNotes(nextNotes);
        localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
        setSelectedNote({ ...selectedNote, ...updatePayload });
      } else {
        const updated = await fetchAPI(`/notes/${selectedNote.id}`, {
          token,
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        setSelectedNote(updated);
        loadData();
      }
    } catch (e) {
      console.error("Toggle property failed:", e);
    }
  };

  // Hard Delete
  const deletePermanently = async (id: string) => {
    if (isOffline) {
      const nextNotes = notes.filter(n => n.id !== id);
      setNotes(nextNotes);
      localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
      setSelectedNote(null);
      return;
    }

    try {
      await fetchAPI(`/notes/${id}`, {
        token,
        method: "DELETE",
      });
      setSelectedNote(null);
      loadData();
    } catch (e) {
      console.error("Failed to delete note permanently:", e);
    }
  };

  // Empty Trash
  const emptyTrash = async () => {
    if (window.confirm("ARE YOU SURE YOU WANT TO PERMANENTLY EMPTY THE TRASH CAN?")) {
      if (isOffline) {
        const nextNotes = notes.filter(n => !n.isTrashed);
        setNotes(nextNotes);
        localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
        setSelectedNote(null);
        return;
      }

      try {
        await fetchAPI("/notes/empty-trash", { token, method: "POST" });
        setSelectedNote(null);
        loadData();
      } catch (e) {
        console.error("Failed to empty trash:", e);
      }
    }
  };

  // Create folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      if (isOffline) {
        const fakeFolder = { id: `folder-${Math.random()}`, name: newFolderName, color: newFolderColor };
        const nextFolders = [...folders, fakeFolder];
        setFolders(nextFolders);
        localStorage.setItem("retronotes-cache-folders", JSON.stringify(nextFolders));
      } else {
        await fetchAPI("/folders", {
          token,
          method: "POST",
          body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
        });
        loadData();
      }
      setNewFolderName("");
      setShowFolderModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // --- EXPORTS ---
  const exportNote = (type: "txt" | "md" | "pdf") => {
    if (!selectedNote) return;

    const titleClean = selectedNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    if (type === "pdf") {
      window.print();
      return;
    }

    let fileContent = "";
    let extension = "txt";

    if (type === "txt") {
      fileContent = `=== ${selectedNote.title.toUpperCase()} ===\nUpdated: ${new Date(selectedNote.updatedAt).toLocaleString()}\n\n${selectedNote.content}`;
      extension = "txt";
    } else if (type === "md") {
      fileContent = `# ${selectedNote.title}\n\n*Updated: ${new Date(selectedNote.updatedAt).toLocaleString()}*\n\n${selectedNote.content}`;
      extension = "md";
    }

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${titleClean}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escaping the boot sequence
      if (isBooting) {
        if (e.key === "Escape") {
          e.preventDefault();
          playToggleBeep();
          setIsBooting(false);
        }
        return;
      }

      // If Command Palette is open, let the command palette intercept keys
      if (showCommandPalette) {
        if (e.key === "Escape") {
          e.preventDefault();
          setShowCommandPalette(false);
        }
        return;
      }

      // Ctrl + S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveNote();
      }
      // Ctrl + N (New Note)
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        createNewNote();
      }
      // Ctrl + K (Search / Command Palette)
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setPaletteSearch("");
        setPaletteActiveView('main');
        setPaletteSelectedIndex(0);
        setShowCommandPalette(true);
      }
      // Ctrl + D (Duplicate)
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        duplicateNote();
      }
      // Delete (Trash)
      if (e.key === "Delete") {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea" && selectedNote && selectedNote.id !== "new-note-temp") {
          e.preventDefault();
          toggleProperty('isTrashed');
        }
      }
      // Ctrl + P (Pin note)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        toggleProperty('isPinned');
      }
      // Esc (Close help/drawers)
      if (e.key === "Escape") {
        setShowShortcutHelp(false);
        setAiOpen(false);
        setShowFolderModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNote, editTitle, editContent, editFolderId, editTagsString, editColor, isOffline, isBooting, showCommandPalette]);

  // --- AI INTEGRATIONS ---
  const callAiAction = async (action: 'summarize' | 'grammar' | 'title' | 'tags' | 'flashcards') => {
    if (!selectedNote) return;

    setAiLoading(true);
    setAiOpen(true);

    let endpoint = "";
    let body = { content: editContent };

    if (action === 'summarize') endpoint = "/ai/summarize";
    else if (action === 'grammar') endpoint = "/ai/correct-grammar";
    else if (action === 'title') endpoint = "/ai/generate-title";
    else if (action === 'tags') endpoint = "/ai/suggest-tags";
    else if (action === 'flashcards') endpoint = "/ai/generate-flashcards";

    try {
      const res = await fetchAPI(endpoint, {
        token,
        method: "POST",
        body: JSON.stringify(body),
      });

      if (action === 'summarize') {
        setAiChat(prev => [...prev, { role: 'assistant', content: res.summary }]);
      } else if (action === 'grammar') {
        setEditContent(res.correctedContent);
        setAiChat(prev => [...prev, { role: 'assistant', content: '✨ Grammar fixed in editor.' }]);
      } else if (action === 'title') {
        setEditTitle(res.title);
        setAiChat(prev => [...prev, { role: 'assistant', content: `✨ Title updated to: **${res.title}**` }]);
      } else if (action === 'tags') {
        setEditTagsString(res.tags.join(", "));
        setAiChat(prev => [...prev, { role: 'assistant', content: `✨ AI suggested tags: ${res.tags.join(", ")}` }]);
      } else if (action === 'flashcards') {
        setFlashcards(res.flashcards);
        setCurrentFlashcardIdx(0);
        setShowFlashcardAnswer(false);
        setAiChat(prev => [...prev, { role: 'assistant', content: `📖 Generated **${res.flashcards.length}** flashcards! See Study Mode tab.` }]);
      }
    } catch (e) {
      console.error(e);
      setAiChat(prev => [...prev, { role: 'assistant', content: '⚠️ AI operation failed. Ensure the server is online.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const submitAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    const userMsg = aiQuery;
    setAiChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiQuery("");
    setAiLoading(true);

    try {
      const messagesHistory = aiChat.map(m => ({ role: m.role, content: m.content }));
      messagesHistory.push({ role: 'user', content: userMsg });

      // If note context is open, prepend it to prompt
      let fullMessage = userMsg;
      if (selectedNote) {
        fullMessage = `[Active Note Context: Title: "${editTitle}", Content: "${editContent}"]\n\nUser Question: ${userMsg}`;
      }

      const res = await fetchAPI("/ai/chat", {
        token,
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullMessage }]
        }),
      });

      setAiChat(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (e) {
      setAiChat(prev => [...prev, { role: 'assistant', content: '⚠️ Connection timeout. AI offline.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Ask AI to filter notes
  const runAiSearch = async () => {
    if (!searchQuery.startsWith("?")) return;
    const cleanQuery = searchQuery.substring(1).trim();
    if (!cleanQuery) return;

    setIsSyncing(true);
    try {
      const notesContext = notes.map(n => ({ id: n.id, title: n.title, content: n.content }));
      const res = await fetchAPI("/ai/search", {
        token,
        method: "POST",
        body: JSON.stringify({ query: cleanQuery, notes: notesContext }),
      });

      const matchedIds: string[] = res.matchedIds;
      const matchedNotes = notes.filter(n => matchedIds.includes(n.id));
      setNotes(matchedNotes);
    } catch (e) {
      console.error("AI search query failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- ENHANCEMENTS AND HELPERS ---
  const duplicateNote = async () => {
    if (!selectedNote || selectedNote.id === "new-note-temp") return;
    playFloppySave();
    try {
      const dupTitle = `Copy of ${selectedNote.title}`;
      const dupContent = selectedNote.content;
      const dupFolderId = selectedNote.folderId || undefined;
      const dupTags = selectedNote.tags.map(t => t.name);
      const dupColor = editColor;

      if (isOffline) {
        const offlineNote: Note = {
          id: "offline-" + Math.random().toString(36).substr(2, 9),
          title: dupTitle,
          content: dupContent,
          isPinned: false,
          isArchived: false,
          isTrashed: false,
          isFavorite: false,
          color: dupColor || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folderId: dupFolderId || null,
          tags: dupTags.map((name, i) => ({ id: `offline-tag-${i}`, name })),
        };
        const nextNotes = [offlineNote, ...notes];
        setNotes(nextNotes);
        localStorage.setItem("retronotes-cache-notes", JSON.stringify(nextNotes));
        setSelectedNote(offlineNote);
      } else {
        const saved = await fetchAPI("/notes", {
          token,
          method: "POST",
          body: JSON.stringify({
            title: dupTitle,
            content: dupContent,
            folderId: dupFolderId,
            tagNames: dupTags,
            color: dupColor,
          }),
        });
        setSelectedNote(saved);
        loadData();
      }
    } catch (e) {
      console.error("Duplicate failed:", e);
    }
  };

  const themesList = ["green", "amber", "cyberpunk", "slate", "light"];
  
  const cycleTheme = () => {
    const currentIndex = themesList.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themesList.length;
    const nextTheme = themesList[nextIndex];
    toggleTheme(nextTheme);
  };

  const handleDropImage = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const replacement = `![image](${base64})`;
            const newContent = text.substring(0, start) + replacement + text.substring(end);
            setEditContent(newContent);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOverImage = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const insertMarkdown = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case "h1":
        replacement = `\n# ${selectedText || "Heading 1"}\n`;
        cursorOffset = replacement.length;
        break;
      case "h2":
        replacement = `\n## ${selectedText || "Heading 2"}\n`;
        cursorOffset = replacement.length;
        break;
      case "code":
        replacement = `\`${selectedText || "code"}\``;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](https://example.com)`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case "image":
        replacement = `![${selectedText || "alt text"}](https://example.com/image.png)`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case "list":
        replacement = `\n- ${selectedText || "list item"}\n`;
        cursorOffset = replacement.length;
        break;
      case "quote":
        replacement = `\n> ${selectedText || "block quote"}\n`;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 50);
  };

  const getGroupedNotes = (notesList: Note[]) => {
    const today: Note[] = [];
    const yesterday: Note[] = [];
    const twoDaysAgo: Note[] = [];
    const lastWeek: Note[] = [];
    const older: Note[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfTwoDaysAgo = new Date(startOfToday);
    startOfTwoDaysAgo.setDate(startOfTwoDaysAgo.getDate() - 2);
    const startOfLastWeek = new Date(startOfToday);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    notesList.forEach(note => {
      const noteDate = new Date(note.updatedAt);
      if (noteDate >= startOfToday) {
        today.push(note);
      } else if (noteDate >= startOfYesterday) {
        yesterday.push(note);
      } else if (noteDate >= startOfTwoDaysAgo) {
        twoDaysAgo.push(note);
      } else if (noteDate >= startOfLastWeek) {
        lastWeek.push(note);
      } else {
        older.push(note);
      }
    });

    return [
      { title: "Recently Opened", notes: today },
      { title: "Yesterday", notes: yesterday },
      { title: "2 days ago", notes: twoDaysAgo },
      { title: "Last Week", notes: lastWeek },
      { title: "Older", notes: older },
    ].filter(group => group.notes.length > 0);
  };

  const getCommandPaletteOptions = () => {
    if (paletteActiveView === 'theme') {
      return [
        { id: 'theme-green', label: '🟢 CRT Green', action: () => { toggleTheme('green'); setShowCommandPalette(false); } },
        { id: 'theme-amber', label: '🟠 Amber', action: () => { toggleTheme('amber'); setShowCommandPalette(false); } },
        { id: 'theme-neon', label: '🔵 Neon', action: () => { toggleTheme('cyberpunk'); setShowCommandPalette(false); } },
        { id: 'theme-dark', label: '⚫ Dark', action: () => { toggleTheme('slate'); setShowCommandPalette(false); } },
        { id: 'theme-light', label: '⚪ Light', action: () => { toggleTheme('light'); setShowCommandPalette(false); } },
        { id: 'theme-back', label: '◀ Back', action: () => setPaletteActiveView('main') },
      ];
    }

    const defaultCommands = [
      { id: 'new-note', label: '📝 Create a new note', action: () => { createNewNote(); setShowCommandPalette(false); } },
      { id: 'theme-switch', label: '🎨 Switch theme...', action: () => { setPaletteActiveView('theme'); setPaletteSelectedIndex(0); } },
      { id: 'go-favorites', label: '⭐ Go to Favorites', action: () => { setActiveStatus('favorite'); setSelectedFolderId(null); setSelectedTag(null); setShowCommandPalette(false); } },
      { id: 'open-settings', label: '⚙️ Open Settings / Help', action: () => { setShowShortcutHelp(true); setShowCommandPalette(false); } },
    ];

    if (!paletteSearch.trim()) {
      return defaultCommands;
    }

    const filteredNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(paletteSearch.toLowerCase()) ||
        n.content.toLowerCase().includes(paletteSearch.toLowerCase())
    );

    const noteOptions = filteredNotes.slice(0, 5).map((note) => ({
      id: `note-${note.id}`,
      label: `📄 Note: ${note.title}`,
      action: () => {
        selectNote(note);
        setShowCommandPalette(false);
      },
    }));

    return [
      ...noteOptions,
      {
        id: 'create-note-search',
        label: `➕ Create note: "${paletteSearch}"`,
        action: () => {
          createNewNote();
          setEditTitle(paletteSearch);
          setShowCommandPalette(false);
        },
      },
      ...defaultCommands,
    ];
  };

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    const options = getCommandPaletteOptions();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPaletteSelectedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPaletteSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[paletteSelectedIndex]) {
        options[paletteSelectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowCommandPalette(false);
    }
  };

  const triggerAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      await saveNote();
      setAutoSaveStatus('saved');
    } catch (e) {
      setAutoSaveStatus('offline');
    }
  };

  // Debounced auto save effect
  useEffect(() => {
    if (!selectedNote) return;

    const currentTags = selectedNote.tags.map(t => t.name).join(", ");
    const isSame =
      editTitle === selectedNote.title &&
      editContent === selectedNote.content &&
      editFolderId === (selectedNote.folderId || "") &&
      editTagsString === currentTags &&
      editColor === (selectedNote.color || "");

    if (isSame) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      triggerAutoSave();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editTitle, editContent, editFolderId, editTagsString, editColor]);

  // Basic client side markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return "<p class='text-gray-500 italic'>Note content is empty...</p>";
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

    // Code blocks
    html = html.replace(/```(?:js|javascript|html|css)?\n([\s\S]*?)\n```/gim, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Checkboxes
    html = html.replace(/^- \[(x| )\] (.*$)/gim, (_, checked, label) => {
      const isChecked = checked.toLowerCase() === 'x';
      return `<div class='flex items-center gap-2 my-1'><input type='checkbox' disabled ${isChecked ? 'checked' : ''} class='accent-green-500'/> <span>${label}</span></div>`;
    });

    // Bullets
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Bold/Italics
    html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');

    // Images: ![alt](url)
    html = html.replace(/!\[([^\]]*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full my-2 border border-[var(--border-color)]" />');

    // Links: [text](url)
    html = html.replace(/(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent-color)] underline">$1</a>');

    // Paragraphs
    html = html.replace(/^(?!<h|<li|<ul|<pre|<div|<img|<a)(.*$)/gim, '<p>$1</p>');

    return html;
  };

  // --- BOOT SCREEN COMPONENT ---
  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-[#071407] text-[#33ff33] font-mono p-8 z-50 overflow-y-auto select-none crt-effect">
        <div className="max-w-3xl mx-auto space-y-2 text-glow">
          <div className="border border-[#1b4d1b] p-4 mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">RETRO-BIOS v4.10</h1>
              <p className="text-xs">CRTC: AMD 4016 CONTROLLER (MONOCHROME CAPABLE)</p>
              <p className="text-xs">SYSTEM ROM DATED 07/17/1983</p>
            </div>
            <button
              onClick={() => {
                playToggleBeep();
                setIsBooting(false);
              }}
              className="retro-button px-3 py-1.5 text-xs uppercase font-bold border-red-700 text-red-500 hover:bg-red-950/40"
            >
              [ESC] SKIP BOOT
            </button>
          </div>
          <div className="space-y-1 font-mono">
            {bootLines.map((line, idx) => (
              <p key={idx} className="leading-5 min-h-[1.25rem] whitespace-pre">{line}</p>
            ))}
          </div>
          <div className="inline-block w-3 h-5 bg-[#33ff33] animate-pulse mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="crt-container min-h-screen flex flex-col">
      {/* Top Banner (Offline Warning / Floppy Saving Indicator) */}
      {(isOffline || isSaving || isSyncing) && (
        <div className="bg-yellow-950/80 border-b-2 border-yellow-700/80 px-4 py-1.5 flex justify-between items-center text-xs font-mono select-none z-40 text-yellow-300">
          <span className="flex items-center gap-2">
            {isOffline && <span>⚠️ LOCAL OFFLINE MODE (USING LOCAL CACHE)</span>}
            {!isOffline && isSyncing && <span>🔄 CLOUD SYNCHRONIZING SECURE TUNNEL...</span>}
            {!isOffline && !isSyncing && <span>✅ STABLE CLOUD CONNECTION</span>}
          </span>
          <span className="flex items-center gap-3">
            {isSaving && (
              <span className="flex items-center gap-1.5 font-bold animate-pulse text-red-500">
                💾 {saveMessage}
              </span>
            )}
            {isSyncing && (
              <span className="flex items-center gap-1 text-[11px] tracking-wide">
                📼 SPINNING SYNC TAPE...
              </span>
            )}
          </span>
        </div>
      )}

      {/* Main CRT Screen Layout */}
      <div className="crt-flicker flex-1 flex flex-col">
        {/* Navigation Bar */}
        <header className="retro-border border-t-0 border-x-0 bg-[var(--panel-bg)] py-3 px-6 flex flex-col md:flex-row gap-4 justify-between items-center z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 retro-border flex items-center justify-center bg-[var(--bg-color)] text-xl font-bold rounded-none">
              📟
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-glow">
                RetroNotes.OS
              </h1>
              <p className="text-[10px] text-gray-500 font-sans tracking-wide">
                Logged in as: {user.name} ({user.email})
              </p>
            </div>
          </div>

          {/* Global Search and Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes... (?Ask AI)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAiSearch()}
                className="px-3 py-1.5 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] w-56 font-mono"
              />
              {searchQuery.startsWith("?") && (
                <button
                  onClick={runAiSearch}
                  className="absolute right-2 top-1.5 text-[9px] px-1 bg-[var(--border-color)] text-white hover:bg-[var(--accent-color)] hover:text-black uppercase"
                >
                  Ask AI
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveView(activeView === 'editor' ? 'dashboard' : 'editor')}
              className="retro-button px-4 py-1.5 text-xs font-mono uppercase"
            >
              {activeView === 'editor' ? '📊 STATS' : '📝 NOTES'}
            </button>

            {/* Quick Theme Switcher */}
            <button
              onClick={cycleTheme}
              className="retro-button px-3 py-1.5 text-xs font-mono uppercase flex items-center gap-1.5"
              title="Cycle display theme"
            >
              🎨 Theme: {theme === 'green' ? '🟢 CRT Green' : theme === 'amber' ? '🟠 Amber' : theme === 'cyberpunk' ? '🔵 Neon' : theme === 'slate' ? '⚫ Dark' : theme === 'light' ? '⚪ Light' : `🎨 ${theme.toUpperCase()}`}
            </button>

            {/* Toggle CRT overlay */}
            <button
              onClick={toggleCrt}
              className={`retro-button px-2 py-1 text-[10px] font-mono ${
                crtEnabled ? 'bg-[var(--border-color)] text-[var(--bg-color)]' : ''
              }`}
              title="Toggle scanline monitor curvature effect"
            >
              CRT SCREEN: {crtEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Toggle Audio */}
            <button
              onClick={() => {
                const nextSound = !soundOn;
                setSoundOn(nextSound);
                setSoundEnabled(nextSound);
                playToggleBeep();
              }}
              className={`retro-button px-2 py-1 text-[10px] font-mono ${
                soundOn ? 'bg-[var(--border-color)] text-[var(--bg-color)]' : ''
              }`}
              title="Toggle retro interface typing and save sound effects"
            >
              AUDIO: {soundOn ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowShortcutHelp(true)}
              className="retro-button px-2 py-1 text-[10px]"
              title="Shortcut Help Panel"
            >
              ⌨️ HELP
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/api/auth/signout";
              }}
            >
              <button
                type="submit"
                className="retro-button border-red-900 text-red-500 px-3 py-1.5 text-xs uppercase"
              >
                LOGOUT
              </button>
            </form>
          </div>
        </header>

        {/* Mini Dashboard Stats Ribbon */}
        {stats && (
          <div className="bg-[var(--panel-bg)]/80 border-b border-[var(--border-color)]/30 px-6 py-2 flex flex-wrap gap-6 text-[10px] font-mono select-none z-10 text-glow">
            <span className="flex items-center gap-1.5">📚 Total Notes: <strong className="text-[var(--accent-color)]">{stats.totalNotes}</strong></span>
            <span className="flex items-center gap-1.5">⭐ Favorites: <strong className="text-yellow-500">{stats.favoriteCount}</strong></span>
            <span className="flex items-center gap-1.5">📌 Pinned: <strong className="text-glow">{stats.pinnedCount}</strong></span>
            <span className="flex items-center gap-1.5">🗑 Trash: <strong className="text-red-500">{stats.trashedCount}</strong></span>
          </div>
        )}

        {/* Dashboard Statistics Mode */}
        {activeView === 'dashboard' ? (
          <main className="flex-1 p-6 max-w-6xl mx-auto w-full select-none">
            <div className="retro-border bg-[var(--panel-bg)] p-6 mb-6">
              <h2 className="text-3xl font-bold mb-6 text-center text-glow uppercase border-b-2 border-[var(--border-color)] pb-3">
                🎛️ SYSTEM CONTROLS & DIAGNOSTICS
              </h2>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Grid Box: Totals */}
                  <div className="retro-border border-dashed p-4 flex flex-col items-center justify-center text-center bg-[var(--bg-color)]">
                    <span className="text-4xl font-bold text-glow">{stats.totalNotes}</span>
                    <span className="text-[11px] text-gray-500 mt-2 uppercase font-bold">Total Notes</span>
                  </div>
                  
                  {/* Grid Box: Pinned */}
                  <div className="retro-border border-dashed p-4 flex flex-col items-center justify-center text-center bg-[var(--bg-color)]">
                    <span className="text-4xl font-bold text-yellow-500">{stats.pinnedCount}</span>
                    <span className="text-[11px] text-gray-500 mt-2 uppercase font-bold">Pinned Notes</span>
                  </div>

                  {/* Grid Box: Folders */}
                  <div className="retro-border border-dashed p-4 flex flex-col items-center justify-center text-center bg-[var(--bg-color)]">
                    <span className="text-4xl font-bold text-blue-400">{stats.foldersCount}</span>
                    <span className="text-[11px] text-gray-500 mt-2 uppercase font-bold">Directories</span>
                  </div>

                  {/* Grid Box: Words count */}
                  <div className="retro-border border-dashed p-4 flex flex-col items-center justify-center text-center bg-[var(--bg-color)]">
                    <span className="text-4xl font-bold text-glow">{stats.totalWordCount}</span>
                    <span className="text-[11px] text-gray-500 mt-2 uppercase font-bold">Word Count</span>
                  </div>

                  {/* Folder detailed stats */}
                  <div className="col-span-1 md:col-span-4 mt-4">
                    <h3 className="text-lg font-bold border-b border-[var(--border-color)] pb-2 mb-3 uppercase text-glow">
                      📁 DIRECTORY MATRIX
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[var(--border-color)] text-gray-500">
                            <th className="py-2">DIRECTORY NAME</th>
                            <th className="py-2 text-right">NOTE COUNTER</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.folderStats.map((fs) => (
                            <tr key={fs.folderId} className="border-b border-[var(--border-color)]/30">
                              <td className="py-2 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: fs.color || 'gray' }}></span>
                                {fs.folderName}
                              </td>
                              <td className="py-2 text-right font-bold text-glow">{fs.noteCount}</td>
                            </tr>
                          ))}
                          {stats.folderStats.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-4 text-center text-gray-500 italic">No directories defined.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-10 animate-pulse text-xs">CALCULATING DIAGNOSTICS...</p>
              )}
            </div>
            <div className="text-center">
              <button
                onClick={() => setActiveView('editor')}
                className="retro-button px-6 py-2 uppercase text-sm font-bold"
              >
                ◀ Back to Notes System
              </button>
            </div>
          </main>
        ) : (
          /* Main Note taking View */
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden max-h-[calc(100vh-68px)]">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 retro-border border-t-0 border-l-0 bg-[var(--panel-bg)] flex flex-col select-none max-h-full">
              {/* Quick Action: New Note */}
              <div className="p-4 border-b-2 border-[var(--border-color)]">
                <button
                  onClick={createNewNote}
                  className="retro-button w-full py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[var(--accent-color)] hover:text-black transition-colors"
                >
                  📝 WRITE NEW NOTE
                </button>
              </div>

              {/* Status Filters */}
              <div className="p-3 border-b border-[var(--border-color)] text-xs">
                <p className="text-gray-500 uppercase font-bold mb-2 tracking-widest text-[10px]">Filter Status</p>
                <div className="space-y-1">
                  {[
                    { key: 'all', label: '📖 All Notes', count: notes.filter(n => !n.isTrashed && !n.isArchived).length },
                    { key: 'pinned', label: '📌 Pinned Notes', count: notes.filter(n => n.isPinned && !n.isTrashed && !n.isArchived).length },
                    { key: 'favorite', label: '⭐ Favorites', count: notes.filter(n => n.isFavorite && !n.isTrashed && !n.isArchived).length },
                    { key: 'archived', label: '📦 Archive', count: notes.filter(n => n.isArchived && !n.isTrashed).length },
                    { key: 'trashed', label: '🗑️ Trash Can', count: notes.filter(n => n.isTrashed).length }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setActiveStatus(filter.key);
                        setSelectedFolderId(null);
                        setSelectedTag(null);
                      }}
                      className={`w-full text-left px-2.5 py-1 text-xs hover:bg-[var(--bg-color)] flex justify-between items-center transition-colors ${
                        activeStatus === filter.key && !selectedFolderId && !selectedTag
                          ? 'border border-[var(--border-color)] bg-[var(--bg-color)] font-bold text-glow'
                          : ''
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="text-[10px] text-gray-500">[{filter.count}]</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Folders Navigation */}
              <div className="p-3 border-b border-[var(--border-color)] max-h-[150px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px]">Folders</p>
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="text-glow hover:text-[var(--accent-color)] text-xs"
                    title="Add folder"
                  >
                    [+]
                  </button>
                </div>
                <div className="space-y-1">
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFolderId(f.id);
                        setSelectedTag(null);
                        setActiveStatus("all");
                      }}
                      className={`w-full text-left px-2.5 py-1 text-xs hover:bg-[var(--bg-color)] flex items-center gap-2 truncate ${
                        selectedFolderId === f.id
                          ? 'border border-[var(--border-color)] bg-[var(--bg-color)] font-bold text-glow'
                          : ''
                      }`}
                    >
                      <span className="w-2 h-2 shrink-0" style={{ backgroundColor: f.color || 'gray' }}></span>
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                  {folders.length === 0 && (
                    <p className="text-[10px] text-gray-500 italic p-1">No folders created.</p>
                  )}
                </div>
              </div>

              {/* Tags Filter list */}
              <div className="p-3 max-h-[130px] overflow-y-auto border-b border-[var(--border-color)]">
                <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTag(selectedTag === t.name ? null : t.name);
                        setSelectedFolderId(null);
                        setActiveStatus("all");
                      }}
                      className={`px-1.5 py-0.5 text-[10px] border border-[var(--border-color)]/50 hover:border-[var(--accent-color)] ${
                        selectedTag === t.name ? 'bg-[var(--border-color)] text-black font-bold' : ''
                      }`}
                    >
                      #{t.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-[10px] text-gray-500 italic">No tags registered.</p>
                  )}
                </div>
              </div>

              {/* Lofi Cassette Deck Widget */}
              <div className="p-3 mt-auto">
                <CassettePlayer />
              </div>
            </aside>

            {/* Notes List Column */}
            <section className="w-full md:w-80 retro-border border-t-0 border-l-0 flex flex-col bg-[var(--bg-color)] max-h-full overflow-hidden">
              <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center text-xs bg-[var(--panel-bg)] select-none">
                <span className="font-bold text-glow text-[11px] uppercase">
                  Notes ({notes.length})
                </span>
                
                {/* Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="text-gray-400 hover:text-white"
                  title="Toggle sort direction"
                >
                  SORT: {sortOrder === 'newest' ? 'NEW ▽' : 'OLD △'}
                </button>
              </div>

              {/* Note tiles list */}
              <div className="flex-1 overflow-y-auto">
                {getGroupedNotes(notes).map((group) => (
                  <div key={group.title} className="border-b border-[var(--border-color)]/20 last:border-b-0">
                    <div className="bg-[var(--panel-bg)]/85 text-[9px] uppercase font-bold tracking-wider px-4 py-1.5 text-gray-500 border-b border-[var(--border-color)]/10 select-none">
                      {group.title}
                    </div>
                    <div className="divide-y divide-[var(--border-color)]/20">
                      {group.notes.map((note) => {
                        const isSelected = selectedNote?.id === note.id;
                        const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length;
                        return (
                          <article
                            key={note.id}
                            onClick={() => selectNote(note)}
                            className={`p-4 cursor-pointer hover:bg-[var(--panel-bg)]/50 transition-colors ${
                              isSelected ? 'bg-[var(--panel-bg)] border-l-4 border-l-[var(--accent-color)]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <h3 className={`text-sm font-bold truncate flex-1 text-glow ${isSelected ? 'text-[var(--accent-color)]' : ''}`}>
                                {note.color && <span className="mr-1.5 select-none" style={{ color: note.color }}>●</span>}
                                {note.isPinned && "📌 "}{note.isFavorite && "⭐ "}{note.title}
                              </h3>
                              {note.folder && (
                                <span
                                  className="text-[9px] px-1 py-0.5 border text-black font-bold uppercase"
                                  style={{ backgroundColor: note.folder.color || 'gray', borderColor: note.folder.color || 'gray' }}
                                >
                                  {note.folder.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-4 mb-2">
                              {note.content.replace(/[#*`]/g, '') || 'Empty note content...'}
                            </p>
                            <div className="flex justify-between items-center text-[10px] text-gray-600 font-sans">
                              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                              <span>{wordCount} words</span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-500 italic select-none">
                    NO COMPATIBLE NOTES MATCHING.
                  </div>
                )}
              </div>

              {/* Trash Actions */}
              {activeStatus === 'trashed' && notes.length > 0 && (
                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--panel-bg)] select-none">
                  <button
                    onClick={emptyTrash}
                    className="retro-button border-red-900 text-red-500 w-full py-1 text-xs"
                  >
                    🗑️ EMPTY TRASH CAN
                  </button>
                </div>
              )}
            </section>

            {/* Note Editor Area */}
            <section className="flex-1 flex flex-col max-h-full overflow-hidden relative">
              {selectedNote ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Windows 95 Title Bar */}
                  <div className="win95-window-title select-none">
                    <span className="flex items-center gap-1.5 font-bold font-sans">
                      📝 {selectedNote.id === "new-note-temp" ? "notepad.exe - Untitled" : `notepad.exe - ${selectedNote.title || "Untitled"}`}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black text-[9px] font-sans hover:bg-gray-100" style={{ boxShadow: "inset 1px 1px 0px #fff, inset -1px -1px 0px #808080" }}>?</button>
                      <button className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black text-[9px] font-sans hover:bg-gray-100" style={{ boxShadow: "inset 1px 1px 0px #fff, inset -1px -1px 0px #808080" }}>_</button>
                      <button onClick={() => setSelectedNote(null)} className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black text-[9px] font-sans font-bold hover:bg-gray-100" style={{ boxShadow: "inset 1px 1px 0px #fff, inset -1px -1px 0px #808080" }}>X</button>
                    </div>
                  </div>
                  
                  {/* Editor Header Bar (Toolbar) */}
                  <div className="p-3 border-b-2 border-[var(--border-color)] bg-[var(--panel-bg)] flex justify-between items-center select-none z-10 flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Folder Dropdown Selector */}
                      <select
                        value={editFolderId}
                        onChange={(e) => setEditFolderId(e.target.value)}
                        className="px-2 py-1 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)]"
                      >
                        <option value="">No folder</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      
                      {/* Tags Input */}
                      <input
                        type="text"
                        placeholder="Tags (comma-separated)..."
                        value={editTagsString}
                        onChange={(e) => setEditTagsString(e.target.value)}
                        className="px-2 py-1 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] w-44"
                      />

                      {/* Note Colors Picker */}
                      <div className="flex items-center gap-1 border-2 border-[var(--border-color)] px-1.5 py-0.5 bg-[var(--bg-color)]">
                        <span className="text-[9px] uppercase font-bold text-gray-500 mr-1 select-none">Color:</span>
                        {[
                          { name: 'Yellow', value: '#fef08a' },
                          { name: 'Green', value: '#bbf7d0' },
                          { name: 'Blue', value: '#bfdbfe' },
                          { name: 'Red', value: '#fecaca' },
                          { name: 'Purple', value: '#e9d5ff' },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setEditColor(editColor === c.value ? "" : c.value)}
                            className={`w-3 h-3 rounded-none border border-black cursor-pointer ${
                              editColor === c.value ? 'outline-2 outline-[var(--accent-color)]' : ''
                            }`}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          />
                        ))}
                        {editColor && (
                          <button
                            type="button"
                            onClick={() => setEditColor("")}
                            className="text-[9px] text-red-500 ml-1 font-bold font-mono"
                            title="Reset color"
                          >
                            [X]
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-2">
                      {/* Study mode flashcard generator */}
                      {editContent && (
                        <button
                          onClick={() => callAiAction('flashcards')}
                          className="retro-button px-2.5 py-1 text-[10px]"
                          title="Generate study flashcards"
                        >
                          📖 STUDY CARDS
                        </button>
                      )}

                      {/* One-click Export Buttons */}
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-500 uppercase select-none mr-0.5">Export:</span>
                        <button type="button" onClick={() => exportNote("txt")} className="retro-button px-1.5 py-0.5 text-[9px] font-mono" title="Export as TXT file">TXT</button>
                        <button type="button" onClick={() => exportNote("md")} className="retro-button px-1.5 py-0.5 text-[9px] font-mono" title="Export as MD file">MD</button>
                        <button type="button" onClick={() => exportNote("pdf")} className="retro-button px-1.5 py-0.5 text-[9px] font-mono" title="Print note to PDF">PDF</button>
                      </div>

                      {/* Toggles */}
                      <button
                        onClick={() => toggleProperty('isPinned')}
                        className={`retro-button px-2.5 py-1 text-[10px] ${selectedNote.isPinned ? 'bg-[var(--accent-color)] text-black' : ''}`}
                        title="Pin note"
                      >
                        📌 PIN
                      </button>
                      <button
                        onClick={() => toggleProperty('isFavorite')}
                        className={`retro-button px-2.5 py-1 text-[10px] ${selectedNote.isFavorite ? 'bg-[var(--accent-color)] text-black' : ''}`}
                        title="Add to Favorites"
                      >
                        ⭐ FAV
                      </button>
                      <button
                        onClick={() => toggleProperty('isArchived')}
                        className={`retro-button px-2.5 py-1 text-[10px] ${selectedNote.isArchived ? 'bg-[var(--accent-color)] text-black' : ''}`}
                        title="Archive note"
                      >
                        📦 ARCHIVE
                      </button>

                      {/* Trash Note */}
                      <button
                        onClick={() => {
                          if (selectedNote.isTrashed) {
                            if (window.confirm("PERMANENTLY DELETE THIS NOTE?")) {
                              deletePermanently(selectedNote.id);
                            }
                          } else {
                            toggleProperty('isTrashed');
                          }
                        }}
                        className="retro-button border-red-900 text-red-500 px-2.5 py-1 text-[10px]"
                        title={selectedNote.isTrashed ? 'Delete Note Permanently' : 'Move to Trash'}
                      >
                        {selectedNote.isTrashed ? '❌ HARD DELETE' : '🗑️ TRASH'}
                      </button>

                      {selectedNote.isTrashed && (
                        <button
                          onClick={() => toggleProperty('isTrashed')}
                          className="retro-button border-green-900 text-green-500 px-2.5 py-1 text-[10px]"
                        >
                          RESTORE Note
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dual Pane Markdown Editor + Preview */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Pane: Raw Edit */}
                    <div className="flex-1 flex flex-col p-4 border-r border-[var(--border-color)]/30 overflow-hidden">
                      {/* Markdown Toolbar */}
                      <div className="flex flex-wrap gap-1 mb-2 border-b border-[var(--border-color)]/20 pb-1 select-none">
                        <button type="button" onClick={() => insertMarkdown("bold")} className="retro-button px-2 py-0.5 text-[9px] font-bold font-mono" title="Insert Bold text">B</button>
                        <button type="button" onClick={() => insertMarkdown("italic")} className="retro-button px-2 py-0.5 text-[9px] italic font-mono" title="Insert Italic text">I</button>
                        <button type="button" onClick={() => insertMarkdown("h1")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert Heading 1">H1</button>
                        <button type="button" onClick={() => insertMarkdown("h2")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert Heading 2">H2</button>
                        <button type="button" onClick={() => insertMarkdown("code")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert Code block">&lt;&gt;</button>
                        <button type="button" onClick={() => insertMarkdown("link")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert Link syntax">Link</button>
                        <button type="button" onClick={() => insertMarkdown("image")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert Image syntax">Image</button>
                        <button type="button" onClick={() => insertMarkdown("list")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert List bullet">List</button>
                        <button type="button" onClick={() => insertMarkdown("quote")} className="retro-button px-2 py-0.5 text-[9px] font-mono" title="Insert block Quote">Quote</button>
                      </div>

                      <input
                        type="text"
                        placeholder="Note Title"
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value);
                          playKeyClick();
                        }}
                        className="w-full bg-transparent border-b-2 border-[var(--border-color)]/40 text-xl font-bold py-2 mb-4 text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] text-glow font-mono"
                      />
                      <textarea
                        ref={textareaRef}
                        onDrop={handleDropImage}
                        onDragOver={handleDragOverImage}
                        placeholder="Type note content in Markdown format... Drag & Drop images here... Use Ctrl+S to save."
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          const val = e.target.value;
                          const lastChar = val[val.length - 1];
                          if (lastChar === " " || lastChar === "\n") {
                            playSpacebar();
                          } else {
                            playKeyClick();
                          }
                        }}
                        className="w-full flex-1 bg-transparent border-0 resize-none text-xs text-[var(--fg-color)] focus:outline-none focus:ring-0 font-mono leading-relaxed overflow-y-auto"
                      />
                    </div>

                    {/* Right Pane: Markdown Parsed HTML rendering */}
                    <div className="flex-1 bg-[var(--panel-bg)]/20 p-6 overflow-y-auto max-h-full border-t lg:border-t-0 border-[var(--border-color)]/30">
                      <div className="max-w-2xl">
                        <div className="border-b border-[var(--border-color)]/30 pb-3 mb-4 select-none">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            📖 LIVE CRT PREVIEW
                          </p>
                        </div>
                        <h1 className="text-3xl font-bold text-glow mb-4 font-mono select-text">
                          {editTitle || "Untitled Note"}
                        </h1>
                        <div
                          className="markdown-preview text-xs select-text leading-relaxed font-mono"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Note Footer bar */}
                  <footer className="p-3 border-t border-[var(--border-color)]/40 bg-[var(--panel-bg)]/40 flex justify-between items-center text-[9px] font-sans text-gray-500 select-none flex-wrap gap-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                      <span>Words: {editContent.trim().split(/\s+/).filter(Boolean).length}</span>
                      <span>Characters: {editContent.length}</span>
                      <span>Paragraphs: {editContent.split(/\n\s*\n/).filter(line => line.trim().length > 0).length}</span>
                      <span className="text-[var(--border-color)]">|</span>
                      <span>📝 {editContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <span>⏱ {Math.ceil(editContent.trim().split(/\s+/).filter(Boolean).length / 200)} min read</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* AI Toolbar Drawer options */}
                      {editContent && (
                        <div className="flex items-center gap-2">
                          <span className="uppercase text-[9px] font-bold text-gray-600">AI ASSIST:</span>
                          <button onClick={() => callAiAction('summarize')} className="hover:text-white border border-[var(--border-color)] px-1">[SUMMARIZE]</button>
                          <button onClick={() => callAiAction('grammar')} className="hover:text-white border border-[var(--border-color)] px-1">[FIX GRAMMAR]</button>
                          <button onClick={() => callAiAction('title')} className="hover:text-white border border-[var(--border-color)] px-1">[AUTO TITLE]</button>
                          <button onClick={() => callAiAction('tags')} className="hover:text-white border border-[var(--border-color)] px-1">[SUGGEST TAGS]</button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {/* Auto save indicator */}
                        <div className="flex items-center gap-1.5 font-mono text-[9px] select-none">
                          {autoSaveStatus === 'saving' && (
                            <span className="flex items-center gap-1 font-bold text-red-500 animate-pulse">
                              ● Saving...
                            </span>
                          )}
                          {autoSaveStatus === 'saved' && (
                            <span className="flex items-center gap-1 font-bold text-green-500">
                              ✓ Saved just now
                            </span>
                          )}
                          {autoSaveStatus === 'offline' && (
                            <span className="flex items-center gap-1 font-bold text-yellow-500 animate-pulse">
                              ⚠ Offline
                            </span>
                          )}
                          {autoSaveStatus === 'idle' && (
                            <span className="text-gray-600">
                              ● Auto-save active
                            </span>
                          )}
                        </div>

                        <button
                          onClick={saveNote}
                          className="retro-button px-3 py-1 text-[9px] font-bold font-mono"
                        >
                          💾 SAVE (Ctrl+S)
                        </button>
                      </div>
                    </div>
                  </footer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                  <span className="text-6xl mb-4 text-glow animate-pulse">📼</span>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-glow mb-2">
                    {notes.length === 0 ? "No notes yet" : "No note selected"}
                  </h2>
                  <p className="text-xs text-gray-500 max-w-sm font-sans mb-6">
                    {notes.length === 0 ? "Start recording your ideas..." : "Select a note from the column to the left, or write a new one to begin editing."}
                  </p>
                  <button
                    onClick={createNewNote}
                    className="retro-button px-6 py-2.5 uppercase text-xs font-bold border-4"
                  >
                    [ + Create Note ]
                  </button>
                </div>
              )}

              {/* Floating AI Terminal Drawer */}
              <div
                className={`absolute top-0 right-0 h-full w-96 retro-border border-y-0 border-r-0 bg-[var(--panel-bg)] shadow-2xl transition-transform duration-300 z-20 flex flex-col ${
                  aiOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                {/* AI Panel Header */}
                <div className="p-3 border-b-2 border-[var(--border-color)] bg-[var(--bg-color)] flex justify-between items-center select-none text-xs">
                  <span className="font-bold text-glow text-[11px] uppercase tracking-wider">
                    📟 AI TERMINAL INTERFACE
                  </span>
                  <button
                    onClick={() => setAiOpen(false)}
                    className="text-gray-400 hover:text-white text-xs border border-[var(--border-color)] px-1.5"
                  >
                    [ESC] CLOSE
                  </button>
                </div>

                {/* Study Cards Mode Panel (If generated) */}
                {flashcards.length > 0 && (
                  <div className="bg-[var(--bg-color)] p-4 border-b border-[var(--border-color)] text-xs select-none">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-yellow-500 uppercase tracking-widest text-[9px]">
                        Study Flashcards
                      </span>
                      <span>
                        Card {currentFlashcardIdx + 1} of {flashcards.length}
                      </span>
                    </div>

                    <div className="retro-border border-dashed p-4 text-center my-3 min-h-[100px] flex flex-col items-center justify-center bg-[var(--panel-bg)]">
                      <p className="font-bold mb-2">
                        {showFlashcardAnswer ? "A: " + flashcards[currentFlashcardIdx].answer : "Q: " + flashcards[currentFlashcardIdx].question}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <button
                        onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                        className="retro-button px-3 py-1 text-[10px] flex-1"
                      >
                        {showFlashcardAnswer ? "Show Question" : "Reveal Answer"}
                      </button>
                      <button
                        onClick={() => {
                          setShowFlashcardAnswer(false);
                          setCurrentFlashcardIdx((currentFlashcardIdx + 1) % flashcards.length);
                        }}
                        className="retro-button px-3 py-1 text-[10px] flex-1"
                      >
                        Next Card ▶
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Chat Console Outputs */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs select-text font-mono">
                  {aiChat.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 border ${
                        msg.role === 'user'
                          ? 'border-[var(--border-color)]/40 bg-[var(--bg-color)]/60 text-right ml-6'
                          : 'border-green-800 bg-[var(--bg-color)]/20 mr-6'
                      }`}
                    >
                      <p className="text-[9px] text-gray-500 uppercase mb-1 font-bold">
                        {msg.role === 'user' ? 'USER QUERY' : 'AI RESPONSE'}
                      </p>
                      <div
                        className="markdown-preview leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-3 border border-green-800 bg-[var(--bg-color)]/20 mr-6 animate-pulse">
                      <p className="text-[9px] text-gray-500 uppercase mb-1 font-bold">AI TERMINAL</p>
                      <p className="text-glow italic">processing request sector...</p>
                    </div>
                  )}
                </div>

                {/* AI Chat Input Form */}
                <form
                  onSubmit={submitAiChat}
                  className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-color)] flex gap-2 select-none"
                >
                  <input
                    type="text"
                    placeholder="Ask AI about notes..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    disabled={aiLoading}
                    className="flex-1 px-2.5 py-1.5 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="retro-button px-4 py-1.5 text-xs uppercase"
                  >
                    SEND
                  </button>
                </form>
              </div>

              {/* Toggle AI Sidebar button */}
              {!aiOpen && selectedNote && (
                <button
                  onClick={() => setAiOpen(true)}
                  className="absolute right-4 bottom-4 retro-border bg-[var(--panel-bg)] hover:bg-[var(--accent-color)] hover:text-black py-2.5 px-4 text-xs font-bold text-glow z-10 animate-bounce uppercase shadow-2xl cursor-pointer select-none"
                >
                  📟 Ask AI Assistant
                </button>
              )}
            </section>
          </main>
        )}
      </div>

      {/* MODAL: Keyboard Shortcuts Help Panel */}
      {showShortcutHelp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none">
          <div className="retro-border bg-[var(--panel-bg)] max-w-md w-full p-6 text-xs text-[var(--fg-color)]">
            <h2 className="text-xl font-bold uppercase text-glow mb-4 border-b border-[var(--border-color)] pb-2">
              ⌨️ KEYBOARD SHORTCUT REGISTRY
            </h2>
            <div className="space-y-3 font-mono leading-relaxed mb-6">
              <div className="flex justify-between">
                <span>NEW Note:</span>
                <span className="text-glow font-bold">Ctrl + N</span>
              </div>
              <div className="flex justify-between">
                <span>SAVE Note:</span>
                <span className="text-glow font-bold">Ctrl + S</span>
              </div>
              <div className="flex justify-between">
                <span>SEARCH / PALETTE:</span>
                <span className="text-glow font-bold">Ctrl + K</span>
              </div>
              <div className="flex justify-between">
                <span>DUPLICATE Note:</span>
                <span className="text-glow font-bold">Ctrl + D</span>
              </div>
              <div className="flex justify-between">
                <span>MOVE TO TRASH:</span>
                <span className="text-glow font-bold">Delete</span>
              </div>
              <div className="flex justify-between">
                <span>PIN / UNPIN Note:</span>
                <span className="text-glow font-bold">Ctrl + P</span>
              </div>
              <div className="flex justify-between">
                <span>CLOSE MODAL / ASSISTANT:</span>
                <span className="text-glow font-bold">Escape</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-color)]/30 pt-2 text-[10px] text-gray-500">
                <span>AI Search Trigger:</span>
                <span>Type "?" prefix in search</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutHelp(false)}
              className="retro-button w-full py-2 uppercase font-bold"
            >
              Close Registry [ESC]
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Create Folder Panel */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none">
          <form
            onSubmit={handleCreateFolder}
            className="retro-border bg-[var(--panel-bg)] max-w-sm w-full p-6 text-xs text-[var(--fg-color)]"
          >
            <h2 className="text-xl font-bold uppercase text-glow mb-4 border-b border-[var(--border-color)] pb-2">
              📁 CREATE NEW DIRECTORY
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-500 uppercase font-bold mb-1.5 text-[10px]">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📁 Work, 📁 Study"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-500 uppercase font-bold mb-1.5 text-[10px]">
                  Accent Tag Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="w-8 h-8 bg-transparent cursor-pointer border-0"
                  />
                  <span className="font-mono text-gray-400">{newFolderColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="retro-button flex-1 py-2 uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="retro-button flex-1 py-2 uppercase font-bold bg-[var(--border-color)] text-black"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Command Palette (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center p-4 pt-[15vh] z-[999] select-none">
          <div 
            className="retro-border bg-[var(--panel-bg)] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Windows 95 title or Command header */}
            <div className="win95-window-title flex justify-between items-center select-none text-[10px] uppercase font-bold py-1 px-3">
              <span>📟 Command Palette Console v1.0</span>
              <button 
                onClick={() => setShowCommandPalette(false)}
                className="text-[9px] border px-1 bg-[#c0c0c0] text-black hover:bg-red-500 hover:text-white"
              >
                [X]
              </button>
            </div>
            
            {/* Input field */}
            <div className="p-3 border-b border-[var(--border-color)]/30">
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search notes..."
                value={paletteSearch}
                onChange={(e) => {
                  setPaletteSearch(e.target.value);
                  setPaletteSelectedIndex(0);
                }}
                className="w-full px-3 py-2 bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-color)] font-mono text-glow"
              />
            </div>
            
            {/* Command / Search Results List */}
            <div className="max-h-[300px] overflow-y-auto divide-y divide-[var(--border-color)]/10 font-mono text-xs">
              {getCommandPaletteOptions().map((opt, idx) => {
                const isSelected = idx === paletteSelectedIndex;
                return (
                  <div
                    key={opt.id}
                    onClick={() => opt.action()}
                    className={`px-4 py-2.5 cursor-pointer flex justify-between items-center transition-colors ${
                      isSelected ? 'bg-[var(--accent-color)] text-black font-bold' : 'hover:bg-[var(--bg-color)]/50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <span className="text-[9px] uppercase font-bold px-1 bg-black text-[var(--accent-color)]">[Enter]</span>}
                  </div>
                );
              })}
              {getCommandPaletteOptions().length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 italic">
                  No commands or notes found matching &quot;{paletteSearch}&quot;
                </div>
              )}
            </div>
            
            {/* Help / Shortcut hint footer */}
            <div className="bg-[var(--bg-color)] px-4 py-2 border-t border-[var(--border-color)]/30 flex justify-between text-[9px] text-gray-500 select-none">
              <span>↑↓ to navigate</span>
              <span>ENTER to select</span>
              <span>ESC to exit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
