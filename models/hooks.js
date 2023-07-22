export const handleSaveError = (error, data, next) => {
  error.status = 400;
  next();
};

export const runValidateAtUpdate = () => {
  this.options.runValidators = true;
};
