import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, LogOut } from "lucide-react";
import "@fontsource/jetbrains-mono";

const QuizApp = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const decodeBase64 = (str) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return str;
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&category=31&difficulty=easy&encode=base64"
      );
      const data = await res.json();
      if (data.response_code === 0) {
        const formatted = data.results.map((q) => {
          const incorrect = q.incorrect_answers.map((a) => decodeBase64(a));
          const correct = decodeBase64(q.correct_answer);
          const all = [...incorrect, correct].sort(() => Math.random() - 0.5);
          return {
            question: decodeBase64(q.question),
            correctAnswer: correct,
            answers: all,
          };
        });
        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
      } else setError("Gagal mengambil soal. Silakan coba lagi.");
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && questions.length > 0 && !isQuizFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) {
            setIsQuizFinished(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoggedIn, questions, isQuizFinished, timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      fetchQuestions();
    }
  };

  const handleAnswer = (a) => {
    setSelectedAnswer(a);
    const updated = [...answers];
    updated[currentQuestion] = a;
    setAnswers(updated);
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((p) => p + 1);
        setSelectedAnswer(null);
      }, 400);
    } else {
      setTimeout(() => setIsQuizFinished(true), 400);
    }
  };

  const calc = () => {
    let c = 0,
      w = 0,
      ans = 0;
    answers.forEach((a, i) => {
      if (a !== null) {
        ans++;
        if (a === questions[i].correctAnswer) c++;
        else w++;
      }
    });
    return { c, w, ans };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(300);
    setIsQuizFinished(false);
    setSelectedAnswer(null);
    fetchQuestions();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(300);
    setIsQuizFinished(false);
    setSelectedAnswer(null);
  };

  const baseBg = "bg-neutral-50";
  const baseText = "text-neutral-900";

  if (!isLoggedIn)
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${baseBg} font-['JetBrains_Mono']`}
      >
        <div className="w-2xl bg-white border border-neutral-200 rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">
              Kuis Anime & Manga
            </h1>
            <p className="text-neutral-600 text-sm mt-1">
              Uji pengetahuanmu sekarang!
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/30"
            />
            {!username.trim() && (
              <p className="text-sm text-red-500 animate-fade-in">
                Nama tidak boleh kosong
              </p>
            )}

            <button
              disabled={!username.trim()}
              className="w-full bg-neutral-900 text-white font-semibold py-3 rounded-xl transition-all 
             hover:bg-neutral-800 active:bg-neutral-950 active:scale-[0.97] disabled:opacity-50"
            >
              Mulai Kuis
            </button>
          </form>
        </div>
      </div>
    );

  if (loading)
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${baseBg}`}
      >
        <div className="flex flex-col items-center gap-4 font-['JetBrains_Mono']">
          <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin"></div>
          <p className="text-neutral-700 font-medium">Memuat soal...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${baseBg}`}
      >
        <div className="w-[400px] bg-white border border-neutral-200 rounded-2xl shadow-md p-8 text-center font-['JetBrains_Mono']">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-neutral-700" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Oops!</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-neutral-900 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-neutral-800 active:scale-[0.97]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );

  if (isQuizFinished) {
    const r = calc();
    const percent = ((r.c / questions.length) * 100).toFixed(1);
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${baseBg} font-['JetBrains_Mono']`}
      >
        <div className="w-[600px] bg-white border border-neutral-200 rounded-2xl shadow-md p-10 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              Kuis Selesai!
            </h2>
            <p className="text-neutral-600">
              Selamat <span className="font-semibold">{username}</span>, ini
              hasilmu!
            </p>
          </div>

          <div className="flex justify-around mb-6">
            <div className="text-neutral-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {r.c} Benar
            </div>
            <div className="text-neutral-500 font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {r.w} Salah
            </div>
          </div>

          <div className="mb-8">
            <p className="text-5xl font-bold text-neutral-900">{percent}%</p>
            <p className="text-sm text-neutral-500 mt-1">
              {r.ans} dari {questions.length} soal terjawab
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="bg-neutral-900 text-white font-semibold px-6 py-3 rounded-xl 
               hover:bg-neutral-800 active:bg-neutral-950 active:scale-[0.97] transition-all"
            >
              Ulangi
            </button>
            <button
              onClick={handleLogout}
              className="bg-white border border-neutral-300 text-neutral-800 font-semibold px-6 py-3 rounded-xl 
               hover:bg-neutral-100 active:bg-neutral-200 active:scale-[0.97] transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const low = timeLeft <= 60;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${baseBg} overflow-hidden font-['JetBrains_Mono']`}
    >
      <div className="relative w-[700px] h-[600px] bg-white border border-neutral-200 rounded-2xl shadow-md p-8 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center rounded-full font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{username}</p>
              <p className="text-xs text-neutral-500">
                Soal {currentQuestion + 1}/{questions.length}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border ${
              low
                ? "bg-neutral-100 text-neutral-800 border-neutral-400 animate-pulse"
                : "bg-neutral-50 text-neutral-700 border-neutral-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-neutral-900 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 line-clamp-3">
            {q.question}
          </h3>
          <div className="space-y-3">
            {q.answers.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(a)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left px-5 py-3 rounded-xl font-medium transition-all ${
                  selectedAnswer === a
                    ? "bg-neutral-900 text-white shadow-md scale-[0.98]"
                    : "bg-neutral-50 border border-neutral-300 hover:bg-neutral-100 active:scale-[0.98] text-neutral-800"
                } disabled:cursor-not-allowed`}
              >
                {String.fromCharCode(65 + i)}. {a}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
