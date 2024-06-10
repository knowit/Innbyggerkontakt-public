import firebase from 'firebase/compat/app';

class fileStorage {
  storage: firebase.storage.Storage;
  storageRef: firebase.storage.Reference;
  progress: string;
  imageUrl: string;

  constructor(storage: firebase.storage.Storage, storageRef: firebase.storage.Reference) {
    if (storage && storageRef) {
      this.storage = storage;
      this.storageRef = storageRef;
      this.progress = '';
      this.imageUrl = '';
    } else throw new Error('Storage not possible');
  }

  async uploadFile(file: File, location: string, orgId: string) {
    const metadata = {
      contentType: file.type,
      size: file.size,
      name: file.name,
    };
    const uploadTask = await this.storageRef
      .child(orgId + '/' + location + '/' + (Math.floor(Date.now() / 1000) + '_' + file.name))
      .put(file, metadata);

    await uploadTask.ref.getDownloadURL().then((result) => {
      this.imageUrl = result;
    });

    return this.imageUrl;
  }

  deleteFile(ref: firebase.storage.Reference) {
    ref
      .delete()
      .then(() => {
        return 'Image is deleted';
      })
      .catch(() => {
        throw new Error('Image could not be deleted');
      });
  }

  async getProgressStatus() {
    return this.progress;
  }

  async getImageUrl() {
    return this.imageUrl;
  }
}

export default fileStorage;
