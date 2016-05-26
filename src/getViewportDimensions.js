import $ from 'jquery';

function getWidth (win, docElem) {
    const docWidth = docElem.clientWidth;
    const winWidth = win.innerWidth;
    
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
    const $window = $(window);
    let container = window;
    let a = 'inner';
    if (!window.innerWidth){
        a = 'client';
        container = document.documentElement || document.body;
    }
    const  w = a + 'Width', h = a + 'Height';
    //return a func because the return values may change everytime the user tries to get dimensions.
    return () => {
        return {
            width : container[w],
            height : container[h],
            innerWidth: $window.width(),
            innerHeight: $window.height()
        };
    };
}

// export default function getViewportDimensions (win, doc) {
//     const docElem = doc.documentElement || doc.body.parentNode;
//     return {
//         width: getWidth(win, docElem),
//         height: getHeight(win, docElem)
//     };
// }