# Stockfish.js source

`stockfish-19-lite-single.js` and `stockfish-19-lite-single.wasm` are unmodified copies from the
[`stockfish`](https://www.npmjs.com/package/stockfish) npm package, version 19.0.1, licensed under GPLv3 (see `Copying.txt`).

Corresponding source:

- Stockfish.js v19.0.1 (engine, emscripten glue, build script): https://github.com/nmrugg/stockfish.js/tree/v19.0.1
- Release archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v19.0.1.tar.gz
- Upstream Stockfish: https://github.com/official-stockfish/Stockfish
- Embedded network `nn-61e7af4bb97d`: https://tests.stockfishchess.org/nns?network_name=nn-61e7af4bb97d

Build: in the v19.0.1 source, run `npm run build-single-lite` (`./build.js --single-threaded --lite`) with emscripten 6.0.9.
