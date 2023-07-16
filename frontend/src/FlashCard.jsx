function FlashCard({ word, definition, showDefinition }) {
    return (
        <div className="flex items-center justify-center min-w-[600px] min-h-[400px] bg-white shadow-lg">
            <div className="md:flex flex-col items-center justify-center h-full p-8">
                <div className="tracking-wide text-4xl text-indigo-500 font-semibold text-center">{word}</div>
                {showDefinition && <div className="mt-6 text-3xl leading-tight font-medium text-black text-center">{definition}</div>}
            </div>
        </div>
    );
}

export default FlashCard;
