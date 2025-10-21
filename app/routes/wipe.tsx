import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export async function loader() {
    return null;
}

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        files.forEach(async (file) => {
            await fs.delete(file.path);
        });
        await kv.flush();
        loadFiles();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Account Info & Data Management</h1>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Account Status</h2>
                <p>Authenticated as: <strong>{auth.user?.username}</strong></p>
                <p className="text-sm text-gray-600 mt-2">
                    If you're getting AI usage limit errors, you may need to:
                    <br/>• Wait for your quota to reset
                    <br/>• Upgrade your Puter account at <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">puter.com</a>
                </p>
            </div>
            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Existing files:</h2></div>
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;