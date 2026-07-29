export const hideBootScreen = () => {
    const boot = document.getElementById("boot-screen");

    if (!boot) return;

    boot.classList.add("hide");

    setTimeout(() => boot.remove(), 350);
};