export default function Input({ placeholder, type = "text", onChange }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
    );
}