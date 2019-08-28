const parseStateChange = (data) => {
  return {
    code: data[0],
    state: data[1],
    frameWidth: data[2],
    frameHeight: data[3]
  };
};

module.exports = parseStateChange;
