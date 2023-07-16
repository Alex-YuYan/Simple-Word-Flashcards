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
    <dialog open onClick={() => setDialogVisible(false)} className="opacity-40 mb-[35vh] z-50">
      <div className="bg-black text-white p-8 rounded-lg shadow-lg text-xl">{message}</div>        
    </dialog>
  );
}
