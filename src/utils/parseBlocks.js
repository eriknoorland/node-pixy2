const parseBlocks = (data) => {
  return {
    signature: data[0],
    x: data[1],
    y: data[2],
    width: data[3],
    height: data[4],
    index: data[5],
    angle: data[6],
    age: data[7]
  };
};

module.exports = parseBlocks;
