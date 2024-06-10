import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from 'ckeditor5-custom-build/build/ckeditor';
import { useContext } from 'react';
import useUser from '../../hooks/useUser';
import { FirebaseContext } from '../../utils/Firebase';
import fileStorage from '../../utils/Firebase/fileStorage';
import { EditorProps } from './EditorComponent';

import './EditorComponent.scss';

class MyUploadAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: any;
  storage: fileStorage;
  location: string;
  orgId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(loader: any, storage: fileStorage, location: string, orgId: string) {
    this.loader = loader;
    this.storage = storage;
    this.location = location;
    this.orgId = orgId;
  }
  // Starts the upload process.
  upload() {
    return this.loader.file.then((file: File) => {
      return this.storage.uploadFile(file, this.location, this.orgId).then(async (result: string) => {
        return { default: result };
      });
    });
  }
}

const Editor: React.FC<EditorProps> = ({
  className,
  onChange,
  value,
  style,
  id,
  location,
  allowImage = true,
  ...rest
}) => {
  const Firebase = useContext(FirebaseContext);
  const { organizationId } = useUser();
  const storage = new fileStorage(Firebase.storage, Firebase.storageRef);

  return (
    <div
      className={(className ? className : '') + (value === null || value === undefined ? '' : ' activeEditor')}
      style={{ ...{ width: 'auto' }, ...style }}
    >
      <CKEditor
        editor={CustomEditor}
        config={allowImage ? {} : { removePlugins: ['Image'] }}
        ariaLabel={id}
        ariaOwneeID={id}
        data={value}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onReady={(editor: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return organizationId ? new MyUploadAdapter(loader, storage, location, organizationId) : null;
          };
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(event: any, editor: { getData: () => any }) => {
          const data = editor.getData();
          onChange(data);
        }}
        {...rest}
      />
    </div>
  );
};

export default Editor;
