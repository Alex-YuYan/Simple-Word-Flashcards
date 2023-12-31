// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import FlashCard from "./FlashCard";
import DialogBox from "./DialogBox";
import FillButton from "./FillButton";

function App() {
  const [unit, setUnit] = useState(
    localStorage.getItem("simple_flashcard_unit") || "unit_1"
  );
  const [mode, setMode] = useState("learn");
  const [showDefinition, setShowDefinition] = useState(true);
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [units, setUnits] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [testDisplayIndices, setTestDisplayIndices] = useState([0]); // The indices of the words currently being tested
  const [testWrongIndices, setTestWrongIndices] = useState([]); // The indices of the words marked as wrong during testing
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const saveToLocal = () => {
      localStorage.setItem("simple_flashcard_unit", unit);
    };
    saveToLocal();
  }, [unit]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (blocked) {
        return;
      }
      switch (event.key) {
        case "ArrowRight":
          if (mode === "learn") {
            handleNextWord();
          }
          break;
        case "ArrowLeft":
          if (mode === "learn") {
            handlePrevWord();
          }
          break;
        case "ArrowDown":
        case "ArrowUp":
          if (mode === "learn") {
            handleToggleDefinition();
          }
          break;
        case "Q":
        case "q":
          if (mode === "test") {
            if (showDefinition === false) {
              setShowDefinition(true);
            } else {
              handleTestSelection(true);
            }
          }
          break;
        case "W":
        case "w":
          if (mode === "test") {
            if (showDefinition === false) {
              setShowDefinition(true);
              setBlocked(true);
              setTimeout(() => {handleTestSelection(false); setBlocked(false)}, 3000);
            } else {
              handleTestSelection(false)
            }
          }
          break;
        case "T":
        case "t":
          handleModeChange();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentWordIndex,
    mode,
    showDefinition,
    wordList,
    testDisplayIndices,
    testWrongIndices,
  ]);

  useEffect(() => {
    const fetchUnits = async () => {
      const res = await axios.get("http://localhost:5000/dictionary");
      setUnits(res.data);
      setDialogVisible(true);
      setDialogMessage(`Loaded ${res.data.length} units`);
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (mode === "test") {
      setTestDisplayIndices(wordList.map((_, i) => i)); // Map all wordList indices to testDisplayIndices
      setTestWrongIndices([]);
      setShowDefinition(false);
    } else {
      setTestDisplayIndices([0]);
      setTestWrongIndices([]);
      setShowDefinition(true);
    }
  }, [wordList, mode]);

  useEffect(() => {
    const fetchWords = async () => {
      const res = await axios.get(`http://localhost:5000/dictionary/${unit}`);
      setWordList(res.data);
      setCurrentWordIndex(0);
    };
    fetchWords();
  }, [unit]);

  const handleUnitChange = async (event) => {
    setUnit(event.target.value);
  };

  const handleModeChange = () => {
    showDialog(`Switched to ${mode === "learn" ? "test" : "learn"} mode`);
    setMode(mode === "learn" ? "test" : "learn");
    setCurrentWordIndex(0);
  };

  const handleToggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  const handleNextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      showDialog("You are already at the last word!");
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      showDialog("You are already at the first word!");
    }
  };

  const handleDeleteWord = async () => {
    if (wordList.length === 1) {
      showDialog("You cannot delete the last word!");
      return;
    }

    // Delete word from backend
    const res = await axios.delete(
      `http://localhost:5000/dictionary/${unit}/${currentWordIndex}`
    );

    // Delete word from state
    if (res.status === 200) {
      const newWordList = [...wordList];
      newWordList.splice(currentWordIndex, 1);
      setWordList(newWordList);
      showDialog("Word deleted from learning list successfully!");
    } else {
      showDialog("Error deleting word from learning list!");
    }
  };

  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const handleTestSelection = (isCorrect) => {
    if (isCorrect) {
      setTestDisplayIndices(testDisplayIndices.slice(1));
      if (testDisplayIndices.length === 1) {
        if (testWrongIndices.length === 0) {
          handleModeChange();
          showDialog("Test mode completed successfully!");
        } else {
          setTestDisplayIndices(testWrongIndices);
          setTestWrongIndices([]);
          showDialog("Now testing on the words you got wrong!");
        }
      }
    } else {
      if (testDisplayIndices.length === 1 && testWrongIndices.length === 0) {
        showDialog("Now testing on final word you got wrong!");
      } else {
        const newTestWrongIndices = [
          ...testWrongIndices,
          testDisplayIndices[0],
        ];
        setTestWrongIndices(newTestWrongIndices);
        setTestDisplayIndices(testDisplayIndices.slice(1));
        if (testDisplayIndices.length === 1) {
          setTestDisplayIndices(newTestWrongIndices);
          setTestWrongIndices([]);
          showDialog("Now testing on the words you got wrong!");
        }
      }
    }
    setShowDefinition(false);
  };

  const shuffleWordList = () => {
    const newWordList = [...wordList];
    for (let i = newWordList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newWordList[i], newWordList[j]] = [newWordList[j], newWordList[i]];
    }
    setWordList(newWordList);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {dialogVisible && (
        <DialogBox
          message={dialogMessage}
          setDialogVisible={setDialogVisible}
        />
      )}
      <div className="flex flex-col items-center space-y-4">
        <div className={`text-center mb-8 ${blocked ? "invisible" : ""}`}>
          {mode === "learn" && (
            <h1 className="font-bold font-serif text-6xl">
              <span className="text-emerald-700 text-[80px]">
                {currentWordIndex + 1}
              </span>{" "}
              / <span className="text-zinc-700/80">{wordList.length}</span>{" "}
            </h1>
          )}
          {mode === "test" && (
            <>
              <div className="flex justify-center">
                <div className="w-1/2 font-semibold text-3xl text-zinc-800/80 text-start">
                  
                  Remain{" "}<span className="text-violet-600">
                    {testDisplayIndices.length}
                  </span>
                </div>
                <div className="w-1/2 font-semibold text-3xl text-zinc-800/80 -mb-2 text-end">
                  <span className="text-red-600">
                    {testWrongIndices.length}
                  </span>{" "}
                  Wrong
                </div>
              </div>
              <div className="relative w-[400px] h-4 bg-violet-600/60 rounded-lg mt-6 py-3 -mb-3">
                <div
                  className="absolute top-0 right-0 h-full bg-red-600 rounded-lg"
                  style={{
                    width: `${
                      (testWrongIndices.length / wordList.length) * 100
                    }%`,
                  }}
                ></div>
                <div
                  className="absolute top-0 left-0 h-full bg-emerald-400 rounded-lg"
                  style={{
                    width: `${
                      (1 -
                        (testDisplayIndices.length + testWrongIndices.length) /
                          wordList.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </>
          )}
        </div>
        <div className={`fixed left-10 top-10 bg-white shadow-md p-4 rounded-lg hidden min-w-[14vw] text-center  ${blocked ? '' : 'lg:block'}`}>
          <div className="mb-2">
            <select
              value={unit}
              onChange={handleUnitChange}
              className="text-xl p-2 rounded-md border-2 border-gray-300 w-full text-center disabled:opacity-20"
              disabled={mode === "test"}
            >
              {units
                .sort((a, b) => {
                  const unitA = parseInt(a.split("_")[1]);
                  const unitB = parseInt(b.split("_")[1]);
                  return unitA - unitB;
                })
                .map((unit) => (
                  <option value={unit} key={unit}>
                    {unit.charAt(0).toUpperCase() +
                      unit.slice(1).replace("_", " ")}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-2">
            <button
              onClick={handleModeChange}
              className="text-xl p-2 rounded-md border-2 border-gray-300 w-full"
            >
              Now {mode.charAt(0).toUpperCase() + mode.slice(1)}ing
            </button>
          </div>
          <div className="mb-2">
            <button
              onClick={handleToggleDefinition}
              className="text-xl p-2 rounded-md border-2 border-gray-300 w-full"
            >
              Definition
            </button>
          </div>
          <div>
            <button
              onClick={shuffleWordList}
              className="text-xl p-2 rounded-md border-2 border-gray-300 w-full"
            >
              Shuffle
            </button>
          </div>
        </div>
        {wordList.length > 0 && (
          <>
            {mode === "test" && (
              <FlashCard
                word={wordList[testDisplayIndices[0]].word}
                definition={wordList[testDisplayIndices[0]].definition}
                showDefinition={showDefinition}
              />
            )}
            {mode === "learn" && (
              <FlashCard
                word={wordList[currentWordIndex].word}
                definition={wordList[currentWordIndex].definition}
                showDefinition={showDefinition}
              />
            )}

            <div className={`flex space-x-4 w-full ${blocked ? "invisible" : ""}`}>
              {mode === "learn" && (
                <>
                  <button
                    onClick={handlePrevWord}
                    className="text-xl p-2 rounded-md border-2 border-gray-300 w-1/2 opacity-40 hover:opacity-100"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={handleNextWord}
                    className="text-xl p-2 rounded-md border-2 border-gray-300 w-1/2 opacity-40 hover:opacity-100"
                  >
                    Next →
                  </button>
                </>
              )}
              {mode === "test" && (
                <>
                  <button
                    onClick={() => {
                      if (showDefinition === false) {
                        setShowDefinition(true);
                      } else {
                        handleTestSelection(true);
                      }
                    }}
                    className="text-xl p-2 rounded-md border-2 border-gray-300 w-1/2"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      if (showDefinition === false) {
                        setShowDefinition(true);
                        setBlocked(true);
                        setTimeout(() => {handleTestSelection(false); setBlocked(false)}, 3000);
                      } else {
                        handleTestSelection(false)
                      }
                    }}
                    className="text-xl p-2 rounded-md border-2 border-gray-300 w-1/2"
                  >
                    ✗
                  </button>
                </>
              )}
            </div>

            <div className="flex space-x-4 w-full min-h-[40px]">
              {mode === "learn" && (
                <FillButton
                  onFilled={() => handleDeleteWord()}
                  text={"Familiar Enough (Hold Spacebar)"}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
