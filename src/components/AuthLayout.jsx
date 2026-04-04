export default function AuthLayout({ children }) {
    return (
        <div className="flex h-screen">
        
            {/* Lado izquierdo (negro) */}
            <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-4">View</h1>
                <p className="text-gray-300 text-center">
                    Tu mini red social 
                </p>
            </div>

            {/* Lado derecho (blanco) */}
            <div className="w-1/2 bg-white flex justify-center items-center">
                {children}
            </div>

        </div>
    );
}