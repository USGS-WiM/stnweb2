import { File } from '@interfaces/file';

export interface FileType {
    filetype_id: number;
    filetype: string;
    files: File[];
}
