// DialogBox.js
import React, { useEffect } from "react";

export default function DialogBox({ message, setDialogVisible, dialogChoice1, dialogChoice2, dialogAction1, dialogAction2 }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDialogVisible(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [setDialogVisible]);

  return (
    <dialog open onClick={() => setDialogVisible(false)} className="opacity-40 mb-[25vh]">
      <div className="bg-black text-white p-8 rounded-lg shadow-lg text-xl">{message}</div>
      {
        dialogChoice1 && !dialogChoice2 && (
          <div className="flex justify-center space-x-4 mt-4">
            <button onClick={dialogAction1} className="text-xl p-2 rounded-md border-2 border-gray-300">{dialogChoice1}</button>
          </div>
        )
      }
      {
        dialogChoice1 && dialogChoice2 && (
          <div className="flex justify-center space-x-4 mt-4">
            <button onClick={dialogAction1} className="text-xl p-2 rounded-md border-2 border-gray-300">{dialogChoice1}</button>
            <button onClick={dialogAction2} className="text-xl p-2 rounded-md border-2 border-gray-300">{dialogChoice2}</button>
          </div>
        )
      }
    </dialog>
  );
}
