export const ROOT_PATH = '$';

export function joinObjectPath(parentPath, key) {
    if (parentPath === ROOT_PATH) {
        return key;
    }

    return `${parentPath}.${key}`;
}

export function joinArrayItemPath(parentPath, index) {
    return `${parentPath}[]`;
}
