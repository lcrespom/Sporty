// See https://decipher.dev/deno-by-example/advanced-readline/
// Buffer size has been increased to improve performance by more than 10x

const decoder = new TextDecoder();
const readChunk = async (fileName: string) => {
  const file = await Deno.open(fileName);
  const buf = new Uint8Array(4096);
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const num = await Deno.read(file?.rid, buf);
          if (num) {
            return { done: false, value: decoder.decode(buf.slice(0, num)) };
          }
          return { done: true, value: null };
        },
      };
    },
  };
};
const _readTillDone = async (
  rid: number,
  text = ""
): Promise<[string, string, boolean]> => {
  const buf = new Uint8Array(4096);
  const indexOfLine = text.indexOf("\n");
  if (indexOfLine === -1) {
    const num = await Deno.read(rid, buf);
    if (num) {
      text = text + decoder.decode(buf.slice(0, num));
      return _readTillDone(rid, text);
    } else {
      return [text, "", true];
    }
  } else {
    return [text.slice(0, indexOfLine), text.slice(indexOfLine + 1), false];
  }
};
const readLine = async (fileName: string) => {
  const file = await Deno.open(fileName);
  let text = "";
  let done = false;
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const [t, rest, d] = await _readTillDone(file?.rid, text);
          if (done) {
            return { done: true, value: t };
          } else {
            text = rest;
            done = d;
            return { done: false, value: t };
          }
        },
      };
    },
  };
};
export { readChunk, readLine };
