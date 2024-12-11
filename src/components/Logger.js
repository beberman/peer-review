const Logger = {
  info: (message, ...optionalParams) => {
    console.info(
      `[INFO] ${new Date().toISOString()}: ${message}`,
      ...optionalParams
    );
  },
  warn: (message, ...optionalParams) => {
    console.warn(
      `[WARN] ${new Date().toISOString()}: ${message}`,
      ...optionalParams
    );
  },
  error: (message, ...optionalParams) => {
    console.error(
      `[ERROR] ${new Date().toISOString()}: ${message}`,
      ...optionalParams
    );
  },
  debug: (message, ...optionalParams) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[DEBUG] ${new Date().toISOString()}: ${message}`,
        ...optionalParams
      );
    }
  },
};

export default Logger;
