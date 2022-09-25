export default function scrollSaver() {
    setTimeout(() => {
        sessionStorage.setItem("scrollY", window.scrollY);
    }, 100);
}