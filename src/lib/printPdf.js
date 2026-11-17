export function printPdf(title) {
    const previousTitle = document.title;
    const restore = () => {
        document.title = previousTitle;
        window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    document.title = title;
    window.print();
}
