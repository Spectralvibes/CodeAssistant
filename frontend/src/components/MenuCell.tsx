import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Snackbar from "./Snackbar.tsx"; // ✅ Import Snackbar

const MenuCell = (props: any) => {
    const { menuOptions, name } = props.data;
    const [showMenu, setShowMenu] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    // ✅ Calculate menu position
    useEffect(() => {
        if (showMenu && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: Math.min(rect.left, window.innerWidth - 150), // Prevents overflow
            });
        }
    }, [showMenu]);

    // ✅ Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                }}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                }}
            >
                ⋮
            </button>

            {showMenu &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "absolute",
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                            background: "white",
                            border: "1px solid #ccc",
                            boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
                            zIndex: 10000,
                            padding: "5px",
                            minWidth: "150px",
                        }}
                    >
                        {menuOptions.map((option: string, index: number) => (
                            <div
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSnackbarMessage(`${option} clicked for ${name}`);
                                    setShowMenu(false);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    borderBottom: index !== menuOptions.length - 1 ? "1px solid #eee" : "none",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>,
                    document.body
                )}

            {/* ✅ Show snackbar when message is set */}
            {snackbarMessage && <Snackbar message={snackbarMessage} onClose={() => setSnackbarMessage(null)} />}
        </>
    );
};

export default MenuCell;
