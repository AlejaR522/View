export default function Button({ text, onClick }) {
    return (
        <button
            onClick={onClick}
                className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition"
            >
            {text}
        </button>
    );
}