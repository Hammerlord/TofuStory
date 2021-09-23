import ReactDOM from 'react-dom';
import { App } from './App';
import { subi } from './images';

/**
 * HACK: Preload some images or they can be temporarily invisible :/
 */
[subi].forEach((image) => {
    const newImage = new Image();
    newImage.src = image;
    window[image] = newImage;
});

ReactDOM.render(
    <App />,
    document.getElementById('root')
);