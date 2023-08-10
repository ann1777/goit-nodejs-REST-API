import Jimp from 'jimp';
import fs from 'fs/promises';
import path from 'path';

class UploadFileAvatar {
  constructor(destination) {
    this.destination = destination;
  }

  async transformAvatar(pathFile) {
    const pic = Jimp.read(pathFile);
    await (
      await pic
    )
      .autocrop()
      .cover(
        250,
        250,
        Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
      )
      .writeAsync(pathFile);
  }

  async save(file, idUser) {
    await this.transformAvatar(file.path);
    await fs.rename(file.path, path.join(this.destination, file.filename));
    return path.normalize(path.join(idUser, file.filename));
  }
}

export default UploadFileAvatar;
