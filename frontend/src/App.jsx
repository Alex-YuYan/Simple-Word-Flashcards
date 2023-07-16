// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import FlashCard from "./FlashCard";
import DialogBox from "./DialogBox";

function App() {
  const [unit, setUnit] = useState("unit_1");
  const [mode, setMode] = useState("learn");
  const [showDefinition, setShowDefinition] = useState(true);
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [units, setUnits] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [testDisplayIndices, setTestDisplayIndices] = useState([0]); // The indices of the words currently being tested
  const [testWrongIndices, setTestWrongIndices] = useState([]); // The indices of the words marked as wrong during testing
  const [deletConfirm, setDeletConfirm] = useState(false);

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
      setTestDisplayIndices([0]); // Reset testDisplayIndices to only show the first word
      setTestWrongIndices([]);
      setShowDefinition(true);
    }
    setCurrentWordIndex(0); // Reset the currentWordIndex to 0
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
    setMode(mode === "learn" ? "test" : "learn");
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
    // Delete word from backend
    const res = await axios.delete(
      `http://localhost:5000/dictionary/${unit}/${currentWordIndex}`
    );

    // Delete word from state
    if (res.status === 200) {
      const newWordList = [...wordList];
      newWordList.splice(currentWordIndex, 1);
      setWordList(newWordList);
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
        }
      }
    } else {
      if (testDisplayIndices.length === 1 && testWrongIndices.length === 0) {
      } else {
        setTestWrongIndices([...testWrongIndices, testDisplayIndices[0]]);
        setTestDisplayIndices(testDisplayIndices.slice(1));
      }
    }
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
        <div className="fixed left-10 top-10 bg-white shadow-md p-4 rounded-lg">
          <div className="mb-2">
            <label className="text-xl mr-2">Unit:</label>
            <select
              value={unit}
              onChange={handleUnitChange}
              className="text-xl p-2 rounded-md border-2 border-gray-300"
            >
              {units
                .sort((a, b) => {
                  const unitA = parseInt(a.split("_")[1]);
                  const unitB = parseInt(b.split("_")[1]);
                  return unitA - unitB;
                })
                .map((unit) => (
                  <option value={unit} key={unit}>
                    {unit}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="text-xl mr-2">Mode:</label>
            <button
              onClick={handleModeChange}
              className="text-xl p-2 rounded-md border-2 border-gray-300"
            >
              {mode}
            </button>
          </div>
          <div>
            <button
              onClick={handleToggleDefinition}
              className="text-xl p-2 rounded-md border-2 border-gray-300"
            >
              {showDefinition ? "Hide definition" : "Show definition"}
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

            <div className="flex space-x-4">
              {mode === "learn" && (
                <>
                  <button
                    onClick={handlePrevWord}
                    className="text-xl p-2 rounded-md border-2 border-gray-300"
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNextWord}
                    className="text-xl p-2 rounded-md border-2 border-gray-300"
                  >
                    Next
                  </button>
                </>
              )}
              {mode === "test" && (
                <>
                  <button
                    onClick={() => handleTestSelection(true)}
                    className="text-xl p-2 rounded-md border-2 border-gray-300"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleTestSelection(false)}
                    className="text-xl p-2 rounded-md border-2 border-gray-300"
                  >
                    ✗
                  </button>
                </>
              )}
              {!deletConfirm && (
                <button
                  onClick={() => setDeletConfirm(true)}
                  className="text-xl p-2 rounded-md border-2  border-gray-300"
                >
                  Delete
                </button>
              )}

              {deletConfirm && (
                <>
                  <button
                    onClick={handleDeleteWord}
                    className="text-xl p-2 rounded-md border-2 bg-red-500 text-white border-gray-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeletConfirm(false)}
                    className="text-xl p-2 rounded-md border-2 bg-green-500 text-white border-gray-300"
                  >
                    Nevermind
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
