import ReactDOM from 'react-dom';
import { App } from './App';
import { ClearImage, SubiImage } from './images';

/**
 * HACK: Preload some images or they can be temporarily invisible :/
 * TODO: selectively load and unload images in combat
 */
[SubiImage, ClearImage].forEach((image) => {
    const newImage = new Image();
    newImage.src = image;
    window[image] = newImage;
});

ReactDOM.render(
    <App />,
    document.getElementById('root')
);