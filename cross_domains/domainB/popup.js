
// // Plain JS popup to demonstrate cross-domain script execution
// document.addEventListener("DOMContentLoaded", () => {
//     const bubble = document.createElement("div");
//     bubble.textContent = "Popup JS served from another.local:9000";
//     Object.assign(bubble.style, {
//         position: "fixed",
//         top: "20px",
//         right: "20px",
//         background: "#222",
//         color: "#fff",
//         padding: "10px 14px",
//         borderRadius: "6px",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
//         fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
//         zIndex: 99999
//     });
//     document.body.appendChild(bubble);
// });

// Read URL parameters
const params = new URLSearchParams(window.location.search);

// Extract specific ones
const user = params.get("user");
const mode = params.get("mode");

// Show popup with parameters
window.onload = () => {
    alert(`User: ${user}\nMode: ${mode}`);
};