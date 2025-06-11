import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  setLogLevel,
} from 'firebase/firestore';
import {
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  FileText,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Download,
} from 'lucide-react';
// For PDF Generation (include these in your HTML or install via npm/yarn)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
import { jsPDF } from 'jspdf';

// --- Firebase Configuration ---

const firebaseConfig = {
  apiKey: 'AIzaSyBzU23GCwHSMRYF04gE2nppYXaMEVDYrp4',
  authDomain: 'bible-6138b.firebaseapp.com',
  projectId: 'bible-6138b',
  storageBucket: 'bible-6138b.firebasestorage.app',
  messagingSenderId: '866345547800',
  appId: '1:866345547800:web:6d1b34f1094b042e022b6d',
  measurementId: 'G-L8H4BPHTQG',
};
const appId = firebaseConfig.appId ||'nelbion-bible-tracker';
// --- Bible Data (remains the same) ---
const BIBLE_BOOKS_DATA = [
  // Old Testament
  { id: 'GEN', name: 'Genesis', chapters: 50, testament: 'Old' },
  { id: 'EXO', name: 'Exodus', chapters: 40, testament: 'Old' },
  { id: 'LEV', name: 'Leviticus', chapters: 27, testament: 'Old' },
  { id: 'NUM', name: 'Numbers', chapters: 36, testament: 'Old' },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34, testament: 'Old' },
  { id: 'JOS', name: 'Joshua', chapters: 24, testament: 'Old' },
  { id: 'JDG', name: 'Judges', chapters: 21, testament: 'Old' },
  { id: 'RUT', name: 'Ruth', chapters: 4, testament: 'Old' },
  { id: '1SA', name: '1 Samuel', chapters: 31, testament: 'Old' },
  { id: '2SA', name: '2 Samuel', chapters: 24, testament: 'Old' },
  { id: '1KI', name: '1 Kings', chapters: 22, testament: 'Old' },
  { id: '2KI', name: '2 Kings', chapters: 25, testament: 'Old' },
  { id: '1CH', name: '1 Chronicles', chapters: 29, testament: 'Old' },
  { id: '2CH', name: '2 Chronicles', chapters: 36, testament: 'Old' },
  { id: 'EZR', name: 'Ezra', chapters: 10, testament: 'Old' },
  { id: 'NEH', name: 'Nehemiah', chapters: 13, testament: 'Old' },
  { id: 'EST', name: 'Esther', chapters: 10, testament: 'Old' },
  { id: 'JOB', name: 'Job', chapters: 42, testament: 'Old' },
  { id: 'PSA', name: 'Psalms', chapters: 150, testament: 'Old' },
  { id: 'PRO', name: 'Proverbs', chapters: 31, testament: 'Old' },
  { id: 'ECC', name: 'Ecclesiastes', chapters: 12, testament: 'Old' },
  { id: 'SNG', name: 'Song of Solomon', chapters: 8, testament: 'Old' },
  { id: 'ISA', name: 'Isaiah', chapters: 66, testament: 'Old' },
  { id: 'JER', name: 'Jeremiah', chapters: 52, testament: 'Old' },
  { id: 'LAM', name: 'Lamentations', chapters: 5, testament: 'Old' },
  { id: 'EZK', name: 'Ezekiel', chapters: 48, testament: 'Old' },
  { id: 'DAN', name: 'Daniel', chapters: 12, testament: 'Old' },
  { id: 'HOS', name: 'Hosea', chapters: 14, testament: 'Old' },
  { id: 'JOL', name: 'Joel', chapters: 3, testament: 'Old' },
  { id: 'AMO', name: 'Amos', chapters: 9, testament: 'Old' },
  { id: 'OBA', name: 'Obadiah', chapters: 1, testament: 'Old' },
  { id: 'JON', name: 'Jonah', chapters: 4, testament: 'Old' },
  { id: 'MIC', name: 'Micah', chapters: 7, testament: 'Old' },
  { id: 'NAH', name: 'Nahum', chapters: 3, testament: 'Old' },
  { id: 'HAB', name: 'Habakkuk', chapters: 3, testament: 'Old' },
  { id: 'ZEP', name: 'Zephaniah', chapters: 3, testament: 'Old' },
  { id: 'HAG', name: 'Haggai', chapters: 2, testament: 'Old' },
  { id: 'ZEC', name: 'Zechariah', chapters: 14, testament: 'Old' },
  { id: 'MAL', name: 'Malachi', chapters: 4, testament: 'Old' },
  // New Testament
  { id: 'MAT', name: 'Matthew', chapters: 28, testament: 'New' },
  { id: 'MRK', name: 'Mark', chapters: 16, testament: 'New' },
  { id: 'LUK', name: 'Luke', chapters: 24, testament: 'New' },
  { id: 'JHN', name: 'John', chapters: 21, testament: 'New' },
  { id: 'ACT', name: 'Acts', chapters: 28, testament: 'New' },
  { id: 'ROM', name: 'Romans', chapters: 16, testament: 'New' },
  { id: '1CO', name: '1 Corinthians', chapters: 16, testament: 'New' },
  { id: '2CO', name: '2 Corinthians', chapters: 13, testament: 'New' },
  { id: 'GAL', name: 'Galatians', chapters: 6, testament: 'New' },
  { id: 'EPH', name: 'Ephesians', chapters: 6, testament: 'New' },
  { id: 'PHP', name: 'Philippians', chapters: 4, testament: 'New' },
  { id: 'COL', name: 'Colossians', chapters: 4, testament: 'New' },
  { id: '1TH', name: '1 Thessalonians', chapters: 5, testament: 'New' },
  { id: '2TH', name: '2 Thessalonians', chapters: 3, testament: 'New' },
  { id: '1TI', name: '1 Timothy', chapters: 6, testament: 'New' },
  { id: '2TI', name: '2 Timothy', chapters: 4, testament: 'New' },
  { id: 'TIT', name: 'Titus', chapters: 3, testament: 'New' },
  { id: 'PHM', name: 'Philemon', chapters: 1, testament: 'New' },
  { id: 'HEB', name: 'Hebrews', chapters: 13, testament: 'New' },
  { id: 'JAS', name: 'James', chapters: 5, testament: 'New' },
  { id: '1PE', name: '1 Peter', chapters: 5, testament: 'New' },
  { id: '2PE', name: '2 Peter', chapters: 3, testament: 'New' },
  { id: '1JN', name: '1 John', chapters: 5, testament: 'New' },
  { id: '2JN', name: '2 John', chapters: 1, testament: 'New' },
  { id: '3JN', name: '3 John', chapters: 1, testament: 'New' },
  { id: 'JUD', name: 'Jude', chapters: 1, testament: 'New' },
  { id: 'REV', name: 'Revelation', chapters: 22, testament: 'New' },
];
const TOTAL_BIBLE_CHAPTERS = BIBLE_BOOKS_DATA.reduce(
  (sum, book) => sum + book.chapters,
  0
);

// --- React Context for App State ---
const AppContext = createContext({});
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);
  const [auth, setAuth] = useState<ReturnType<typeof getAuth> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getAuth>['currentUser'] | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  // Initialize Firebase
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreInstance = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(firestoreInstance);
      setAuth(authInstance);
      setLogLevel('debug');
    } catch (e) {
      console.error('Error initializing Firebase:', e);
      setError('Failed to initialize Firebase.');
      setIsAuthLoading(false);
      setDataLoading(false);
    }
  }, []);

  // Theme Manager
  useEffect(() => {
    const storedTheme = localStorage.getItem('nelbion-bible-theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('nelbion-bible-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Firebase Auth State Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (!user) {
        // If logged out, clear progress and stop data loading
        setUserProgress({});
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Firestore Data Listener
  useEffect(() => {
    if (!db || !currentUser || isAuthLoading) {
      if (!currentUser && !isAuthLoading) setDataLoading(false); // No user, not loading auth, so no data to load
      return;
    }

    setDataLoading(true);
    const collectionPath = currentUser?.uid
      ? `artifacts/${appId}/users/${currentUser.uid}/bibleProgress`
      : ''; // Or handle the case where currentUser is null differently
    const progressCollectionRef = collection(db, collectionPath);

    const unsubscribe = onSnapshot(
      progressCollectionRef,
      (snapshot) => {
        const newProgress = {[key: string]: any} = {};;
        snapshot.docs.forEach((docSnap) => {
          newProgress[docSnap.id] = docSnap.data();
        });
        setUserProgress(newProgress);
        setDataLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching progress from Firestore:', err);
        setError('Could not load reading progress.');
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, currentUser, isAuthLoading]);

  // --- Auth Functions ---
  const signUpUser = async (email: string, password: string, displayName: string) => {
    if (!auth) return { error: 'Auth not initialized' };
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });
      // Refresh currentUser state by re-setting it from userCredential or let onAuthStateChanged handle it
      setCurrentUser({ ...userCredential.user, displayName }); // Optimistic update
      return { user: userCredential.user };
    } catch (e) {
      console.error('Sign up error:', e);
      return { error: (e as Error).message };
    }
  };

  const loginUser = const loginUser = async (email: string, password: string) => {
    if (!auth) return { error: 'Auth not initialized' };
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: userCredential.user };
    } catch (e) {
      console.error('Login error:', e);
      return { error: (e as Error).message };
    }
  };

  const logoutUser = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  // --- Data Update Function ---
  const updateChapterData = useCallback(
    async (bookName: string, chapterNumber: number, dataToUpdate: any) => {
      if (!db || !currentUser) {
        setError('Cannot save: Not logged in or DB not connected.');
        return;
      }
      const bookDocRef = doc(
        db,
        `artifacts/${appId}/users/${currentUser.uid}/bibleProgress`,
        bookName
      );
      try {
        const currentBookData = userProgress[bookName] || { chapters: {} };
        const currentChapterData =
          currentBookData.chapters?.[chapterNumber.toString()] || {};
        const updatedChapterPayload = {
          ...currentChapterData,
          ...dataToUpdate,
        };
        const updatedBookPayload = {
          ...currentBookData,
          chapters: {
            ...(currentBookData.chapters || {}),
            [chapterNumber.toString()]: updatedChapterPayload,
          },
        };
        setUserProgress((prev) => ({
          ...prev,
          [bookName]: updatedBookPayload,
        })); // Optimistic
        await setDoc(bookDocRef, updatedBookPayload, { merge: true });
      } catch (e) {
        console.error('Error updating chapter data:', e);
        setError('Failed to save chapter update.');
      }
    },
    [db, currentUser, userProgress]
  );

  const value = {
    allBooksData: BIBLE_BOOKS_DATA,
    userProgress,
    dataLoading,
    error,
    updateChapterData,
    currentUser,
    isAuthLoading,
    signUpUser,
    loginUser,
    logoutUser,
    theme,
    toggleTheme,
    db, // Expose db for PDF generation if needed directly
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

// --- UI Components ---

const ProgressBar = ({ current, total, height = 'h-3' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div
      className={`w-full bg-slate-300 dark:bg-slate-700 rounded-full ${height} overflow-hidden`}
    >
      <div
        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose }) => {
  const { signUpUser, loginUser } = useAppContext();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    let result;
    if (isLoginView) {
      result = await loginUser(email, password);
    } else {
      if (!displayName.trim()) {
        setAuthError('Display name is required for sign up.');
        setIsLoading(false);
        return;
      }
      result = await signUpUser(email, password, displayName);
    }
    setIsLoading(false);
    if (result.error) {
      setAuthError(result.error);
    } else {
      onClose(); // Close modal on success
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6 text-center">
          {isLoginView ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLoginView}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Your Name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          {authError && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setAuthError('');
            }}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const JournalSection = ({
  bookName,
  chapterNumber,
  initialNotes,
  onSave,
  onCloseEditor,
}) => {
  const { updateChapterData } = useAppContext();
  const [learned, setLearned] = useState(initialNotes?.learned || '');
  const [stoodOut, setStoodOut] = useState(initialNotes?.stoodOut || '');
  const [application, setApplication] = useState(
    initialNotes?.application || ''
  );
  const [questions, setQuestions] = useState(initialNotes?.questions || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const notesData = { learned, stoodOut, application, questions };
    await updateChapterData(bookName, chapterNumber, {
      notes: notesData,
      read: true,
    });
    setIsSaving(false);
    if (onSave) onSave();
    if (onCloseEditor) onCloseEditor();
  };

  useEffect(() => {
    setLearned(initialNotes?.learned || '');
    setStoodOut(initialNotes?.stoodOut || '');
    setApplication(initialNotes?.application || '');
    setQuestions(initialNotes?.questions || '');
  }, [initialNotes]);

  return (
    <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
      <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
        My Reflections on Chapter {chapterNumber}
      </h4>
      <div className="space-y-4">
        {['learned', 'stoodOut', 'application', 'questions'].map((field) => {
          const GptPillLabels = {
            learned: 'What I learned:',
            stoodOut: 'What stood out to me:',
            application: 'How can I apply this?:',
            questions: 'Questions I have:',
          };
          const GptPillPlaceholders = {
            learned: 'Key lessons, insights, facts...',
            stoodOut: 'Verses, themes, or moments that resonated...',
            application: 'Practical steps or changes in perspective...',
            questions: "Things I'm still wondering about...",
          };
          const value = { learned, stoodOut, application, questions }[field];
          const setValue = {
            learned: setLearned,
            stoodOut: setStoodOut,
            application: setApplication,
            questions: setQuestions,
          }[field];
          return (
            <div key={field}>
              <label
                htmlFor={`${field}-${chapterNumber}`}
                className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                {GptPillLabels[field]}
              </label>
              <textarea
                id={`${field}-${chapterNumber}`}
                rows="3"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={GptPillPlaceholders[field]}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onCloseEditor}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md border border-slate-300 dark:border-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save size={16} className="mr-2" /> Save Reflections
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ChapterModal = ({ book, isOpen, onClose }) => {
  const { userProgress, updateChapterData } = useAppContext();
  const [selectedChapterForNotes, setSelectedChapterForNotes] = useState(null);

  if (!isOpen) return null;

  const bookDataFromStore = userProgress[book.name] || { chapters: {} };
  const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);

  const handleToggleChapterReadStatus = (chapterNum) => {
    const chapterDetails =
      bookDataFromStore.chapters?.[chapterNum.toString()] || {};
    updateChapterData(book.name, chapterNum, { read: !chapterDetails.read });
  };

  const getChapterDetails = (chapterNum) =>
    bookDataFromStore.chapters?.[chapterNum.toString()] || {
      read: false,
      notes: {},
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {book.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={28} />
          </button>
        </div>

        {!selectedChapterForNotes ? (
          <>
            <div className="overflow-y-auto flex-grow pr-2 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Click chapter to mark read/unread. Click{' '}
                <FileText size={14} className="inline -mt-1" /> icon for
                reflections.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {chaptersArray.map((chapterNum) => {
                  const details = getChapterDetails(chapterNum);
                  const isRead = !!details.read;
                  const hasNotes =
                    details.notes &&
                    Object.values(details.notes).some(
                      (note) => note && note.length > 0
                    );
                  return (
                    <div
                      key={chapterNum}
                      className="flex flex-col items-center"
                    >
                      <button
                        onClick={() =>
                          handleToggleChapterReadStatus(chapterNum)
                        }
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium border transition-colors duration-150
                          ${
                            isRead
                              ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-500'
                          }`}
                        aria-pressed={isRead}
                      >
                        {' '}
                        {chapterNum}{' '}
                      </button>
                      <button
                        onClick={() => setSelectedChapterForNotes(chapterNum)}
                        className={`mt-1 p-1 rounded-md ${
                          hasNotes
                            ? 'text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        } transition-colors`}
                      >
                        <FileText size={18} />{' '}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-auto text-right pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <div className="overflow-y-auto flex-grow pr-2">
            <JournalSection
              bookName={book.name}
              chapterNumber={selectedChapterForNotes}
              initialNotes={getChapterDetails(selectedChapterForNotes).notes}
              onCloseEditor={() => setSelectedChapterForNotes(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const BookItem = ({ book }) => {
  const { userProgress } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const bookDataFromStore = userProgress[book.name] || { chapters: {} };
  const readCount = Object.values(bookDataFromStore.chapters || {}).filter(
    (ch) => ch.read
  ).length;
  const progressPercentage =
    book.chapters > 0 ? (readCount / book.chapters) * 100 : 0;
  const totalNotesCount = Object.values(
    bookDataFromStore.chapters || {}
  ).filter(
    (ch) => ch.notes && Object.values(ch.notes).some((n) => n && n.length > 0)
  ).length;

  const generateBookPdf = async () => {
    const pdf = new jsPDF('p', 'pt', 'a4'); // This line stays

    setIsGeneratingPdf(true); // This line stays
    // const { jsPDF } = window.jspdf; // This line should be REMOVED

    // REMOVE this entire if block:
    // {
    //   alert(
    //     'PDF generation libraries not loaded. Please ensure you have an internet connection or contact support.'
    //   );
    //   console.error('jspdf or html2canvas not found on window object.');
    //   return;
    // }

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight(); // eslint-disable-line no-unused-vars
    const margin = 40;
    let yPos = margin;

    pdf.setFontSize(20);
    pdf.text(book.name + ' - Reflections', pdfWidth / 2, yPos, {
      align: 'center',
    });
    yPos += 30;

    const chaptersWithNotes = Object.entries(bookDataFromStore.chapters || {})
      .map(([num, data]) => ({ num: parseInt(num), ...data }))
      .filter(
        (ch) =>
          ch.notes && Object.values(ch.notes).some((n) => n && n.length > 0)
      )
      .sort((a, b) => a.num - b.num);

    if (chaptersWithNotes.length === 0) {
      pdf.setFontSize(12);
      pdf.text('No reflections found for this book.', margin, yPos);
      pdf.save(`${book.name.replace(/\s+/g, '_')}_Reflections.pdf`);
      setIsGeneratingPdf(false);
      return;
    }

    for (const chapter of chaptersWithNotes) {
      if (yPos > pdf.internal.pageSize.getHeight() - margin * 2) {
        // Check for page break
        pdf.addPage();
        yPos = margin;
      }
      pdf.setFontSize(16);
      pdf.text(`Chapter ${chapter.num}`, margin, yPos);
      yPos += 20;

      const noteFields = [
        { label: 'What I Learned', value: chapter.notes.learned },
        { label: 'What Stood Out for Me', value: chapter.notes.stoodOut },
        {
          label: 'Application to My Daily Life',
          value: chapter.notes.application,
        },
        { label: 'My Questions', value: chapter.notes.questions },
      ];

      for (const field of noteFields) {
        if (field.value) {
          if (yPos > pdf.internal.pageSize.getHeight() - margin * 2) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.text(field.label + ':', margin, yPos);
          yPos += 15;
          pdf.setFont(undefined, 'normal');
          const splitText = pdf.splitTextToSize(
            field.value,
            pdfWidth - margin * 2
          );
          pdf.text(splitText, margin, yPos);
          yPos += splitText.length * 12 + 10; // Adjust spacing based on lines
        }
      }
      yPos += 10; // Extra space between chapters
    }

    pdf.save(`${book.name.replace(/\s+/g, '_')}_Reflections.pdf`);
    setIsGeneratingPdf(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-slate-700/50 transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-lg font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {book.name}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                book.testament === 'Old'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100'
              }`}
            >
              {book.testament}
            </span>
          </div>
          <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
            <ProgressBar current={readCount} total={book.chapters} />
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex justify-between items-center">
              <span>
                {readCount} / {book.chapters} chapters
              </span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            {totalNotesCount > 0 && (
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                <FileText size={14} className="mr-1" />
                {totalNotesCount}{' '}
                {totalNotesCount === 1 ? 'chapter note' : 'chapter notes'}
              </div>
            )}
          </div>
        </div>
        {totalNotesCount > 0 && (
          <button
            onClick={generateBookPdf}
            disabled={isGeneratingPdf}
            className="mt-3 w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-700/50 hover:bg-blue-200 dark:hover:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download size={14} className="mr-1.5" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Export Reflections'}
          </button>
        )}
      </div>
      {isModalOpen && (
        <ChapterModal
          book={book}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

const TestamentSection = ({ title, books }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
        aria-expanded={isOpen}
      >
        {title}
        {isOpen ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
};

const OverallProgress = () => {
  const { allBooksData, userProgress } = useAppContext();
  const totalReadChapters = useMemo(() => {
    return allBooksData.reduce((total, book) => {
      const bookProg = userProgress[book.name];
      if (!bookProg || !bookProg.chapters) return total;
      return (
        total + Object.values(bookProg.chapters).filter((ch) => ch.read).length
      );
    }, 0);
  }, [allBooksData, userProgress]);
  const overallPercentage =
    TOTAL_BIBLE_CHAPTERS > 0
      ? (totalReadChapters / TOTAL_BIBLE_CHAPTERS) * 100
      : 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-700/50 mb-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
        Overall Progress
      </h2>
      <ProgressBar
        current={totalReadChapters}
        total={TOTAL_BIBLE_CHAPTERS}
        height="h-4"
      />
      <div className="mt-2 text-slate-600 dark:text-slate-300 flex justify-between items-center">
        <span>
          {totalReadChapters} / {TOTAL_BIBLE_CHAPTERS} chapters read
        </span>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {overallPercentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const AppHeader = () => {
  const { currentUser, logoutUser, theme, toggleTheme } = useAppContext();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="bg-blue-700 dark:bg-slate-900 text-white p-4 shadow-md mb-6 sticky top-0 z-20">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <BookOpen size={32} className="mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold">
              NELBION BIBLE READING TRACKER
            </h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-600 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {currentUser ? (
              <>
                <span className="text-sm hidden sm:inline">
                  Hi, {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={logoutUser}
                  className="flex items-center text-sm px-3 py-1.5 rounded-md bg-blue-500 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-slate-600 transition-colors"
                >
                  <LogOut size={16} className="mr-1.5 sm:mr-1" />{' '}
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center text-sm px-3 py-1.5 rounded-md bg-blue-500 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-slate-600 transition-colors"
              >
                <LogIn size={16} className="mr-1.5 sm:mr-1" />{' '}
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login/Sign Up</span>
              </button>
            )}
          </div>
        </div>
        {currentUser && (
          <div className="sm:hidden text-center text-xs mt-2">
            Hi, {currentUser.displayName || currentUser.email}
          </div>
        )}
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-500"></div>
    <p className="mt-4 text-slate-700 dark:text-slate-200 text-lg">{message}</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-900/20 p-4">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl text-center">
      <X size={48} className="text-red-500 dark:text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-2">
        An Error Occurred
      </h2>
      <p className="text-red-600 dark:text-red-400">
        {message || 'Something went wrong.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Refresh
      </button>
    </div>
  </div>
);

// --- Main App Component ---
function App() {
  return (
    <AppProvider>
      <BibleTrackerAppContent />
    </AppProvider>
  );
}

function BibleTrackerAppContent() {
  const { currentUser, isAuthLoading, dataLoading, error, allBooksData } =
    useAppContext();

  if (error) return <ErrorDisplay message={error} />;
  if (isAuthLoading) return <LoadingSpinner message="Authenticating..." />;

  if (!currentUser) {
    // Show a public landing page or prompt to login if not logged in
    // For now, the AuthModal is triggered from header. We can show a simple message here.
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
          <h2 className="text-3xl font-semibold my-8">
            Welcome to NELBION Bible Reading Tracker
          </h2>
          <p className="text-lg">
            Please login or sign up to track your Bible reading progress and
            reflections.
          </p>
          {/* The login button is in the header */}
        </main>
        <footer className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} NELBION. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  if (dataLoading && currentUser)
    return <LoadingSpinner message="Loading your reading progress..." />;

  const oldTestamentBooks = allBooksData.filter((b) => b.testament === 'Old');
  const newTestamentBooks = allBooksData.filter((b) => b.testament === 'New');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <AppHeader />
      <main className="container mx-auto p-4">
        <OverallProgress />
        <TestamentSection title="Old Testament" books={oldTestamentBooks} />
        <TestamentSection title="New Testament" books={newTestamentBooks} />
      </main>
      <footer className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} NELBION. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
