import React from 'react';

function MyMemoriesPage() {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-yellow-200 p-8">
            <h1 className="text-3xl font-bold mb-6">My Memories</h1>

            <div className="grid grid-cols-3 gap-4">
                <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                    alt="Memory 1"
                    className="rounded-lg shadow-lg"
                />
                <img
                    src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
                    alt="Memory 2"
                    className="rounded-lg shadow-lg"
                />
                <img
                    src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=80"
                    alt="Memory 3"
                    className="rounded-lg shadow-lg"
                />
            </div>
        </div>
    );
}

export default MyMemoriesPage;
