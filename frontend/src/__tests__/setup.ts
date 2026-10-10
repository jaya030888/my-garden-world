import 'fake-indexeddb/auto';

// Mock getContext for HTMLCanvasElement in JSDOM testing environment
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
