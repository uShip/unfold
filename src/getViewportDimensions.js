function getWidth (win, docElem) {
    const docWidth = docElem.clientHeight;
    const winWidth = win.innerHeight;
    
    return (docWidth > winWidth)
        ? docWidth
        : winWidth;
}

function getHeight (win, docElem) {
    const docHeight = docElem.clientHeight;
    const winHeight = win.innerHeight;

    return (docHeight > winHeight)
        ? docHeight
        : winHeight;
}

export default function getViewportDimensions (win, doc) {
    const docElem = doc.documentElement || doc.body.parentNode;
    return {
        width: getWidth(win, docElem),
        height: getHeight(win, docElem)
    };
}