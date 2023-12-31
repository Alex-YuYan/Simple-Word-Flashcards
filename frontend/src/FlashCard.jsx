function FlashCard({ word, definition, showDefinition }) {
    return (
        <div className="flex items-center justify-center min-w-[600px] min-h-[400px] bg-white shadow-lg z-10">
            <div className="md:flex flex-col items-center justify-center h-full p-8">
                <div className="tracking-wide text-5xl font-serif text-center">{word}</div>
                {showDefinition && <div className="mt-6 text-3xl leading-tight font-medium text-black text-center max-w-[500px] break-words">{definition}</div>}
            </div>
        </div>
    );
}

export default FlashCard;
